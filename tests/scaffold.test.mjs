import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffold } from '../dist/scaffold.js';

const fresh = () => join(mkdtempSync(join(tmpdir(), 'nocco-scaffold-')), 'app');
const ok = (calls = []) => (file, args) => { calls.push([file, ...args]); return { status: 0, output: 'done' }; };

test('rejects a relative directory', async () => {
  await assert.rejects(scaffold({ directory: 'app', appName: 'A', language: 'en' }, { run: ok() }), /absolute/);
});

test('rejects a non-empty directory and writes nothing', async () => {
  const dir = fresh();
  mkdirSync(dir);
  writeFileSync(join(dir, 'keep.txt'), 'x');
  await assert.rejects(scaffold({ directory: dir, appName: 'A', language: 'en' }, { run: ok() }), /not empty/);
  assert.ok(!existsSync(join(dir, 'package.json')));
});

test('copies the template, fills tokens and restores .gitignore', async () => {
  const dir = fresh();
  const result = await scaffold({ directory: dir, appName: 'Stock Desk', language: 'zh-CN' }, { run: ok() });
  assert.equal(result.directory, dir);
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'stock-desk');
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /<title>Stock Desk<\/title>/);
  assert.ok(existsSync(join(dir, '.gitignore')));
  assert.ok(!existsSync(join(dir, 'gitignore')));
});

test('escapes the app name in the page title', async () => {
  const dir = fresh();
  await scaffold({ directory: dir, appName: 'A <b> & C', language: 'en' }, { run: ok() });
  assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /<title>A &lt;b&gt; &amp; C<\/title>/);
});

test('prefers pnpm, falls back to npm, reports none', async () => {
  const calls = [];
  const pnpm = await scaffold({ directory: fresh(), appName: 'A', language: 'en' }, { run: ok(calls) });
  assert.equal(pnpm.packageManager, 'pnpm');
  assert.equal(pnpm.installed, true);
  assert.deepEqual(calls.at(-1), ['pnpm', 'install']);

  const npmOnly = (file) => ({ status: file === 'pnpm' ? 1 : 0, output: file });
  const npm = await scaffold({ directory: fresh(), appName: 'A', language: 'en' }, { run: npmOnly });
  assert.equal(npm.packageManager, 'npm');

  const none = await scaffold({ directory: fresh(), appName: 'A', language: 'en' }, { run: () => ({ status: 1, output: '' }) });
  assert.equal(none.packageManager, null);
  assert.equal(none.installed, false);
  assert.match(none.installOutput, /pnpm or npm/);
});

test('keeps the copied files when install fails', async () => {
  const dir = fresh();
  const failInstall = (_file, args) => ({ status: args[0] === '--version' ? 0 : 1, output: 'ERESOLVE' });
  const result = await scaffold({ directory: dir, appName: 'A', language: 'en' }, { run: failInstall });
  assert.equal(result.installed, false);
  assert.match(result.installOutput, /ERESOLVE/);
  assert.ok(existsSync(join(dir, 'package.json')));
});
