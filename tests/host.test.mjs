import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as host from '../dist/index.js';

function fakeContext() {
  const tools = [], skills = [];
  let dispose = () => {};
  return {
    tools, skills, dispose: () => dispose(),
    ctx: {
      tools: { register: (tool) => { tools.push(tool); return () => {}; } },
      skills: { register: (skill) => { skills.push(skill); return () => {}; } },
      effect: (setup) => { dispose = setup(); },
      get: () => undefined,
    },
  };
}

test('requires the tools and skills services', () => {
  assert.deepEqual([...host.inject], ['tools', 'skills']);
});

test('registers the skill and both tools', () => {
  const fake = fakeContext();
  host.apply(fake.ctx);
  assert.deepEqual(fake.skills.map((skill) => skill.name), ['nocco']);
  assert.match(fake.skills[0].content, /nocco_scaffold/);
  assert.deepEqual(fake.tools.map((tool) => tool.name).sort(), ['nocco_preview', 'nocco_scaffold']);
  fake.dispose();
});

test('skill text keeps to generic principles', () => {
  const fake = fakeContext();
  host.apply(fake.ctx);
  const text = fake.skills[0].content;
  assert.doesNotMatch(text, /for example|e\.g\.|such as/i);
  assert.doesNotMatch(text, /^\s*\d+\.\s/m);
  fake.dispose();
});

test('preview tool reports status for an app that is not running', async () => {
  const fake = fakeContext();
  host.apply(fake.ctx);
  const preview = fake.tools.find((tool) => tool.name === 'nocco_preview');
  const dir = mkdtempSync(join(tmpdir(), 'nocco-host-'));
  const value = await preview.execute({ action: 'status', directory: dir }, { signal: new AbortController().signal });
  assert.equal(value.running, false);
  fake.dispose();
});

test('preview tool rejects an unknown action', async () => {
  const fake = fakeContext();
  host.apply(fake.ctx);
  const preview = fake.tools.find((tool) => tool.name === 'nocco_preview');
  await assert.rejects(preview.execute({ action: 'restart', directory: '/tmp' }, {}), /start, stop or status/);
  fake.dispose();
});
