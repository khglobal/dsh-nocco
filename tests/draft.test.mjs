import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDraft } from '../dist/draft.js';
import { text } from '../dist/text.js';

test('a draft invokes the skill with the request and the chosen design system', () => {
  assert.equal(buildDraft('  Build a CRM  ', 'shadcn', text('en')), '/nocco Build a CRM\n\nDesign system: shadcn');
  assert.equal(buildDraft('做一个工单系统', 'vant', text('zh')), '/nocco 做一个工单系统\n\n设计体系：vant');
});

test('a picked palette is named in the draft', () => {
  assert.equal(buildDraft('Build a CRM', 'antdv', text('en'), 'emerald'), '/nocco Build a CRM\n\nDesign system: antdv\nPalette: emerald');
  assert.equal(buildDraft('Build a CRM', 'antdv', text('zh'), '#112233'), '/nocco Build a CRM\n\n设计体系：antdv\n配色：#112233');
});

test('every string exists in both languages', () => {
  const en = text('en'), zh = text('zh-CN');
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
  for (const key of Object.keys(en)) assert.ok(en[key] && zh[key], key);
});
