import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPreviewManager } from '../dist/preview.js';

const stub = fileURLToPath(new URL('./fixtures/stub-server.mjs', import.meta.url));
const manager = (mode = 'ok', readyTimeoutMs = 5000, sync) => createPreviewManager({
  readyTimeoutMs,
  sync,
  command: (_dir, port) => ({ file: process.execPath, args: [stub, String(port), mode] }),
});
const dir = process.cwd();

test('start serves on loopback and reports the URL', async () => {
  const previews = manager();
  try {
    const state = await previews.start(dir);
    assert.equal(state.running, true);
    assert.match(state.url, /^http:\/\/127\.0\.0\.1:\d+\/$/);
    assert.equal((await fetch(state.url)).status, 200);
    assert.ok(state.output.some((line) => line.includes('stub starting')));
  } finally { await previews.stopAll(); }
});

test('starting twice reuses the running server', async () => {
  const previews = manager();
  try {
    const first = await previews.start(dir);
    const second = await previews.start(dir);
    assert.equal(second.url, first.url);
  } finally { await previews.stopAll(); }
});

test('stop ends the server and status reflects it', async () => {
  const previews = manager();
  const { url } = await previews.start(dir);
  const stopped = await previews.stop(dir);
  assert.equal(stopped.running, false);
  assert.equal(previews.status(dir).running, false);
  await assert.rejects(fetch(url));
});

test('a server that exits reports its output', async () => {
  const previews = manager('crash');
  await assert.rejects(previews.start(dir), /boom: cannot compile/);
  assert.equal(previews.status(dir).running, false);
});

test('a server that never answers times out and is killed', async () => {
  const previews = manager('hang', 600);
  await assert.rejects(previews.start(dir), /did not start/);
  assert.equal(previews.status(dir).running, false);
});

test('stopAll ends every server', async () => {
  const previews = manager();
  const { url } = await previews.start(dir);
  await previews.stopAll();
  await assert.rejects(fetch(url));
});

test('sync work runs before start and again when its file changes', async () => {
  const app = mkdtempSync(join(tmpdir(), 'nocco-sync-'));
  mkdirSync(join(app, 'db'));
  writeFileSync(join(app, 'db', 'schema.ts'), 'one');
  let runs = 0;
  const previews = manager('ok', 5000, { file: join('db', 'schema.ts'), run: async () => [`synced ${(runs += 1)}`] });
  try {
    const started = await previews.start(app);
    assert.ok(started.output.includes('synced 1'));
    writeFileSync(join(app, 'db', 'schema.ts'), 'two');
    for (let i = 0; i < 40 && runs < 2; i += 1) await new Promise((wait) => setTimeout(wait, 100));
    assert.ok(previews.status(app).output.includes('synced 2'));
  } finally { await previews.stopAll(); }
});

test('a failing sync is reported and does not stop the server', async () => {
  const app = mkdtempSync(join(tmpdir(), 'nocco-sync-'));
  const previews = manager('ok', 5000, { file: 'schema.ts', run: async () => { throw new Error('bad schema'); } });
  try {
    const started = await previews.start(app);
    assert.equal(started.running, true);
    assert.ok(started.output.some((line) => line.includes('bad schema')));
  } finally { await previews.stopAll(); }
});
