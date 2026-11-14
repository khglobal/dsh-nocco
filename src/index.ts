import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-skill';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { readFileSync } from 'node:fs';
import { createCheckpoints, type Checkpoint } from './checkpoints.js';
import { registerHomeApi } from './home-api.js';
import { importFile } from './import.js';
import { createPreviewManager } from './preview.js';
import { DESIGN_SYSTEMS, scaffold, type DesignSystem } from './scaffold.js';
import { schemaSync } from './schema-sync.js';

export const name = 'dsh-nocco';
/** Both services are required: without them the plugin has nothing to offer. */
export const inject: readonly string[] = ['tools', 'skills'];

const json = {
  schema: { type: 'object', additionalProperties: true },
  render: (_args: unknown, value: unknown) => [{ type: 'text' as const, text: JSON.stringify(value) }],
} as const;

/** Runtime errors the app's pages reported since the last call; none when the app cannot be asked. */
async function browserErrors(url: string | undefined): Promise<{ message: string; page: string }[]> {
  if (!url) return [];
  try {
    const response = await fetch(new URL('api/_nocco/errors', url), { signal: AbortSignal.timeout(3000) });
    const body = await response.json() as { errors?: { message: string; page: string }[] };
    return (body.errors ?? []).map(({ message, page }) => ({ message, page }));
  } catch { return []; }
}

export function apply(ctx: Context): void {
  const previews = createPreviewManager({ sync: schemaSync });
  const checkpoints = createCheckpoints();

  ctx.skills.register({
    name: 'nocco',
    description: 'Build a web system on this machine from a Nocco template, with sign-in, roles, stored data and a live preview.',
    whenToUse: 'The user wants a web app, admin tool or internal system built or changed.',
    source: 'custom',
    content: readFileSync(new URL('../resources/skill/SKILL.md', import.meta.url), 'utf8'),
  });

  ctx.tools.register(defineTool({
    name: 'nocco_scaffold',
    description: 'Create a new web system from a Nocco template in an empty directory and install its dependencies. The app comes with sign-in, roles and a SQLite database; sign-in can be switched off for an app anyone may open. Returns the admin account for the first sign-in. Fails if the directory is not empty.',
    parameters: {
      directory: { type: 'string', required: true, description: 'Absolute path of the directory to create the app in' },
      appName: { type: 'string', required: true, description: 'Name shown in the page title' },
      language: { type: 'string', required: true, description: 'Interface language of the app: zh-CN or en. The language the request names; when it names none, the language the user is writing in' },
      designSystem: { type: 'string', description: 'antdv (Ant Design Vue, desktop admin systems), shadcn (shadcn with Tailwind, modern web apps), vant (Vant, mobile apps) or retro (the look of a 1990s web page). Defaults to antdv' },
      palette: { type: 'string', description: 'Colour palette of the app: violet, navy, emerald, amber, rose, night, or a #rrggbb main colour. Defaults to the template\'s own colours' },
      font: { type: 'string', description: 'Font of the app: sans-serif, serif, monospace, cursive or fantasy. Defaults to the template\'s own font' },
      signIn: { type: 'string', description: 'required (the default): every page and server route needs a signed-in user. off: the app opens straight to its first page for anyone' },
    },
    output: json,
    async execute(args) {
      const created = await scaffold({
        directory: args.directory,
        appName: args.appName,
        language: /^zh/i.test(args.language.trim()) ? 'zh-CN' : 'en',
        designSystem: DESIGN_SYSTEMS.includes(args.designSystem as DesignSystem) ? (args.designSystem as DesignSystem) : 'antdv',
        palette: args.palette,
        font: args.font,
        signIn: args.signIn !== 'off',
      });
      // The untouched template is the first point the user can return to.
      await checkpoints.save(created.directory, args.appName).catch(() => undefined);
      // The map of what the template provides saves the agent reading it file by file.
      const guide = ['common', created.designSystem]
        .map((part) => readFileSync(new URL(`../resources/guide/${part}.md`, import.meta.url), 'utf8')).join('');
      return { ...created, guide };
    },
  }));

  ctx.tools.register(defineTool({
    name: 'nocco_preview',
    description: 'Start, stop or check the local dev server of an app made by nocco_scaffold. Returns whether it is running, its loopback URL, and recent server output including compile errors and the result of applying the database schema. status also returns browserErrors: runtime errors from pages the user has opened in the preview since the last status call.',
    parameters: {
      action: { type: 'string', required: true, description: 'start, stop or status' },
      directory: { type: 'string', required: true, description: 'Absolute path of the app directory' },
    },
    output: json,
    async execute(args) {
      if (args.action === 'start') return { ...(await previews.start(args.directory)) };
      if (args.action === 'stop') return { ...(await previews.stop(args.directory)) };
      if (args.action === 'status') {
        const status = previews.status(args.directory);
        return { ...status, browserErrors: await browserErrors(status.url) };
      }
      throw new Error('action must be start, stop or status');
    },
  }));

  ctx.tools.register(defineTool({
    name: 'nocco_checkpoint',
    description: 'Save, list or restore checkpoints of an app made by nocco_scaffold. A checkpoint records the app\'s files; restoring one puts the files back as they were and keeps the state before the restore as a checkpoint of its own. Stored data is not part of a checkpoint, but a restored version with different tables loses the data it has no place for; the database is copied to .nocco/backups before every restore. The user sees checkpoints as a timeline beside the preview.',
    parameters: {
      action: { type: 'string', required: true, description: 'save, list or restore' },
      directory: { type: 'string', required: true, description: 'Absolute path of the app directory' },
      label: { type: 'string', description: 'For save: a short phrase, in the user\'s language, naming what changed' },
      id: { type: 'string', description: 'For restore: the id of a checkpoint from list' },
    },
    output: json,
    async execute(args) {
      let outcome: { saved: Checkpoint | null } | { checkpoints: Checkpoint[] } | { restored: Checkpoint };
      if (args.action === 'save') outcome = { saved: (await checkpoints.save(args.directory, args.label)) ?? null };
      else if (args.action === 'list') outcome = { checkpoints: await checkpoints.list(args.directory) };
      else if (args.action === 'restore') outcome = { restored: await checkpoints.restore(args.directory, String(args.id ?? '')) };
      else throw new Error('action must be save, list or restore');
      return outcome;
    },
  }));

  ctx.tools.register(defineTool({
    name: 'nocco_import',
    description: 'Read a file the user wants a system built from. Excel (.xlsx), CSV and TSV files are returned as tables: each table\'s columns with their kinds, the row count and a few rows; when directory is given, every row is also saved to a JSON data file inside that app and its path is returned. Word (.docx), Markdown and text files are returned as text.',
    parameters: {
      file: { type: 'string', required: true, description: 'Absolute path of the file to read' },
      directory: { type: 'string', description: 'Absolute path of the app that will hold the rows of a table file' },
    },
    output: json,
    async execute(args) {
      return { ...(await importFile({ file: args.file, directory: args.directory || undefined })) };
    },
  }));

  // When an agent finishes working, record every app being previewed that has
  // changed, so each round of work is a point the user can return to even if
  // the agent saved no checkpoint itself.
  const events = ctx as unknown as { on(name: string, listener: (payload: { status?: string }) => void): unknown };
  events.on('agent/status', (payload) => {
    if (payload?.status !== 'idle') return;
    for (const preview of previews.list()) void checkpoints.save(preview.directory).catch(() => undefined);
  });

  // Registrations are released with the plugin's fiber; the dev servers are
  // child processes and must be stopped explicitly.
  registerHomeApi(ctx, previews, checkpoints);
  ctx.effect(() => () => { void previews.stopAll(); });
}
