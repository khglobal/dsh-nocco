import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
await rm(new URL('../dist', import.meta.url), { recursive: true, force: true });

const tsc = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.json'], {
  cwd: root, stdio: 'inherit',
});
if (tsc.status !== 0) throw new Error('[build] type check failed');

const client = await build({
  entryPoints: [fileURLToPath(new URL('../src/client.ts', import.meta.url))],
  bundle: true, write: false, format: 'cjs', platform: 'browser', target: 'es2022',
  external: ['react', 'react/jsx-runtime'],
});
await writeFile(
  new URL('../dist/client.browser.js', import.meta.url),
  `window.__ModuleLoader__.load({id: "dsh-nocco", factory: function(require) {
const module = { exports: {} };
${client.outputFiles[0].text}
return module.exports;
}});
`,
);
console.log('[build] dist written');
