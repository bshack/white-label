# White Label CLI

White Label has one project-creation engine and a thin command-line adapter.

```text
CLI ──────> createProject() ──────> project
Node API ─┘
```

`createProject()` owns the scaffold. The CLI translates command-line input into that API.

## Create a project

With a globally installed CLI:

```sh
white-label create my-project
```

Or run the package directly with the package manager you prefer:

```sh
npx generator-white-label create my-project
yarn dlx generator-white-label create my-project
pnpm dlx generator-white-label create my-project
```

Then install and test the generated project with npm, Yarn, or pnpm:

```sh
cd my-project
npm install && npm test
# or: yarn install && yarn test
# or: pnpm install && pnpm test
```

When run interactively, the CLI asks whether page and view templates should use JSX/TSX. Choose **Yes** for JSX syntax such as `<section>...</section>`, or **No** for plain TypeScript functions that return HTML strings. Both choices produce the same working starter application and features.

For scripts and non-interactive use, choose explicitly:

```sh
white-label create my-project --jsx
white-label create my-project --no-jsx

npx generator-white-label create my-project --jsx
npx generator-white-label create my-project --no-jsx
```

The same `--jsx` and `--no-jsx` flags work through `yarn dlx` and `pnpm dlx`.

If no choice can be asked interactively and neither flag is supplied, JSX remains the default for backward compatibility.

Run `white-label --help` for usage. See [`PACKAGE_MANAGERS.md`](PACKAGE_MANAGERS.md) for package-manager compatibility details.

## Use the API

```js
import {createProject} from 'generator-white-label';

await createProject({
    destination: '/absolute/path/to/my-project',
    jsx: false
});
```

Set `jsx: true` for JSX/TSX templates or `jsx: false` for plain TypeScript and HTML strings. Omitting `jsx` defaults to `true`.

## Read the implementation

The source is intentionally small enough to teach the design:

- `scaffold/index.ts` — project creation
- `cli/index.ts` — command-line adapter
- `test/` — executable contracts

Creation behavior belongs in one place. Future integrations should call `createProject()` rather than copy templates or reimplement generation logic.
