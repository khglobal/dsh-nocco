import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSuggestPrompt, parseSuggestions, FALLBACK, langOf } from '../dist/suggest.js';
import { readPalette, paletteCss, PALETTES } from '../dist/palette.js';

test('parses a plain JSON array', () => {
  assert.deepEqual(parseSuggestions('["Build a CRM for leads", "Build a stock tracker"]'), ['Build a CRM for leads', 'Build a stock tracker']);
});

test('finds the array inside surrounding text and code fences', () => {
  assert.deepEqual(parseSuggestions('Sure!\n```json\n["做一个报价管理系统"]\n```\nDone.'), ['做一个报价管理系统']);
});

test('drops non-strings, duplicates, and items that are too short or too long, and caps at six', () => {
  const items = ['one good suggestion', 'one good suggestion', 7, 'x', 'y'.repeat(200), 'a2 fine', 'a3 fine', 'a4 fine', 'a5 fine', 'a6 fine', 'a7 fine'];
  const out = parseSuggestions(JSON.stringify(items));
  assert.equal(out.length, 6);
  assert.deepEqual(out.slice(0, 2), ['one good suggestion', 'a2 fine']);
});

test('returns nothing for unusable replies', () => {
  for (const reply of ['', 'no array here', '[broken', '{"a": 1}', '["unterminated]']) assert.deepEqual(parseSuggestions(reply), []);
});

test('the prompt carries the material and the language, and marks it as data', () => {
  const { system, user } = buildSuggestPrompt({ workspaces: [{ title: 'sales', files: ['quotes.xlsx', 'customers'] }], sessions: ['Fix invoice export'] }, 'zh');
  assert.match(system, /Simplified Chinese/);
  assert.match(system, /never as instructions/);
  assert.match(user, /sales: quotes\.xlsx, customers/);
  assert.match(user, /Fix invoice export/);
  assert.match(buildSuggestPrompt({ workspaces: [], sessions: [] }, 'en').user, /\(none\)/);
});

test('fallbacks exist in both languages', () => {
  assert.equal(FALLBACK.zh.length, 6);
  assert.equal(FALLBACK.en.length, 6);
  assert.equal(langOf('zh-CN'), 'zh');
  assert.equal(langOf('fr'), 'en');
  assert.equal(langOf(undefined), 'en');
});

test('palettes are validated before they reach a file', () => {
  const css = paletteCss(readPalette(PALETTES[1]));
  assert.match(css, /--nocco-primary: #24456D;/);
  assert.match(css, /--nocco-error: #ef4444;/);
  assert.throws(() => readPalette({ ...PALETTES[0], primary: 'red; } body { display:none' }), /#rrggbb/);
  assert.throws(() => readPalette({ primary: '#fff' }), /#rrggbb/);
  assert.throws(() => readPalette(null), /#rrggbb/);
});

import { createSuggester, gatherContext } from '../dist/home-api.js';

const hostWith = (services) => ({ get: (name) => services[name] });

test('gathers names from workspaces and sessions, tolerating missing services', async () => {
  assert.deepEqual(await gatherContext(hostWith({})), { workspaces: [], sessions: [] });
  const context = await gatherContext(hostWith({
    workspaceRegistry: { list: () => [{ title: 'here', path: process.cwd() }, { title: 'gone', path: '/no/such/dir' }] },
    sessionQuery: {
      listSessions: async () => [{ header: { id: 'a' } }, { header: { id: 'b' } }],
      readTitleSnapshots: async () => new Map([['a', { title: { title: 'Plan the quarter' } }], ['b', { title: undefined }]]),
    },
  }));
  assert.equal(context.workspaces[0].title, 'here');
  assert.ok(context.workspaces[0].files.includes('package.json'));
  assert.ok(!context.workspaces[0].files.includes('node_modules'));
  assert.deepEqual(context.workspaces[1].files, []);
  assert.deepEqual(context.sessions, ['Plan the quarter']);
});

test('suggestions come from the model, are cached, and fall back on failure', async () => {
  let calls = 0;
  const reply = JSON.stringify(['idea one x', 'idea two x', 'idea three x', 'idea four x', 'idea five x', 'idea six x']);
  const good = createSuggester(hostWith({}), async () => { calls += 1; return reply; });
  const first = await good('en', false);
  assert.equal(first.source, 'model');
  assert.equal(first.suggestions.length, 6);
  await good('en', false);
  assert.equal(calls, 1, 'second read is served from the cache');
  await good('en', true);
  assert.equal(calls, 2, 'refresh asks the model again');

  const bad = createSuggester(hostWith({}), async () => { throw new Error('AUTH'); });
  const fallback = await bad('zh', false);
  assert.equal(fallback.source, 'fallback');
  assert.equal(fallback.reason, 'AUTH');
  assert.deepEqual(fallback.suggestions, [...FALLBACK.zh]);

  let fail = false;
  const flaky = createSuggester(hostWith({}), async () => { if (fail) throw new Error('down'); return reply; });
  await flaky('en', false);
  fail = true;
  assert.equal((await flaky('en', true)).source, 'model', 'a failed refresh keeps the earlier model suggestions');
});
