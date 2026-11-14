import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// One SQLite file next to the app. Tables are created from schema.ts by
// `drizzle-kit push`, which the Nocco preview runs whenever the schema changes.
const client = createClient({ url: 'file:sqlite.db' });
export const db = drizzle(client, { schema });
