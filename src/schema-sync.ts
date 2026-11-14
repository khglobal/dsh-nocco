import { spawn } from 'node:child_process';
import { join } from 'node:path';
import type { PreviewSync } from './preview.js';

/** The file whose changes mean the database tables must be brought up to date. */
export const SCHEMA_FILE = join('server', 'db', 'schema.ts');

const ANSI = /\u001b\[[0-9;?]*[A-Za-z]/g;

/**
 * Apply the app's schema to its SQLite file with drizzle-kit and return the
 * outcome as preview output lines. A failure is reported, never thrown: the
 * dev server should keep running so the model can read the error and fix it.
 */
export function pushSchema(directory: string): Promise<string[]> {
  return new Promise((done) => {
    const file = join(directory, 'node_modules', '.bin', process.platform === 'win32' ? 'drizzle-kit.cmd' : 'drizzle-kit');
    const child = spawn(file, ['push', '--force'], {
      cwd: directory,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let text = '';
    child.stdout?.on('data', (chunk: Buffer) => { text += chunk.toString('utf8'); });
    child.stderr?.on('data', (chunk: Buffer) => { text += chunk.toString('utf8'); });
    child.once('error', (error) => done([`[schema] could not run drizzle-kit: ${String(error)}`]));
    child.once('close', (code) => {
      if (code === 0) { done(['[schema] database tables are up to date']); return; }
      const lines = text.replace(ANSI, '').split(/[\r\n]+/).map((line) => line.trim()).filter(Boolean).slice(-12);
      done(['[schema] applying server/db/schema.ts failed:', ...lines]);
    });
  });
}

export const schemaSync: PreviewSync = { file: SCHEMA_FILE, run: pushSchema };
