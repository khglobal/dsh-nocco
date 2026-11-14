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
    'dist/schema-sync.js',
    'resources/templates/antdv/package.json', 'resources/templates/shadcn/package.json', 'resources/templates/vant/package.json',
    'resources/templates/shadcn/components/ui/button/Button.vue',
    'resources/templates/_shared/gitignore', 'resources/templates/_shared/pnpm-workspace.yaml', 'resources/templates/_shared/.env.example',
    'resources/templates/_shared/server/api/auth/login.post.ts', 'resources/templates/_shared/server/db/schema.ts']) {
    assert.ok(files.includes(file), file);
  }
  assert.ok(!files.some((file) => file.startsWith('tests/') || file.startsWith('src/')), 'sources and tests stay out');
});
