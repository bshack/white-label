# White Label CLI

White Label has one project-creation engine and a thin command-line adapter.

```text
CLI ──────> createProject() ──────> project
Node API ─┘
```

`createProject()` owns the canonical tagged-template scaffold, including destination safety. The CLI translates command-line input into that API; it does not maintain a second generation path.

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

Project creation accepts a missing or existing **empty** directory. A non-empty destination is rejected before scaffold files are copied or written.

Then install and test the generated project with npm, Yarn, or pnpm:

```sh
cd my-project
npm install && npm test
# or: yarn install && yarn test
# or: pnpm install && pnpm test
```

The generated project uses ordinary `.ts` files and White Label View's first-party tagged HTML templates:

```ts
import {html} from 'white-label-view/html';

export default function Page(data: {title: string}) {
    return html`<main><h1>${data.title}</h1></main>`;
}
```

Dynamic text and quoted-attribute values are escaped by the tagged-template runtime. Use `attributes()` for conditional/opening-tag attributes and reserve `unsafeHTML()` for application-owned content that is already trusted or sanitized.

There is no generator renderer prompt and no `--jsx` or `--no-jsx` flag. If a project prefers JSX, Handlebars, Eta, EJS, Mustache, Nunjucks, Pug, or another renderer, add it as an application dependency and return its rendered output from View's `template` function. JSX remains a tested third-party option rather than a generator-owned runtime.

See [Template engines](https://whitelabeljs.org/docs/view/#template-engines) for tested integrations and trust boundaries.

Run `white-label --help` for usage. See [`PACKAGE_MANAGERS.md`](PACKAGE_MANAGERS.md) for package-manager compatibility details.

## Use the API

```js
import {createProject} from 'generator-white-label';

await createProject({
    destination: '/absolute/path/to/my-project'
});
```

`createProject()` uses the same destination-safety rule as the CLI: missing and empty directories are allowed; non-empty directories are rejected before project content is written.

## Read the implementation

The source is intentionally small enough to teach the design:

- `scaffold/index.ts` — project creation and destination-safety boundary
- `cli/index.ts` — command-line adapter
- `app/` — canonical TypeScript/tagged-template starter
- `test/` — executable contracts

Creation behavior belongs in one place. Future integrations should call `createProject()` rather than copy templates or reimplement generation logic.
