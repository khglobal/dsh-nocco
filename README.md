# dsh-nocco

English | [中文](README.zh.md)

Build web systems from chat in DeepSeek Harness. Runs on your machine with
the model you choose. No account and no server.

## What it adds

- Three design-system templates (Ant Design Vue, shadcn, Vant), each a Nuxt 3
  app that already has sign-in, roles and a SQLite database.
- Skill `nocco` (type `/nocco` in a session): how to build on the templates.
- Tool `nocco_scaffold`: creates the app in an empty directory, installs its
  dependencies and returns the first admin account.
- Tool `nocco_preview`: starts, stops and checks the app's local dev server,
  and applies the database schema whenever it changes.

## Requirements

DSH 0.2.2-rc.1 or newer in the 0.2 line, Node 20 or newer, and pnpm or npm.

## Install

    dsh plugin --profile web add dsh-nocco

In DSH Desktop, install it from Settings → Plugins instead.

## Use

Open a session in the folder where you want the app, type `/nocco` and
describe the system. The agent asks for approval before it runs a tool.

## Data and sign-in

Each app keeps its data in a `sqlite.db` file in its own folder. The first
admin account gets a random password when the app is created; the agent tells
you what it is. Passwords are stored hashed, and the session secret lives in
the app's `.env`, which is not committed.

## Limits

No deploy or export. The generated app is not sandboxed: it is ordinary code
running a local dev server bound to 127.0.0.1.

## Development

    npm install
    npm test        # builds, then runs the unit tests
    npm run e2e     # real scaffold, install and Vite dev server

## Licence

MIT. The app template in `resources/template/` is MIT-0, so apps you build
carry no attribution requirement.
