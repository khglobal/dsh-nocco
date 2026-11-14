import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { saveUpload, UPLOAD_LIMIT } from '../dist/home-api.js';
import { fontIn, paletteCss, PALETTES } from '../dist/palette.js';

const root = () => mkdtempSync(join(tmpdir(), 'nocco-upload-'));

test('an attached file is kept under its own name in its own folder', async () => {
  const base = root();
  const saved = await saveUpload('销售 明细.xlsx', new TextEncoder().encode('data'), base);
  assert.equal(saved.name, '销售 明细.xlsx');
  assert.equal(dirname(dirname(saved.path)), base);
  assert.equal(readFileSync(saved.path, 'utf8'), 'data');
});

test('a name cannot place the file outside its folder', async () => {
  const base = root();
  const saved = await saveUpload('../../etc/passwd', new Uint8Array([1]), base);
  assert.equal(saved.name, 'passwd');
  assert.equal(dirname(dirname(saved.path)), base);
  const windows = await saveUpload('C:\\Users\\a\\b.csv', new Uint8Array([1]), base);
  assert.equal(windows.name, 'b.csv');
});

test('empty, nameless and oversized files are refused', async () => {
  const base = root();
  await assert.rejects(saveUpload('a.csv', new Uint8Array(0), base), /empty/);
  await assert.rejects(saveUpload('..', new Uint8Array([1]), base), /no usable name/);
  await assert.rejects(saveUpload('', new Uint8Array([1]), base), /no usable name/);
  await assert.rejects(saveUpload('a.csv', { byteLength: UPLOAD_LIMIT + 1 }, base), /larger than/);
});

test('recolouring keeps the font recorded in the scheme', () => {
  const { id: _id, ...navy } = PALETTES.find((palette) => palette.id === 'navy');
  const css = paletteCss(navy, "Georgia, serif");
  assert.equal(fontIn(css), 'Georgia, serif');
  assert.equal(fontIn(paletteCss(navy)), undefined);
});
