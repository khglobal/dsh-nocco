import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Runner = (file: string, args: string[], cwd: string) => { status: number | null; output: string };

export interface ScaffoldInput {
  directory: string;
  appName: string;
  language: 'zh-CN' | 'en';
}

export interface ScaffoldResult {
  directory: string;
  packageManager: 'pnpm' | 'npm' | null;
  installed: boolean;
  installOutput: string;
}

const defaultTemplateDir = fileURLToPath(new URL('../resources/template', import.meta.url));

const defaultRun: Runner = (file, args, cwd) => {
  const result = spawnSync(file, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
};

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'nocco-app';

async function replaceIn(file: string, pairs: readonly (readonly [string, string])[]): Promise<void> {
  let text = await readFile(file, 'utf8');
  for (const [token, value] of pairs) text = text.split(token).join(value);
  await writeFile(file, text);
}

/** Copy the template into an empty directory and install its dependencies. */
export async function scaffold(
  input: ScaffoldInput,
  deps: { templateDir?: string; run?: Runner } = {},
): Promise<ScaffoldResult> {
  const { directory, appName, language } = input;
  const run = deps.run ?? defaultRun;
  if (!isAbsolute(directory)) throw new Error(`directory must be an absolute path: ${directory}`);

  const existing = await readdir(directory).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return [] as string[];
    throw error;
  });
  if (existing.length > 0) throw new Error(`directory is not empty: ${directory}`);

  await mkdir(directory, { recursive: true });
  await cp(deps.templateDir ?? defaultTemplateDir, directory, { recursive: true });
  await rename(join(directory, 'gitignore'), join(directory, '.gitignore'));
  await replaceIn(join(directory, 'index.html'), [['__APP_NAME__', escapeHtml(appName)], ['__APP_LANG__', language]]);
  await replaceIn(join(directory, 'package.json'), [['__APP_SLUG__', slug(appName)]]);

  const packageManager = (['pnpm', 'npm'] as const).find((name) => run(name, ['--version'], directory).status === 0) ?? null;
  if (!packageManager) {
    return { directory, packageManager, installed: false, installOutput: 'pnpm or npm was not found on this machine; install one and run its install command in the app directory.' };
  }
  const install = run(packageManager, ['install'], directory);
  return { directory, packageManager, installed: install.status === 0, installOutput: install.output.slice(-4000) };
}
