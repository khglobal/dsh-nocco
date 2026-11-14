import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDraft } from '../dist/draft.js';
import { text } from '../dist/text.js';

test('a draft invokes the skill with the request and the chosen design system', () => {
  assert.equal(buildDraft('  Build a CRM  ', { designSystem: 'shadcn' }, text('en')), '/nocco Build a CRM\n\nDesign system: shadcn');
  assert.equal(buildDraft('做一个工单系统', { designSystem: 'vant' }, text('zh')), '/nocco 做一个工单系统\n\n设计体系：vant');
});

test('a picked palette is named in the draft', () => {
  assert.equal(buildDraft('Build a CRM', { designSystem: 'antdv', palette: 'emerald' }, text('en')), '/nocco Build a CRM\n\nDesign system: antdv\nPalette: emerald');
  assert.equal(buildDraft('Build a CRM', { designSystem: 'antdv', palette: '#112233' }, text('zh')), '/nocco Build a CRM\n\n设计体系：antdv\n配色：#112233');
});

test('every other choice adds its own line, and defaults add none', () => {
  const draft = buildDraft('Build a CRM', {
    designSystem: 'antdv', font: 'serif', features: ['rounded', 'shadow'], mode: 'discuss', files: ['/tmp/a/Sales.xlsx'],
  }, text('en'));
  assert.equal(draft, '/nocco Build a CRM\n\nDesign system: antdv\nFont: serif\nStyle: Rounded corners, Soft shadow\nMode: Discuss\nFiles:\n- /tmp/a/Sales.xlsx');
  assert.equal(buildDraft('Build a CRM', { designSystem: 'antdv', mode: 'build', features: [], files: [] }, text('en')), '/nocco Build a CRM\n\nDesign system: antdv');
});

test('every string exists in both languages', () => {
  const en = text('en'), zh = text('zh-CN');
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
  for (const key of Object.keys(en)) assert.ok(en[key] && zh[key], key);
});
