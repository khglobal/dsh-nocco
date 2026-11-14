# Changelog

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
