What the new app already contains. All of it is tested and working; build on
it without reading or testing these files again.

Layout
- `pages/index.vue` is a placeholder start page: replace it. `pages/login.vue` is the finished sign-in page.
- `app.vue`, `nuxt.config.ts`, `plugins/`, `middleware/`, `server/middleware/`, `server/utils/`, `server/plugins/seed-admin.ts`, `server/api/auth/`, `server/db/index.ts` are the shell.
- You write in `pages/`, `components/`, `composables/`, `layouts/`, `server/api/`, `server/db/schema.ts`, and new files under `server/plugins/` and `server/utils/`.

Sign-in
- The tool result's `signIn` says whether visitors must sign in (`required`) or the app is open to everyone (`off`).

Auto-imports (no import statement needed)
- Vue and Nuxt APIs, everything in `components/`, `composables/` and `server/utils/`.
- Pages: `useAuth()` returns `{ user, loaded, refresh, login, logout, hasRole }`; `user.value` is `{ username, role } | null`.
- Server: `requireUser(event)` and `requireRole(event, ...roles)` return `{ id, username, role }` or reject the request; `hashPassword(password)` and `verifyPassword(password, stored)`.

Data
- `import { db } from '~~/server/db'` and `import { users } from '~~/server/db/schema'`; Drizzle with SQLite (`sqliteTable` from `drizzle-orm/sqlite-core`).
- `users` has `id`, `username`, `passwordHash`, `role` (`admin` or `member` to start with), `createdAt`.
- Server routes are files named `server/api/<path>.<method>.ts` exporting `defineEventHandler`.

Colours
- `var(--nocco-primary)`, `--nocco-bg`, `--nocco-text`, `--nocco-text-secondary`, `--nocco-surface`, `--nocco-border`, `--nocco-success`, `--nocco-warning`, `--nocco-error`.
