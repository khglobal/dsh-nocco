import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffold, DESIGN_SYSTEMS } from '../dist/scaffold.js';

const fresh = () => join(mkdtempSync(join(tmpdir(), 'nocco-scaffold-')), 'app');
const ok = (calls = []) => (file, args) => { calls.push([file, ...args]); return { status: 0, output: 'done' }; };
const input = (directory, extra = {}) => ({ directory, appName: 'A', language: 'en', designSystem: 'antdv', ...extra });

test('rejects a relative directory', async () => {
  await assert.rejects(scaffold(input('app'), { run: ok() }), /absolute/);
});

test('rejects an unknown design system', async () => {
  await assert.rejects(scaffold(input(fresh(), { designSystem: 'bootstrap' }), { run: ok() }), /designSystem must be one of/);
});

test('rejects a non-empty directory and writes nothing', async () => {
  const dir = fresh();
  mkdirSync(dir);
  writeFileSync(join(dir, 'keep.txt'), 'x');
  await assert.rejects(scaffold(input(dir), { run: ok() }), /not empty/);
  assert.ok(!existsSync(join(dir, 'package.json')));
});

test('every design system gets its own pages plus the shared sign-in code', async () => {
  for (const designSystem of DESIGN_SYSTEMS) {
    const dir = fresh();
    const result = await scaffold(input(dir, { designSystem }), { run: ok() });
    assert.equal(result.designSystem, designSystem);
    for (const file of ['nuxt.config.ts', 'pages/index.vue', 'pages/login.vue', 'server/db/schema.ts',
      'server/api/auth/login.post.ts', 'server/middleware/auth.ts', 'composables/useAuth.ts',
      'middleware/auth.global.ts', 'drizzle.config.ts', 'pnpm-workspace.yaml', '.gitignore']) {
      assert.ok(existsSync(join(dir, file)), `${designSystem}: ${file}`);
    }
    assert.ok(!existsSync(join(dir, 'gitignore')));
  }
});

test('fills in the name and language', async () => {
  const dir = fresh();
  await scaffold(input(dir, { appName: 'Stock "Desk"', language: 'zh-CN' }), { run: ok() });
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'stock-desk');
  const config = readFileSync(join(dir, 'nuxt.config.ts'), 'utf8');
  assert.ok(config.includes('title: "Stock \\"Desk\\""'), config);
  assert.ok(config.includes("lang: 'zh-CN'"));
  assert.ok(!config.includes('__APP_'));
});

test('writes fresh secrets and returns the admin account', async () => {
  const first = await scaffold(input(fresh()), { run: ok() });
  const second = await scaffold(input(fresh()), { run: ok() });
  const env = readFileSync(join(first.directory, '.env'), 'utf8');
  assert.match(env, /^NUXT_SESSION_PASSWORD=[0-9a-f]{64}$/m);
  assert.ok(env.includes(`NOCCO_ADMIN_PASSWORD=${first.admin.password}`));
  assert.equal(first.admin.username, 'admin');
  assert.ok(first.admin.password.length >= 12);
  assert.notEqual(first.admin.password, second.admin.password);
});

test('prefers pnpm, falls back to npm, reports none', async () => {
  const calls = [];
  const pnpm = await scaffold(input(fresh()), { run: ok(calls) });
  assert.equal(pnpm.packageManager, 'pnpm');
  assert.equal(pnpm.installed, true);
  assert.deepEqual(calls.at(-1), ['pnpm', 'install']);

  const npmOnly = (file) => ({ status: file === 'pnpm' ? 1 : 0, output: file });
  assert.equal((await scaffold(input(fresh()), { run: npmOnly })).packageManager, 'npm');

  const none = await scaffold(input(fresh()), { run: () => ({ status: 1, output: '' }) });
  assert.equal(none.packageManager, null);
  assert.equal(none.installed, false);
  assert.match(none.installOutput, /pnpm or npm/);
});

test('keeps the copied files when install fails', async () => {
  const dir = fresh();
  const failInstall = (_file, args) => ({ status: args[0] === '--version' ? 0 : 1, output: 'ERESOLVE' });
  const result = await scaffold(input(dir), { run: failInstall });
  assert.equal(result.installed, false);
  assert.match(result.installOutput, /ERESOLVE/);
  assert.ok(existsSync(join(dir, 'package.json')));
});

test('a palette is written into the app; an unknown one leaves the template colours', async () => {
  const css = (dir) => readFileSync(join(dir, 'assets', 'css', 'design-scheme.css'), 'utf8');
  const named = fresh(), custom = fresh(), unknown = fresh(), plain = fresh();
  await scaffold(input(named, { palette: 'Emerald' }), { run: ok() });
  await scaffold(input(custom, { palette: '#112233' }), { run: ok() });
  await scaffold(input(unknown, { palette: 'sparkly' }), { run: ok() });
  await scaffold(input(plain), { run: ok() });
  assert.match(css(named), /--nocco-primary: #0f9d76;/);
  assert.match(css(custom), /--nocco-primary: #112233;/);
  assert.equal(css(unknown), css(plain));
});
