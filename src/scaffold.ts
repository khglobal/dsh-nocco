import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { FONT_STACKS, paletteCss, readPalette, resolvePalette } from './palette.js';
import { fileURLToPath } from 'node:url';

export type Runner = (file: string, args: string[], cwd: string) => { status: number | null; output: string };

/** The design systems an app can be built on; each is one template directory. */
export const DESIGN_SYSTEMS = ['antdv', 'shadcn', 'vant', 'retro'] as const;
export type DesignSystem = (typeof DESIGN_SYSTEMS)[number];

export interface ScaffoldInput {
  directory: string;
  appName: string;
  language: 'zh-CN' | 'en';
  designSystem: DesignSystem;
  /** An offered palette's id or a `#rrggbb` main colour; the template's own colours when absent or unknown. */
  palette?: string;
  /** False opens the app to everyone; otherwise every page and route needs a signed-in user. */
  signIn?: boolean;
  /** One of the offered font names; the template's own font when absent or unknown. */
  font?: string;
}

export interface ScaffoldResult {
  directory: string;
  designSystem: DesignSystem;
  packageManager: 'pnpm' | 'npm' | null;
  installed: boolean;
  installOutput: string;
  /** The first account, created when the app first starts. */
  admin: { username: string; password: string };
  /** Whether visitors must sign in before they can use the app. */
  signIn: 'required' | 'off';
}

const defaultTemplatesDir = fileURLToPath(new URL('../resources/templates', import.meta.url));

const defaultRun: Runner = (file, args, cwd) => {
  const result = spawnSync(file, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
};

const slug = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'nocco-app';

async function replaceIn(file: string, pairs: readonly (readonly [string, string])[]): Promise<void> {
  let text = await readFile(file, 'utf8');
  for (const [token, value] of pairs) text = text.split(token).join(value);
  await writeFile(file, text);
}

/**
 * Create an app from a design-system template in an empty directory: copy the
 * template and the files every template shares, fill in its name, write its
 * secrets, and install its dependencies.
 */
export async function scaffold(
  input: ScaffoldInput,
  deps: { templatesDir?: string; run?: Runner } = {},
): Promise<ScaffoldResult> {
  const { directory, appName, language, designSystem } = input;
  const palette = resolvePalette(input.palette);
  const run = deps.run ?? defaultRun;
  const templatesDir = deps.templatesDir ?? defaultTemplatesDir;
  if (!isAbsolute(directory)) throw new Error(`directory must be an absolute path: ${directory}`);
  if (!DESIGN_SYSTEMS.includes(designSystem)) {
    throw new Error(`designSystem must be one of ${DESIGN_SYSTEMS.join(', ')}: ${String(designSystem)}`);
  }

  const existing = await readdir(directory).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return [] as string[];
    throw error;
  });
  if (existing.length > 0) throw new Error(`directory is not empty: ${directory}`);

  await mkdir(directory, { recursive: true });
  await cp(join(templatesDir, designSystem), directory, { recursive: true });
  await cp(join(templatesDir, '_shared'), directory, { recursive: true });
  // npm drops .gitignore from published packages, so the template ships it
  // under another name.
  await rename(join(directory, 'gitignore'), join(directory, '.gitignore'));
  const font = FONT_STACKS[(input.font ?? '').trim().toLowerCase()];
  if (palette || font) {
    const file = join(directory, 'assets', 'css', 'design-scheme.css');
    // A font alone keeps the template's colours, which the file already holds.
    const templateCss = await readFile(file, 'utf8');
    const colours = palette ?? readPalette(Object.fromEntries(
      ['primary', 'bg', 'text', 'text-secondary', 'surface', 'border'].map((name) => [
        name === 'text-secondary' ? 'textSecondary' : name,
        new RegExp(`--nocco-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(templateCss)?.[1],
      ])));
    await writeFile(file, paletteCss(colours, font));
  }
  await replaceIn(join(directory, 'nuxt.config.ts'), [
    ['__APP_NAME_JSON__', JSON.stringify(appName)],
    ['__APP_LANG__', language],
    ['__APP_SIGN_IN__', input.signIn === false ? 'off' : 'required'],
  ]);
  await replaceIn(join(directory, 'package.json'), [['__APP_SLUG__', slug(appName)]]);

  const admin = { username: 'admin', password: randomBytes(9).toString('base64url') };
  await writeFile(
    join(directory, '.env'),
    `NUXT_SESSION_PASSWORD=${randomBytes(32).toString('hex')}\nNOCCO_ADMIN_PASSWORD=${admin.password}\n`,
    { mode: 0o600 },
  );

  const base = { directory, designSystem, admin, signIn: input.signIn === false ? 'off' as const : 'required' as const };
  const packageManager = (['pnpm', 'npm'] as const).find((name) => run(name, ['--version'], directory).status === 0) ?? null;
  if (!packageManager) {
    return { ...base, packageManager, installed: false, installOutput: 'pnpm or npm was not found on this machine; install one and run its install command in the app directory.' };
  }
  const install = run(packageManager, ['install'], directory);
  return { ...base, packageManager, installed: install.status === 0, installOutput: install.output.slice(-4000) };
}
