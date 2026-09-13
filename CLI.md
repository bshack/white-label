# White Label CLI

White Label has one project-creation engine and a thin command-line adapter.

```text
CLI ──────> createProject() ──────> project
Node API ─┘
```

`createProject()` owns the scaffold. The CLI translates command-line input into that API.

## Create a project

```sh
white-label create my-project
cd my-project
npm install
npm test
```

Or run the package directly:

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

## Read the implementation

The source is intentionally small enough to teach the design:

- `scaffold/index.ts` — project creation
- `cli/index.ts` — command-line adapter
- `test/` — executable contracts

Creation behavior belongs in one place. Future integrations should call `createProject()` rather than copy templates or reimplement generation logic.
