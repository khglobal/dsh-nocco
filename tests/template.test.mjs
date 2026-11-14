import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../resources/templates', import.meta.url));
function files(root, base = '') {
  return readdirSync(join(root, base)).flatMap((name) => {
    const rel = join(base, name);
    return statSync(join(root, rel)).isDirectory() ? files(root, rel) : [rel];
  });
}
const all = files(dir);
const kits = ['antdv', 'shadcn', 'vant'];

test('each design system has its shell, start page and sign-in page', () => {
  for (const kit of kits) {
    for (const file of ['package.json', 'nuxt.config.ts', 'app.vue', 'pages/index.vue', 'pages/login.vue', 'assets/css/design-scheme.css']) {
      assert.ok(all.includes(join(kit, file)), `${kit}/${file}`);
    }
  }
});

test('the shared files carry sign-in, roles and the database', () => {
  for (const file of ['server/db/index.ts', 'server/db/schema.ts', 'server/utils/auth.ts', 'server/utils/password.ts',
    'server/middleware/auth.ts', 'server/plugins/seed-admin.ts', 'server/api/auth/login.post.ts',
    'server/api/auth/logout.post.ts', 'server/api/auth/me.get.ts', 'composables/useAuth.ts',
    'middleware/auth.global.ts', 'drizzle.config.ts', 'gitignore', '.env.example', 'pnpm-workspace.yaml', 'LICENSE']) {
    assert.ok(all.includes(join('_shared', file)), file);
  }
});

test('templates carry no hosted-platform leftovers or secrets', () => {
  for (const file of all) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const banned of ['__nocco', 'asterosuite', 'ICP', 'tenant', 'nocco:preview', 'hmr: false']) {
      assert.ok(!text.includes(banned), `${file} contains ${banned}`);
    }
  }
  assert.ok(!all.some((file) => file.endsWith('.env') || file.endsWith('sqlite.db') || file.endsWith('pnpm-lock.yaml')));
});

test('each design system exposes the scaffold tokens', () => {
  for (const kit of kits) {
    const config = readFileSync(join(dir, kit, 'nuxt.config.ts'), 'utf8');
    assert.match(config, /title: __APP_NAME_JSON__/);
    assert.match(config, /lang: '__APP_LANG__'/);
    assert.match(config, /ssr: false/);
    assert.equal(JSON.parse(readFileSync(join(dir, kit, 'package.json'), 'utf8')).name, '__APP_SLUG__');
  }
});
