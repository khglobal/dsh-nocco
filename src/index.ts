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
    description: 'Create a new web system from a Nocco template in an empty directory and install its dependencies. The app comes with sign-in, roles and a SQLite database. Returns the admin account for the first sign-in. Fails if the directory is not empty.',
    parameters: {
      directory: { type: 'string', required: true, description: 'Absolute path of the directory to create the app in' },
      appName: { type: 'string', required: true, description: 'Name shown in the page title' },
      language: { type: 'string', description: 'Interface language of the app: zh-CN or en. Defaults to zh-CN' },
      designSystem: { type: 'string', description: 'antdv (Ant Design Vue, desktop admin systems), shadcn (shadcn with Tailwind, modern web apps) or vant (Vant, mobile apps). Defaults to antdv' },
      palette: { type: 'string', description: 'Colour palette of the app: violet, navy, emerald, amber, rose, night, or a #rrggbb main colour. Defaults to the template\'s own colours' },
    },
    output: json,
    async execute(args) {
      const created = await scaffold({
        directory: args.directory,
        appName: args.appName,
        language: args.language === 'en' ? 'en' : 'zh-CN',
        designSystem: DESIGN_SYSTEMS.includes(args.designSystem as DesignSystem) ? (args.designSystem as DesignSystem) : 'antdv',
        palette: args.palette,
      });
      // The untouched template is the first point the user can return to.
      await checkpoints.save(created.directory, args.appName).catch(() => undefined);
      return { ...created };
    },
  }));

  ctx.tools.register(defineTool({
    name: 'nocco_preview',
    description: 'Start, stop or check the local dev server of an app made by nocco_scaffold. Returns whether it is running, its loopback URL, and recent server output including compile errors and the result of applying the database schema.',
    parameters: {
      action: { type: 'string', required: true, description: 'start, stop or status' },
      directory: { type: 'string', required: true, description: 'Absolute path of the app directory' },
    },
    output: json,
    async execute(args) {
      if (args.action === 'start') return { ...(await previews.start(args.directory)) };
      if (args.action === 'stop') return { ...(await previews.stop(args.directory)) };
      if (args.action === 'status') return { ...previews.status(args.directory) };
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
