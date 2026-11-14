import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('the packed tarball carries everything the plugin loads', () => {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
  assert.equal(result.status, 0, result.stderr);
  const files = JSON.parse(result.stdout)[0].files.map((file) => file.path);
  for (const file of ['package.json', 'cordis.patch.yml', 'icon.svg', 'LICENSE', 'README.md',
    'dist/index.js', 'dist/scaffold.js', 'dist/preview.js', 'dist/client.browser.js',
    'locale/en.json', 'locale/zh.json', 'resources/skill/SKILL.md',
    'resources/template/package.json', 'resources/template/gitignore', 'resources/template/pnpm-workspace.yaml', 'resources/template/.env.example',
    'resources/template/src/main.js', 'resources/template/src/lib/data.js']) {
    assert.ok(files.includes(file), file);
  }
  assert.ok(!files.some((file) => file.startsWith('tests/') || file.startsWith('src/')), 'sources and tests stay out');
});
