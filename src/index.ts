import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-skill';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { readFileSync } from 'node:fs';
import { createPreviewManager } from './preview.js';
import { scaffold } from './scaffold.js';

export const name = 'dsh-nocco';
/** Both services are required: without them the plugin has nothing to offer. */
export const inject: readonly string[] = ['tools', 'skills'];

const json = {
  schema: { type: 'object', additionalProperties: true },
  render: (_args: unknown, value: unknown) => [{ type: 'text' as const, text: JSON.stringify(value) }],
} as const;

export function apply(ctx: Context): void {
  const previews = createPreviewManager();

  ctx.skills.register({
    name: 'nocco',
    description: 'Build a Vue 3 + Element Plus web app on this machine with a live preview.',
    whenToUse: 'The user wants a web app, admin tool or internal system built or changed.',
    source: 'custom',
    content: readFileSync(new URL('../resources/skill/SKILL.md', import.meta.url), 'utf8'),
  });

  ctx.tools.register(defineTool({
    name: 'nocco_scaffold',
    description: 'Create a new Vue 3 + Element Plus app in an empty directory and install its dependencies. Fails if the directory is not empty.',
    parameters: {
      directory: { type: 'string', required: true, description: 'Absolute path of the directory to create the app in' },
      appName: { type: 'string', required: true, description: 'Name shown in the page title' },
      language: { type: 'string', description: 'Interface language of the app: zh-CN or en. Defaults to zh-CN' },
    },
    output: json,
    async execute(args) {
      return { ...(await scaffold({
        directory: args.directory,
        appName: args.appName,
        language: args.language === 'en' ? 'en' : 'zh-CN',
      })) };
    },
  }));

  ctx.tools.register(defineTool({
    name: 'nocco_preview',
    description: 'Start, stop or check the local dev server of an app made by nocco_scaffold. Returns whether it is running, its loopback URL, and recent server output including compile errors.',
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
