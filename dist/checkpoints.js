import { execFile } from 'node:child_process';
import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { command, OPEN } from './permissions.js';
/** Where an app's checkpoints are kept, relative to the app. */
export const CHECKPOINT_STORE = join('.nocco', 'checkpoints.git');
/** Where copies of the database are kept before a restore, relative to the app. */
export const BACKUP_FOLDER = join('.nocco', 'backups');
/** How many database copies are kept. */
export const BACKUP_LIMIT = 10;
/** How many checkpoints a listing returns, newest first. */
export const LIST_LIMIT = 60;
/**
 * Never part of a checkpoint: installed packages, build output, secrets and
 * the database. A restore changes code only; but code defines the tables, so
 * the preview may then reshape the database to match and drop what the
 * restored version lacks. A copy of the database is kept before every restore.
 */
const EXCLUDED = ['node_modules', '.nuxt', '.output', '.data', '.nocco', '.env', '.env.*', 'sqlite.db*', 'dist'];
async function run(directory, args, access) {
    const base = [
        '--git-dir', join(directory, CHECKPOINT_STORE), '--work-tree', directory,
        '-c', 'user.name=Nocco', '-c', 'user.email=nocco@localhost',
        '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-c', 'core.autocrlf=false', '-c', 'core.quotepath=false',
    ];
    // git reads settings from the store, which lives in the app, so it runs under the same limits as the app's own code.
    const git = await command(access, 'git', [...base, ...args]);
    return new Promise((resolve, reject) => {
        execFile(git.file, git.args, { cwd: directory, maxBuffer: 16 * 1024 * 1024, env: { ...git.env, GIT_TERMINAL_PROMPT: '0' } }, (error, stdout, stderr) => {
            if (!error)
                return resolve(stdout);
            const missing = error.code === 'ENOENT';
            reject(new Error(missing ? 'checkpoints need git, which is not installed on this machine' : (stderr.trim() || error.message)));
        });
    });
}
const succeeds = (directory, args, access) => run(directory, args, access).then(() => true, () => false);
async function ensureStore(directory, access) {
    await access.inside(join(directory, CHECKPOINT_STORE));
    if (await succeeds(directory, ['rev-parse', '--git-dir'], access))
        return;
    await mkdir(join(directory, '.nocco'), { recursive: true });
    await run(directory, ['init', '--quiet'], access);
    await writeFile(join(directory, CHECKPOINT_STORE, 'info', 'exclude'), `${EXCLUDED.join('\n')}\n`);
}
/** Copy the app's database aside, keeping only the most recent copies. */
async function backUpDatabase(directory, access) {
    const folder = join(directory, BACKUP_FOLDER);
    await access.inside(folder);
    await mkdir(folder, { recursive: true });
    try {
        await copyFile(join(directory, 'sqlite.db'), join(folder, `sqlite-${new Date().toISOString().replace(/[:.]/g, '-')}.db`));
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return; // no database yet
        throw error;
    }
    const copies = (await readdir(folder)).filter((name) => /^sqlite-.*\.db$/.test(name)).sort();
    await Promise.all(copies.slice(0, -BACKUP_LIMIT).map((name) => rm(join(folder, name))));
}
function parseLog(output) {
    return output.split('\x1e').slice(1).map((entry) => {
        const [head = '', ...rest] = entry.split('\n');
        const [id = '', time = '0', label = ''] = head.split('\x1f');
        const stat = /(\d+) files? changed/.exec(rest.join('\n'));
        return { id, label, time: Number(time), filesChanged: stat ? Number(stat[1]) : 0 };
    });
}
/** Checkpoints kept in a private git store inside each app, apart from any repository of the user's. */
export function createCheckpoints() {
    // One operation at a time per app: they share an index.
    const queues = new Map();
    function queued(directory, work) {
        if (!isAbsolute(directory))
            return Promise.reject(new Error('directory must be an absolute path'));
        const next = (queues.get(directory) ?? Promise.resolve()).then(work, work);
        queues.set(directory, next.catch(() => { }));
        return next;
    }
    const read = async (directory, limit, access) => (await succeeds(directory, ['rev-parse', '--verify', '--quiet', 'HEAD'], access))
        ? parseLog(await run(directory, ['log', `-n${limit}`, '--format=%x1e%H%x1f%ct%x1f%s', '--shortstat'], access))
        : [];
    async function save(directory, label, access) {
        await ensureStore(directory, access);
        await run(directory, ['add', '--all'], access);
        const hasHead = await succeeds(directory, ['rev-parse', '--verify', '--quiet', 'HEAD'], access);
        if (hasHead && await succeeds(directory, ['diff', '--cached', '--quiet'], access))
            return undefined;
        const changed = (await run(directory, hasHead ? ['diff', '--cached', '--name-only'] : ['ls-files'], access)).split('\n').filter(Boolean);
        // Without a label, name the checkpoint by what changed.
        const fallback = changed.length > 1 ? `${changed[0]} +${changed.length - 1}` : (changed[0] ?? '-');
        const subject = (label ?? '').replace(/\s+/g, ' ').trim().slice(0, 120) || fallback;
        await run(directory, ['commit', '--quiet', '--allow-empty', '-m', subject], access);
        const [saved] = await read(directory, 1, access);
        return saved && { ...saved, filesChanged: saved.filesChanged || changed.length };
    }
    return {
        save: (directory, label, access = OPEN) => queued(directory, () => save(directory, label, access)),
        list: (directory, access = OPEN) => queued(directory, () => read(directory, LIST_LIMIT, access)),
        restore: (directory, id, access = OPEN) => queued(directory, async () => {
            const target = (await read(directory, LIST_LIMIT, access)).find((checkpoint) => checkpoint.id === id);
            if (!target)
                throw new Error('no checkpoint of this app has that id');
            // Record unsaved work first, so a restore can itself be undone.
            await save(directory, undefined, access);
            await backUpDatabase(directory, access);
            await run(directory, ['read-tree', '--reset', '-u', target.id], access);
            await run(directory, ['commit', '--quiet', '--allow-empty', '-m', `↩ ${target.label}`.slice(0, 120)], access);
            const [restored] = await read(directory, 1, access);
            return restored;
        }),
    };
}
