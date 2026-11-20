import { type Access } from './permissions.js';
import type { PreviewSync } from './preview.js';
/** The file whose changes mean the database tables must be brought up to date. */
export declare const SCHEMA_FILE: string;
/**
 * Apply the app's schema to its SQLite file with drizzle-kit and return the
 * outcome as preview output lines. A failure is reported, never thrown: the
 * dev server should keep running so the model can read the error and fix it.
 */
export declare function pushSchema(directory: string, access?: Access): Promise<string[]>;
export declare const schemaSync: PreviewSync;
