# White Label CLI

White Label has one project-creation engine and thin adapters around it.

```text
CLI ────────┐
Yeoman ─────┼──> createProject() ──> project
Node API ───┘
```

The adapters translate input. `createProject()` owns the scaffold.

## Create a project

```sh
white-label create my-project
cd my-project
npm install
npm test
```

The same CLI can be invoked directly from the package:

```sh
npx generator-white-label create my-project
```

Run `white-label --help` for usage.

## Use the API

```js
import {createProject} from 'generator-white-label';

await createProject({
    destination: '/absolute/path/to/my-project'
});
```

`createSite()` remains available as a compatibility alias.

## Why this shape

Creation behavior belongs in one place. A CLI, Yeoman adapter, or future integration should call `createProject()` rather than copy templates or reimplement generation logic.

That keeps every entry point consistent and makes the source itself a guide to extending the tool:

- `scaffold/index.ts` — project creation
- `cli/index.ts` — command-line adapter
- `generators/app/index.ts` — Yeoman adapter
- `test/` — executable contracts

## Yeoman

`yo white-label` remains supported. Yeoman is an adapter, not a requirement of the scaffold API.
