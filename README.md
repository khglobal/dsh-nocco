# dsh-nocco

English | [中文](README.zh.md)

Build Vue 3 + Element Plus web apps from chat in DeepSeek Harness. Runs on
your machine with the model you choose. No account and no server.

## What it adds

- Skill `nocco` (type `/nocco` in a session): how to build and change the app.
- Tool `nocco_scaffold`: creates the app in an empty directory and installs
  its dependencies.
- Tool `nocco_preview`: starts, stops and checks the app's local dev server.
- A tool view with an "Open preview" action that opens the app in the
  right-sidebar browser tab.

## Requirements

DSH 0.2.2-rc.1 or newer in the 0.2 line, Node 20 or newer, and pnpm or npm.

## Install

    dsh plugin --profile web add dsh-nocco

In DSH Desktop, install it from Settings → Plugins instead.

## Use

Open a session in the folder where you want the app, type `/nocco` and
describe the app. The agent asks for approval before it runs a tool.

## Data

Apps store data in the browser by default. To use your own Supabase project,
copy `.env.example` to `.env.local` in the app and fill in the URL and anon
key. The agent writes schema changes to `supabase/migrations.sql`; you run
that file in the Supabase SQL editor. The plugin never asks for a service key.

## Limits

No deploy or export. The generated app is not sandboxed: it is ordinary code
running a local dev server bound to 127.0.0.1. In `dsh web` profiles the
browser tab is off by default, so the preview opens in a new browser window.

## Development

    npm install
    npm test        # builds, then runs the unit tests
    npm run e2e     # real scaffold, install and Vite dev server

## Licence

MIT. The app template in `resources/template/` is MIT-0, so apps you build
carry no attribution requirement.
