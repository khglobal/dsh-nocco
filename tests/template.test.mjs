import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../resources/template', import.meta.url));
function files(root, base = '') {
  return readdirSync(join(root, base)).flatMap((name) => {
    const rel = join(base, name);
    return statSync(join(root, rel)).isDirectory() ? files(root, rel) : [rel];
  });
}
const all = files(dir);

test('template has the files the skill names', () => {
  for (const file of ['package.json', 'index.html', 'vite.config.js', 'gitignore', '.env.example', 'LICENSE',
    'src/main.js', 'src/App.vue', 'src/lib/data.js', 'src/lib/supabase.js', 'src/pages/index.vue', 'src/assets/app.css']) {
    assert.ok(all.includes(file), file);
  }
});

test('template carries no hosted-platform leftovers', () => {
  for (const file of all) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const banned of ['__sandbox-internal', 'asterosuite', 'ICP', 'tenant', 'nocco:preview']) {
      assert.ok(!text.includes(banned), `${file} contains ${banned}`);
    }
  }
});

test('template exposes the scaffold tokens', () => {
  assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /lang="__APP_LANG__"[\s\S]*<title>__APP_NAME__<\/title>/);
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, '__APP_SLUG__');
});
