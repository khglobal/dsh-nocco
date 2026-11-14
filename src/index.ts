import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-skill';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { readFileSync } from 'node:fs';
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
    },
    output: json,
    async execute(args) {
      return { ...(await scaffold({
        directory: args.directory,
        appName: args.appName,
        language: args.language === 'en' ? 'en' : 'zh-CN',
        designSystem: DESIGN_SYSTEMS.includes(args.designSystem as DesignSystem) ? (args.designSystem as DesignSystem) : 'antdv',
      })) };
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

  // Registrations are released with the plugin's fiber; the dev servers are
  // child processes and must be stopped explicitly.
  ctx.effect(() => () => { void previews.stopAll(); });
}
