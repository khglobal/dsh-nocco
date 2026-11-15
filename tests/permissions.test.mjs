import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, realpathSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { authorize, canonical, command, isUnder, OPEN, PermissionDenied } from '../dist/permissions.js';
import { createCheckpoints } from '../dist/checkpoints.js';
import { importFile } from '../dist/import.js';
import * as plugin from '../dist/index.js';

const PURPOSE = { en: 'do a thing', zh: '做一件事' };
// A place outside every temporary area, which the host's workspace mode leaves writable.
const OUTSIDE = '/nocco-test-outside/app';
const fresh = () => realpathSync(mkdtempSync(join(tmpdir(), 'nocco-perm-')));

function host({ mode = 'workspace-write', workspaceRoot = '/nocco-test-workspace', answer = 'allowed-once', sandbox = true, approval = true } = {}) {
  const asked = [], confined = [];
  return {
    asked, confined,
    policy: { resolve: () => ({ mode, workspaceRoot, sessionId: 's1' }) },
    ...(sandbox ? { sandbox: { confine: async (argv, policy) => { confined.push({ argv, policy }); return { argv: ['runner', '--', ...argv] }; } } } : {}),
    ...(approval ? { approval: { request: async (request) => { asked.push(request); return answer; } } } : {}),
  };
}
const caller = { toolName: 'nocco_test', agent: { session: {} }, callId: 'c1' };

test('a path is under a root only when it is the root or beneath it', () => {
  assert.equal(isUnder('/a/b', '/a'), true);
  assert.equal(isUnder('/a', '/a'), true);
  assert.equal(isUnder('/ab', '/a'), false);
  assert.equal(isUnder('/a/../b', '/a'), false);
});

test('a canonical path follows links through the part that exists', async () => {
  const root = fresh();
  mkdirSync(join(root, 'real'));
  symlinkSync(join(root, 'real'), join(root, 'link'));
  assert.equal(await canonical(join(root, 'link', 'new', 'file')), join(root, 'real', 'new', 'file'));
});

test('a session the host does not restrict gets open access without questions', async () => {
  const h = host({ mode: 'danger-full-access' });
  const access = await authorize(h, caller, OUTSIDE, PURPOSE);
  assert.equal(access, OPEN);
  assert.equal(h.asked.length, 0);
});

test('a directory inside the workspace needs no approval and its programs are confined to the session policy', async () => {
  const h = host();
  const access = await authorize(h, caller, '/nocco-test-workspace/app', PURPOSE);
  assert.equal(h.asked.length, 0);
  assert.deepEqual(await access.wrap(['git', 'status']), ['runner', '--', 'git', 'status']);
  assert.equal(h.confined[0].policy.workspaceRoot, '/nocco-test-workspace');
  await access.inside('/nocco-test-workspace/app/server/db');
  await assert.rejects(access.inside('/nocco-test-outside/file'), PermissionDenied);
});

test('a directory outside the workspace asks once and the grant covers that directory only', async () => {
  const h = host();
  const access = await authorize(h, caller, OUTSIDE, PURPOSE);
  assert.equal(h.asked.length, 1);
  assert.equal(h.asked[0].toolName, 'nocco_test');
  assert.match(h.asked[0].reason, /nocco-test-outside\/app/);
  assert.ok(h.asked[0].displayReason.zh);
  await access.wrap(['npm', 'install']);
  assert.deepEqual(h.confined[0].policy, { mode: 'workspace-write', workspaceRoot: OUTSIDE, sessionId: 's1' });
  await access.inside(join(OUTSIDE, 'a'));
  await assert.rejects(access.inside('/nocco-test-outside/other'), PermissionDenied);
  await assert.rejects(access.inside('/nocco-test-workspace/x'), PermissionDenied);
});

test('a refused, unavailable or impossible approval stops the call', async () => {
  for (const answer of ['rejected', 'unavailable', 'cancelled', 'anything-else']) {
    await assert.rejects(authorize(host({ answer }), caller, OUTSIDE, PURPOSE), PermissionDenied);
  }
  await assert.rejects(authorize(host({ approval: false }), caller, OUTSIDE, PURPOSE), PermissionDenied);
  await assert.rejects(authorize(host(), { toolName: 'nocco_test' }, OUTSIDE, PURPOSE), PermissionDenied);
  await assert.rejects(authorize({}, caller, OUTSIDE, PURPOSE), PermissionDenied);
});

test('a read-only session must approve every write', async () => {
  const h = host({ mode: 'read-only' });
  await authorize(h, caller, '/nocco-test-workspace/app', PURPOSE);
  assert.equal(h.asked.length, 1);
  assert.match(h.asked[0].reason, /read-only/);
});

test('a link that leads out of the workspace is judged by where it leads', async () => {
  const root = fresh();
  const workspace = join(root, 'ws'), elsewhere = '/nocco-test-outside';
  mkdirSync(workspace);
  symlinkSync(elsewhere, join(workspace, 'app'));
  // The workspace sits in a temporary area the mode allows, so point the policy at it and test the link target.
  const h = host({ workspaceRoot: workspace });
  await authorize(h, caller, join(workspace, 'app'), PURPOSE);
  assert.equal(h.asked.length, 1);
});

test('programs the host cannot confine need an approval of their own, asked once per call', async () => {
  const h = host({ sandbox: false });
  const access = await authorize(h, caller, '/nocco-test-workspace/app', PURPOSE);
  assert.deepEqual(await access.wrap(['git', 'status']), ['git', 'status']);
  await access.wrap(['git', 'log']);
  assert.equal(h.asked.length, 1);
  assert.match(h.asked[0].reason, /cannot confine/);
  const refused = await authorize(host({ sandbox: false, answer: 'rejected' }), caller, '/nocco-test-workspace/app', PURPOSE);
  await assert.rejects(refused.wrap(['git', 'status']), PermissionDenied);
});

test('a confined command is started by the host runner with a cache it may write', async () => {
  const access = await authorize(host(), caller, '/nocco-test-workspace/app', PURPOSE);
  const program = await command(access, 'npm', ['install']);
  if (process.platform !== 'win32') assert.deepEqual([program.file, ...program.args], ['runner', '--', 'npm', 'install']);
  assert.equal(program.shell, false);
  assert.ok(isUnder(program.env.npm_config_cache, tmpdir()));
  const open = await command(OPEN, 'npm', ['install']);
  assert.deepEqual([open.file, ...open.args], ['npm', 'install']);
});

test('checkpoints refuse a store that links out of what was allowed', async () => {
  const root = fresh();
  const app = join(root, 'app'), elsewhere = join(root, 'elsewhere');
  mkdirSync(app); mkdirSync(elsewhere);
  symlinkSync(elsewhere, join(app, '.nocco'));
  const access = { ...OPEN, confined: true, inside: async (path) => { if (!isUnder(await canonical(path), app)) throw new PermissionDenied('outside'); }, wrap: async (argv) => [...argv] };
  await assert.rejects(createCheckpoints().save(app, 'x', access), PermissionDenied);
});

test('imported rows are not written through a folder that links out of the app', async () => {
  const root = fresh();
  const app = join(root, 'app'), elsewhere = join(root, 'elsewhere');
  mkdirSync(join(app, 'server'), { recursive: true }); mkdirSync(elsewhere);
  symlinkSync(elsewhere, join(app, 'server', 'db'));
  const { readdirSync, writeFileSync } = await import('node:fs');
  const file = join(root, 'rows.csv');
  writeFileSync(file, 'name,qty\nbolt,3\n');
  const inside = async (path) => { if (!isUnder(await canonical(path), app)) throw new PermissionDenied('outside'); };
  await assert.rejects(importFile({ file, directory: app, inside }), PermissionDenied);
  assert.deepEqual(readdirSync(elsewhere), []);
});

test('the tools refuse to write or run anything when the host offers no permission services', async () => {
  const tools = [];
  let dispose = () => {};
  plugin.apply({
    tools: { register: (tool) => { tools.push(tool); } }, skills: { register: () => {} },
    effect: (setup) => { dispose = setup(); }, inject: () => {}, on: () => {},
  });
  const call = (name, args) => tools.find((tool) => tool.name === name).execute(args, { signal: new AbortController().signal });
  const dir = join(fresh(), 'app');
  await assert.rejects(call('nocco_scaffold', { directory: dir, appName: 'A', language: 'en' }), PermissionDenied);
  await assert.rejects(call('nocco_preview', { action: 'start', directory: dir }), PermissionDenied);
  await assert.rejects(call('nocco_checkpoint', { action: 'save', directory: dir }), PermissionDenied);
  const { existsSync } = await import('node:fs');
  assert.equal(existsSync(dir), false);
  dispose();
});
