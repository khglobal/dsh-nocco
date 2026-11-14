import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Accounts for sign-in. Keep this table; add the app's own tables below it.
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('member'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
