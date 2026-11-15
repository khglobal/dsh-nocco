# Changelog

## 0.1.6

- The tools now work within the calling session's permissions. Files are
  written only where the session may write, with links judged by where they
  lead.
- Dependency installs, the dev server, the schema step and checkpoints run
  inside DSH's process sandbox.
- Anything outside those limits asks for approval in DSH for that one call;
  when approval is refused or unavailable, nothing is written or started.

## 0.1.5

- Plainer description on the plugin card and in the package.

## 0.1.4

- DSH's plugin page shows the Chinese description when DSH is in Chinese.

## 0.1.3

- README: every way to install and update the plugin in DSH Desktop.

## 0.1.2

- Apps are created in DSH's own language: the Nocco page states it in every
  request, and the agent must always choose a language (it no longer falls
  back to Chinese).
- The templates' starting pages show one language, the app's.
- New introduction with screenshots in both READMEs; the screenshots ship in
  the package so DSH's plugin page shows them.

## 0.1.1

- Retro design system: the page frame is no longer fixed. Navigation sits on
  the left, the right, across the top, or is left out; the navigation area and
  the page each take a grid, dots, stripes, checker or plain backdrop.
- Voice input: the microphone button now appears when DSH's voice input is
  ready (the availability check was being refused by the host).
- Published as `@khglobal/dsh-nocco`.

## 0.1.0

First release.

- Four Nuxt 3 design-system templates (Ant Design Vue, shadcn, Vant, Retro) with
  sign-in, roles and a SQLite database.
- `nocco` skill, `nocco_scaffold` and `nocco_preview` tools; the preview
  applies the database schema whenever it changes.
- Nocco home page in the Nocco web app's look, light and dark, with
  model-generated build suggestions, prompt enhancement, a colour scheme
  picker with typography and style options, file attach, a Discuss / Build
  toggle, and Build that sends the request straight to the agent.
- `nocco_scaffold` returns a guide to the template, and `nocco_preview`
  status reports runtime errors from pages open in the preview, so the agent
  neither re-reads the template nor drives a browser to check its work.
- Preview tab with device widths, reload, a palette picker and a History
  timeline of checkpoints with restore.
- `nocco_import` reads Excel, CSV, TSV, Word, Markdown and text files; table
  rows are saved into the app as a data file.
- `nocco_checkpoint` saves, lists and restores checkpoints; one is saved
  automatically when the app is created and when the agent finishes working.
- Voice input on the Nocco box through DSH's speech service, and Inspect in
  the preview tab to point the agent at an element.
- Sign-in is a per-app setting: required, or off for an app anyone may open.
