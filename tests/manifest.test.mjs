import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

test('manifest declares an installable bundle', () => {
  assert.equal(pkg.name, '@khglobal/dsh-nocco');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.ok(existsSync(new URL('cordis.patch.yml', root)));
  const patch = readFileSync(new URL('cordis.patch.yml', root), 'utf8');
  assert.match(patch, /id: '@khglobal\/dsh-nocco'\n\s+name: '@khglobal\/dsh-nocco'/);
});

test('client inject lists only official packages', () => {
  for (const dep of pkg.dsh.client.inject) assert.match(dep, /^@deepseek-ai\//);
});

test('every exported file exists after build', () => {
  for (const file of ['dist/index.js', 'dist/index.d.ts', 'dist/client.browser.js', 'icon.svg', 'locale/en.json', 'locale/zh.json']) {
    assert.ok(existsSync(new URL(file, root)), file);
  }
});

test('host and client modules are named after the package', async () => {
  const host = await import(new URL('dist/index.js', root));
  assert.equal(host.name, 'dsh-nocco');
  const client = readFileSync(new URL('dist/client.browser.js', root), 'utf8');
  assert.match(client, /__ModuleLoader__\.load\(\{id: "@khglobal\/dsh-nocco"/);
});

test('each language points DSH at its own long description', () => {
  for (const [lang, doc] of [['en', 'README.md'], ['zh', 'README.zh.md']]) {
    const locale = JSON.parse(readFileSync(new URL(`../locale/${lang}.json`, import.meta.url), 'utf8'));
    assert.equal(locale.meta.detail, doc);
    assert.ok(readFileSync(new URL(`../${doc}`, import.meta.url), 'utf8').length > 0);
    assert.ok(pkg.files.includes(doc));
  }
});
