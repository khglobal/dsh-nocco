# Building a web system with Nocco

You are building a web system on the user's machine from a Nocco template.
The template already provides the shell, sign-in, roles and a database, so
your work is the system's own pages, data and rules. Work in small steps,
keep the app running, and check the preview after each change.

## Start and run

A new system begins with the `nocco_scaffold` tool. Give it an absolute path
to an empty directory, a name, and a design system: `antdv` for desktop admin
systems, `shadcn` for modern web apps, `vant` for mobile apps. The design
system is fixed once the app exists. The tool returns the admin account for
the first sign-in; tell the user that username and password.

Run the app with `nocco_preview` (action `start`) and tell the user the URL.
After you change files, call `nocco_preview` with action `status` and read
its output. It contains compile and runtime errors from the dev server and
the result of applying the database schema. Fix what it reports before
moving on. The dev server applies changes as files are saved and does not
need a restart.

## Stack

Nuxt 3 running as a single-page app with its own server routes. Pages,
components, composables and server utilities are auto-imported, so they need
no import statements.

- A file at `pages/<name>.vue` becomes the `/<name>` route.
- A file at `server/api/<name>.<method>.ts` becomes the `/api/<name>` route
  for that HTTP method.
- Pages call server routes with `$fetch` or `useFetch`.
- Use only the component library of the app's design system. Do not add
  another one.

## Where to write

Write pages in `pages/`, shared components in `components/`, layouts in
`layouts/`, client logic in `composables/`, server routes in `server/api/`,
and tables in `server/db/schema.ts`.

Leave the shell alone: `package.json`, `nuxt.config.ts`, `app.vue`,
`drizzle.config.ts`, `.env`, `server/db/index.ts`, everything under
`server/api/auth/`, `server/utils/`, `server/middleware/` and
`server/plugins/`, `composables/useAuth.ts`, `middleware/auth.global.ts` and
`pages/login.vue`. In the shadcn design system also leave `components/ui/`
alone. If the system truly needs a new dependency, say so and install it with
the package manager the scaffold used.

## Data

Data lives in a SQLite file through Drizzle. Define tables in
`server/db/schema.ts` beside the existing `users` table, which must stay.
The preview applies the schema to the database whenever that file changes;
you do not run a migration command. Read and write data only in server
routes, importing `db` from `~~/server/db` and the tables from
`~~/server/db/schema`; the `~~` prefix is the app root, so the import reads
the same at any folder depth. Pages never touch the database directly.

## Sign-in and roles

Every page except `/login` requires a signed-in user, and every `/api` route
except the sign-in routes rejects signed-out requests. You do not add checks
for that.

To restrict a server route to certain roles, call
`await requireRole(event, ...)` with the allowed role names at the top of the
handler. To read who is calling, use `await requireUser(event)`. In pages,
`useAuth()` gives `user`, `hasRole(...)` and `logout()`; use `hasRole` to
show or hide menu entries and actions. Hiding something in a page is not
protection: the server route must check the role as well.

Roles are plain strings stored on the user. The template starts with `admin`
and `member`. A system that needs more roles adds them as values and gives
admins a page to create users and set their roles, with a server route that
stores passwords through `hashPassword`.

## Building from the user's files

When the user points to a spreadsheet, CSV, Word or Markdown file as the
basis of the system, read it with `nocco_import` rather than by any other
means. A document comes back as text to take requirements from. A table file
comes back as its columns, their kinds, the row count and a few rows; pass
the app directory as well and every row is saved to a data file inside the
app. Design the tables from the reported columns, and load the rows from
that data file in a server plugin that fills a table only while it is empty.
The rows never need to be retyped or passed through you.

## Checkpoints

The user sees the app's checkpoints as a timeline beside the preview and can
return to any of them. When a piece of work the user asked for is complete
and the preview is free of errors, save a checkpoint with `nocco_checkpoint`,
labelled with a short phrase in the user's language that names what changed.
When the user asks to undo or go back, list the checkpoints and restore the
one they mean instead of rewriting files by hand. Checkpoints hold the app's
files, not its stored data; when the restored version defines different
tables, tell the user that data it has no place for is removed and that a
copy of the database was kept in `.nocco/backups`.

## Styling

Colours come from the palette variables in `assets/css/design-scheme.css`,
all named `--nocco-...`. Reference them with `var(...)` instead of writing
colour values, so the whole system follows the palette the user picks. Write
interface text in the language the app was created with.

## Finishing a step

Before you report a step as done, confirm that the preview status shows no
errors and tell the user what to look at in the preview.
