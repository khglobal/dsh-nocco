import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importFile, toTable, SAMPLE_ROWS, TEXT_LIMIT } from '../dist/import.js';

const dir = () => mkdtempSync(join(tmpdir(), 'nocco-import-'));

test('a grid becomes a table with typed columns', () => {
  const table = toTable('Sheet1', [
    [null, null, null],
    ['Name', 'Qty', 'Name', 'Due'],
    ['Drill', 2, 'a', new Date('2026-01-02T00:00:00Z')],
    [null, null, null, null],
    ['Saw', null, 'b', new Date('2026-02-03T00:00:00Z')],
  ]);
  assert.deepEqual(table.columns.map((column) => [column.name, column.type, column.blanks]),
    [['Name', 'text', 0], ['Qty', 'number', 1], ['Name_2', 'text', 0], ['Due', 'date', 0]]);
  assert.equal(table.rowCount, 2);
  assert.equal(table.rows[0].Due, '2026-01-02T00:00:00.000Z');
});

test('a CSV file is summarised and every row is saved into the app', async () => {
  const from = dir(), app = dir();
  const lines = ['name,qty,code'];
  for (let index = 0; index < 40; index += 1) lines.push(`"Item, ${index}",${index},00${index}`);
  writeFileSync(join(from, 'Stock List.csv'), `﻿${lines.join('\n')}\n`);
  const result = await importFile({ file: join(from, 'Stock List.csv'), directory: app });
  assert.equal(result.kind, 'tables');
  assert.equal(result.tables[0].rowCount, 40);
  assert.equal(result.tables[0].sample.length, SAMPLE_ROWS);
  assert.equal('rows' in result.tables[0], false);
  assert.deepEqual(result.tables[0].columns.map((column) => column.type), ['text', 'number', 'text']);
  assert.equal(result.dataFile, join(app, 'server', 'db', 'import', 'stock-list.json'));
  const saved = JSON.parse(readFileSync(result.dataFile, 'utf8'));
  assert.equal(saved.tables[0].rows.length, 40);
  assert.deepEqual(saved.tables[0].rows[3], { name: 'Item, 3', qty: 3, code: '003' });
});

test('a file named in another script keeps its name', async () => {
  const from = dir(), app = dir();
  writeFileSync(join(from, '示例 表格.csv'), 'a\n1\n');
  const result = await importFile({ file: join(from, '示例 表格.csv'), directory: app });
  assert.equal(result.dataFile, join(app, 'server', 'db', 'import', '示例-表格.json'));
});

test('without an app, a table file is only described', async () => {
  const from = dir();
  writeFileSync(join(from, 'a.tsv'), 'x\ty\n1\t2\n');
  const result = await importFile({ file: join(from, 'a.tsv') });
  assert.equal(result.dataFile, undefined);
  assert.deepEqual(result.tables[0].sample, [{ x: 1, y: 2 }]);
});

test('a Markdown file is returned as text, cut at the limit', async () => {
  const from = dir();
  writeFileSync(join(from, 'spec.md'), `# Spec\n${'x'.repeat(TEXT_LIMIT + 10)}`);
  const result = await importFile({ file: join(from, 'spec.md') });
  assert.equal(result.kind, 'document');
  assert.equal(result.text.length, TEXT_LIMIT);
  assert.equal(result.truncated, true);
  assert.equal(result.length, TEXT_LIMIT + 17);
});

test('rejects relative paths and unsupported types', async () => {
  await assert.rejects(importFile({ file: 'a.csv' }), /absolute/);
  await assert.rejects(importFile({ file: '/tmp/a.pdf' }), /cannot read \.pdf/);
});
