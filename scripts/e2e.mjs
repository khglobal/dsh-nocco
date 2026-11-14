// Real scaffold, real install, real Nuxt dev server, real sign-in.
// Run with: npm run e2e [-- antdv shadcn vant retro] [--hold] [--en]
import { readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DESIGN_SYSTEMS, scaffold } from '../dist/scaffold.js';
import { createPreviewManager } from '../dist/preview.js';
import { schemaSync } from '../dist/schema-sync.js';

const hold = process.argv.includes('--hold');
const language = process.argv.includes('--en') ? 'en' : 'zh-CN';
const asked = process.argv.slice(2).filter((arg) => DESIGN_SYSTEMS.includes(arg));
const kits = asked.length > 0 ? asked : DESIGN_SYSTEMS;
const previews = createPreviewManager({ sync: schemaSync, readyTimeoutMs: 120000 });

async function call(url, path, { body, cookie } = {}) {
  const response = await fetch(new URL(path, url), {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = response.headers.get('set-cookie');
  return { status: response.status, cookie: setCookie ? setCookie.split(';')[0] : undefined, json: await response.json().catch(() => null) };
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  for (const designSystem of kits) {
    const directory = fileURLToPath(new URL(`../.e2e/${designSystem}`, import.meta.url));
    await rm(directory, { recursive: true, force: true });

    const started = Date.now();
    const made = await scaffold({ directory, appName: `E2E ${designSystem}`, language, designSystem });
    expect(made.installed, `${designSystem}: install failed with ${made.packageManager}\n${made.installOutput}`);
    const installed = Date.now();

    const state = await previews.start(directory);
    expect(state.output.some((line) => line.includes('database tables are up to date')), `${designSystem}: schema was not applied\n${state.output.join('\n')}`);
    const ready = Date.now();

    const page = await fetch(new URL('/login', state.url));
    expect(page.status === 200, `${designSystem}: /login returned ${page.status}`);
    const signedOut = await call(state.url, '/api/auth/me');
    expect(signedOut.json?.user === null, `${designSystem}: expected no user before sign-in`);
    const wrong = await call(state.url, '/api/auth/login', { body: { username: 'admin', password: 'wrong' } });
    expect(wrong.status === 401, `${designSystem}: wrong password returned ${wrong.status}`);
    const login = await call(state.url, '/api/auth/login', { body: made.admin });
    expect(login.status === 200 && login.cookie, `${designSystem}: sign-in failed with ${login.status}`);
    const me = await call(state.url, '/api/auth/me', { cookie: login.cookie });
    expect(me.json?.user?.role === 'admin', `${designSystem}: signed-in user is not the admin`);

    // Pages report runtime errors to the app; the preview reads them once.
    const reported = await call(state.url, '/api/_nocco/errors', { body: { message: 'TypeError: probe', page: '/probe' } });
    expect(reported.status === 200, `${designSystem}: reporting a page error returned ${reported.status}`);
    const collected = await call(state.url, '/api/_nocco/errors');
    expect(collected.json?.errors?.[0]?.message === 'TypeError: probe', `${designSystem}: the reported page error was not returned`);
    const emptied = await call(state.url, '/api/_nocco/errors');
    expect(emptied.json?.errors?.length === 0, `${designSystem}: page errors were not cleared after being read`);

    // Signed out, a required-sign-in app refuses any /api route; the same app with sign-in off does not.
    const closed = await call(state.url, '/api/_probe-missing');
    expect(closed.status === 401, `${designSystem}: a signed-out request to a protected route returned ${closed.status}`);
    await previews.stop(directory);
    const config = join(directory, 'nuxt.config.ts');
    // The setting is the one inside runtimeConfig; the comment above it mentions the same words.
    const setSignIn = (value) => writeFileSync(config, readFileSync(config, 'utf8').replace(/(runtimeConfig:.*signIn: ')(required|off)'/, `$1${value}'`));
    setSignIn('off');
    const open = await previews.start(directory);
    const anonymous = await call(open.url, '/api/_probe-missing');
    expect(anonymous.status !== 401, `${designSystem}: with sign-in off a signed-out request was still refused`);
    setSignIn('required');

    console.log(`[e2e] ${designSystem}: install ${((installed - started) / 1000).toFixed(1)} s (${made.packageManager}), first page ${((ready - installed) / 1000).toFixed(1)} s, sign-in ok, ${open.url}`);
    if (hold) console.log(`[e2e] ${designSystem}: admin password ${made.admin.password}`);
  }
  if (hold) await new Promise(() => {});
} finally {
  if (!hold) await previews.stopAll();
}
console.log('[e2e] ok');
