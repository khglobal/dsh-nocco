# Building an app with Nocco

You are building a single-page web app on the user's machine. Work in small
steps, keep the app running, and check the preview after each change.

## Start and run

A new app begins with the `nocco_scaffold` tool, which creates the project in
an empty directory and installs its dependencies. Give it an absolute path.
Run the app with `nocco_preview` (action `start`) and tell the user the URL it
returns. After you change files, call `nocco_preview` with action `status` and
read its output; fix any compile or runtime error it shows before moving on.
The dev server applies changes as files are saved, so it does not need a
restart.

## Stack

Vue 3 single-file components, Vite in dev mode, Element Plus for interface
components, Vue Router with file-based routing, Pinia for shared state.

- A file at `src/pages/<name>.vue` becomes the `/<name>` route.
- Vue, Vue Router, Pinia and VueUse APIs are available without import
  statements, and so are Element Plus components.
- Every Element Plus icon is registered as a component and is used as a bare
  tag inside `<el-icon>`. Do not add another icon library.
- Import project files through the `@/` alias, which points at `src/`.

## Where to write

Write pages in `src/pages/`, shared components in `src/components/`, logic and
stores in `src/lib/`, and static assets in `src/assets/`.

Leave the app shell alone: `package.json`, `vite.config.js`, `index.html`,
`src/main.js`, `src/App.vue`, `src/lib/data.js` and `src/lib/supabase.js`. It
already handles routing, locale and data wiring. If the app truly needs a new
dependency, say so and install it with the package manager the scaffold used.

## Styling

Use Element Plus components with `<style scoped>` blocks. Colours, radii and
shadows come from the tokens in `src/assets/app.css`; reference them with
`var(...)` so the app stays visually consistent. Write interface text in the
language the app was scaffolded with.

## Data

By default the app has no backend. Use `collection(name)` from
`@/lib/data`, which keeps rows in browser storage and offers `list`, `get`,
`insert`, `update` and `remove`. Keep all data access behind modules in
`src/lib/` so the storage can change later without touching pages.

When the user wants a real backend, they supply their own Supabase project by
putting its URL and anon key in `.env.local` (see `.env.example`). Then import
`supabase` from `@/lib/supabase`, which is null until those values are set.
Put every schema statement the app needs in `supabase/migrations.sql` and ask
the user to run that file in their Supabase SQL editor; you cannot apply it
yourself. Never ask for, store or write a service-role key.

## Finishing a step

Before you report a step as done, confirm that the preview status shows no
errors and tell the user what to look at in the preview.
