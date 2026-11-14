import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { watch, type FSWatcher } from 'node:fs';
import { createServer } from 'node:net';
import { basename, dirname, join, resolve } from 'node:path';

export interface PreviewState {
  running: boolean;
  url?: string;
  output: string[];
}

export interface PreviewManager {
  start(directory: string): Promise<PreviewState>;
  status(directory: string): PreviewState;
  stop(directory: string): Promise<PreviewState>;
  stopAll(): Promise<void>;
  /** The apps being served right now. */
  list(): { directory: string; url: string }[];
}

/**
 * Work that must be repeated whenever one file of the app changes, such as
 * applying the database schema. It also runs once before the server starts.
 */
export interface PreviewSync {
  /** Path of the watched file, relative to the app directory. */
  file: string;
  /** Does the work and returns lines to show in the preview output. */
  run(directory: string): Promise<string[]>;
}

interface Entry {
  child: ChildProcess;
  url: string;
  /** Results of the latest sync run; kept apart so server logs cannot push them out. */
  notes: string[];
  output: string[];
  exited: boolean;
  watcher?: FSWatcher;
}

const OUTPUT_LINES = 60;
const ATTEMPTS = 3;
const SYNC_DEBOUNCE_MS = 400;
// shadcn-nuxt prints one of these per component on every start. They are
// harmless and would otherwise fill the whole output window.
const NOISE = /^\s*WARN\s+Overriding \S+ component\./;

const nuxtCommand = (directory: string, port: number) => ({
  file: join(directory, 'node_modules', '.bin', process.platform === 'win32' ? 'nuxi.cmd' : 'nuxi'),
  args: ['dev', '--host', '127.0.0.1', '--port', String(port)],
});

function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const server = createServer();
    server.once('error', fail);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => done(port));
    });
  });
}

function kill(child: ChildProcess): void {
  if (child.pid === undefined || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    return;
  }
  // The child leads its own process group, so this also ends its children.
  try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); }
}

async function answers(url: string): Promise<boolean> {
  try { await fetch(url, { signal: AbortSignal.timeout(2000) }); return true; } catch { return false; }
}

/** One dev server per app directory, bound to loopback. */
export function createPreviewManager(options: {
  command?: (directory: string, port: number) => { file: string; args: string[] };
  readyTimeoutMs?: number;
  sync?: PreviewSync;
} = {}): PreviewManager {
  const command = options.command ?? nuxtCommand;
  const readyTimeoutMs = options.readyTimeoutMs ?? 60000;
  const sync = options.sync;
  const entries = new Map<string, Entry>();
  const snapshot = (entry: Entry | undefined): PreviewState =>
    entry && !entry.exited
      ? { running: true, url: entry.url, output: [...entry.notes, ...entry.output] }
      : { running: false, output: entry ? [...entry.notes, ...entry.output] : [] };
  // Resolves once the process has ended and its output has been collected.
  const closed = (entry: Entry): Promise<void> =>
    entry.exited ? Promise.resolve() : new Promise((done) => entry.child.once('close', () => done()));
  const append = (entry: Entry, lines: readonly string[]): void => {
    entry.output.push(...lines.filter((line) => line.trim() && !NOISE.test(line)));
    entry.output.splice(0, Math.max(0, entry.output.length - OUTPUT_LINES));
  };
  const runSync = async (directory: string): Promise<string[]> => {
    if (!sync) return [];
    try { return await sync.run(directory); } catch (error) { return [`[sync] ${String(error)}`]; }
  };

  // Dev servers run in their own process groups, so they would outlive the
  // host if it exits without disposing the plugin. End them on the way out.
  process.once('exit', () => {
    for (const entry of entries.values()) kill(entry.child);
  });

  /** Re-run the sync work whenever the watched file settles after a change. */
  function watchSync(directory: string, entry: Entry): void {
    if (!sync) return;
    const target = join(directory, sync.file);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // Watch the folder, not the file: editors replace files on save, which
      // ends a watch placed on the file itself.
      entry.watcher = watch(dirname(target), (_event, name) => {
        if (name !== basename(target) || entry.exited) return;
        clearTimeout(timer);
        timer = setTimeout(() => { void runSync(directory).then((lines) => { entry.notes = lines; }); }, SYNC_DEBOUNCE_MS);
      });
      entry.watcher.on('error', () => {});
    } catch { /* the folder does not exist yet: nothing to watch */ }
  }

  async function launch(directory: string, preface: readonly string[]): Promise<Entry> {
    const port = await freePort();
    const { file, args } = command(directory, port);
    const child = spawn(file, args, {
      cwd: directory,
      detached: process.platform !== 'win32',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const entry: Entry = { child, url: `http://127.0.0.1:${port}/`, notes: [...preface], output: [], exited: false };
    const collect = (chunk: Buffer): void => append(entry, chunk.toString('utf8').split('\n').map((line) => line.trimEnd()));
    child.stdout?.on('data', collect);
    child.stderr?.on('data', collect);
    child.once('error', (error) => { entry.output.push(String(error)); entry.exited = true; });
    // 'close' fires after the output streams end, so the captured output is
    // complete by the time an early exit is reported.
    child.once('close', () => { entry.exited = true; entry.watcher?.close(); });
    return entry;
  }

  return {
    async start(input) {
      const directory = resolve(input);
      const current = entries.get(directory);
      if (current && !current.exited) return snapshot(current);

      const preface = await runSync(directory);
      let last: Entry | undefined;
      for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
        const entry = await launch(directory, preface);
        last = entry;
        const deadline = Date.now() + readyTimeoutMs;
        while (!entry.exited && Date.now() < deadline) {
          if (await answers(entry.url)) {
            entries.set(directory, entry);
            watchSync(directory, entry);
            return snapshot(entry);
          }
          await new Promise((wait) => setTimeout(wait, 150));
        }
        if (!entry.exited) {
          kill(entry.child);
          await closed(entry);
          entries.set(directory, entry);
          throw new Error(`dev server did not start within ${readyTimeoutMs} ms\n${entry.output.join('\n')}`);
        }
        // Exited before answering. A lost port race is worth one more try on a
        // new port; any other exit is a real failure.
        if (!entry.output.some((line) => /EADDRINUSE|already in use/i.test(line))) break;
      }
      if (last) entries.set(directory, last);
      throw new Error(`dev server exited before it was ready\n${last?.output.join('\n') ?? ''}`);
    },

    status(input) {
      return snapshot(entries.get(resolve(input)));
    },

    async stop(input) {
      const entry = entries.get(resolve(input));
      if (entry && !entry.exited) {
        kill(entry.child);
        await closed(entry);
      }
      return snapshot(entry);
    },

    list() {
      return [...entries].flatMap(([directory, entry]) => (entry.exited ? [] : [{ directory, url: entry.url }]));
    },

    async stopAll() {
      const running = [...entries.values()].filter((entry) => !entry.exited);
      for (const entry of running) kill(entry.child);
      await Promise.all(running.map((entry) => closed(entry)));
    },
  };
}
