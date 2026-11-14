// Real scaffold, real install, real Vite. Run with: npm run e2e
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { scaffold } from '../dist/scaffold.js';
import { createPreviewManager } from '../dist/preview.js';

const directory = fileURLToPath(new URL('../.e2e/app', import.meta.url));
await rm(directory, { recursive: true, force: true });

const made = await scaffold({ directory, appName: 'E2E App', language: 'en' });
if (!made.installed) throw new Error(`install failed with ${made.packageManager}\n${made.installOutput}`);
console.log(`[e2e] installed with ${made.packageManager}`);

const previews = createPreviewManager({ readyTimeoutMs: 60000 });
try {
  const state = await previews.start(directory);
  const html = await (await fetch(state.url)).text();
  if (!html.includes('<div id="app">') || !html.includes('<title>E2E App</title>')) throw new Error('unexpected page');
  const page = await fetch(new URL('/src/pages/index.vue', state.url));
  if (page.status !== 200) throw new Error(`page module returned ${page.status}`);
  console.log(`[e2e] serving at ${state.url}`);
  if (process.argv.includes('--hold')) await new Promise(() => {});
} finally {
  if (!process.argv.includes('--hold')) await previews.stopAll();
}
console.log('[e2e] ok');
