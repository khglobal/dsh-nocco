import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCheckpoints } from '../dist/checkpoints.js';

function app() {
  const dir = mkdtempSync(join(tmpdir(), 'nocco-cp-'));
  mkdirSync(join(dir, 'pages'));
  writeFileSync(join(dir, 'pages', 'index.vue'), 'one');
  writeFileSync(join(dir, '.env'), 'SECRET=1');
  writeFileSync(join(dir, 'sqlite.db'), 'data-1');
  return dir;
}

test('saves a checkpoint, and nothing when the app has not changed', async () => {
  const dir = app(), checkpoints = createCheckpoints();
  const first = await checkpoints.save(dir, 'Created');
  assert.equal(first.label, 'Created');
  assert.equal(await checkpoints.save(dir, 'Again'), undefined);
  assert.equal((await checkpoints.list(dir)).length, 1);
});

test('names an unlabelled checkpoint by what changed', async () => {
  const dir = app(), checkpoints = createCheckpoints();
  await checkpoints.save(dir, 'Created');
  writeFileSync(join(dir, 'pages', 'index.vue'), 'two');
  writeFileSync(join(dir, 'pages', 'loans.vue'), 'new');
  const saved = await checkpoints.save(dir);
  assert.match(saved.label, /^pages\/\S+ \+1$/);
  assert.equal(saved.filesChanged, 2);
});

test('restore puts files back, removes later files, and can itself be undone', async () => {
  const dir = app(), checkpoints = createCheckpoints();
  const first = await checkpoints.save(dir, 'Created');
  writeFileSync(join(dir, 'pages', 'index.vue'), 'two');
  writeFileSync(join(dir, 'pages', 'loans.vue'), 'new');
  // Left unsaved on purpose: restore must record it before going back.
  await checkpoints.restore(dir, first.id);
  assert.equal(readFileSync(join(dir, 'pages', 'index.vue'), 'utf8'), 'one');
  assert.equal(existsSync(join(dir, 'pages', 'loans.vue')), false);
  const list = await checkpoints.list(dir);
  assert.equal(list.length, 3);
  assert.match(list[0].label, /Created/);
  await checkpoints.restore(dir, list[1].id);
  assert.equal(readFileSync(join(dir, 'pages', 'index.vue'), 'utf8'), 'two');
  assert.equal(readFileSync(join(dir, 'pages', 'loans.vue'), 'utf8'), 'new');
});

test('secrets and stored data stay out of checkpoints', async () => {
  const dir = app(), checkpoints = createCheckpoints();
  const first = await checkpoints.save(dir, 'Created');
  writeFileSync(join(dir, 'sqlite.db'), 'data-2');
  writeFileSync(join(dir, '.env'), 'SECRET=2');
  assert.equal(await checkpoints.save(dir), undefined);
  writeFileSync(join(dir, 'pages', 'index.vue'), 'two');
  await checkpoints.restore(dir, first.id);
  assert.equal(readFileSync(join(dir, 'sqlite.db'), 'utf8'), 'data-2');
  assert.equal(readFileSync(join(dir, '.env'), 'utf8'), 'SECRET=2');
  // The database is copied aside before the restore.
  const copies = readdirSync(join(dir, '.nocco', 'backups'));
  assert.equal(copies.length, 1);
  assert.equal(readFileSync(join(dir, '.nocco', 'backups', copies[0]), 'utf8'), 'data-2');
});

test('rejects an unknown checkpoint and a relative path', async () => {
  const dir = app(), checkpoints = createCheckpoints();
  await checkpoints.save(dir, 'Created');
  await assert.rejects(checkpoints.restore(dir, 'HEAD~1'), /no checkpoint/);
  await assert.rejects(checkpoints.list('relative'), /absolute/);
  rmSync(dir, { recursive: true, force: true });
});

test('an app with no checkpoints lists none', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nocco-cp-'));
  assert.deepEqual(await createCheckpoints().list(dir), []);
});
