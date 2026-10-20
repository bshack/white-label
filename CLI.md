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

Project creation accepts a missing or existing **empty** directory. A non-empty destination is rejected before scaffold files are copied or written. If creation fails part-way, the files and directories it created are removed again; pre-existing files are never removed.

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

## Usage and exit codes

```text
Usage:
  white-label create <directory>

Commands:
  create <directory>  Create a tagged-template White Label project.

Options:
  -h, --help         Show this help message.
```

`generator-white-label` and `white-label` are the same command.

| Input | Result |
| --- | --- |
| no arguments, `--help`, `-h`, `create --help`, `create -h` | Help on stdout, exit code 0 |
| `create <directory>` | Creates the project, prints `Created White Label project at <absolute path>`, exit code 0 |
| anything else: an unknown command, `create` with no directory, extra arguments, or a directory starting with `-` | Help on stderr, exit code 1, nothing created |
| a non-empty destination, or a file-system failure | `Unable to create White Label project: <reason>` on stderr, exit code 1 |

A relative directory resolves against the current working directory. A destination that begins with `-` is treated as a mistyped option; to create a directory whose name starts with `-`, pass it as a path such as `./-my-project`. See [`PACKAGE_MANAGERS.md`](PACKAGE_MANAGERS.md) for package-manager details.

## Use the API

```js
import {createProject} from 'generator-white-label';

await createProject({
    destination: '/absolute/path/to/my-project'
});
```

`createProject()` applies the same rules as the CLI: missing and empty directories are allowed, non-empty directories are rejected before anything is written, and a failed call removes what it created. It also rejects an empty or non-string `destination` with a `TypeError`. The full API is in the [README](README.md#programmatic-api).

## Read the implementation

The source is intentionally small enough to teach the design:

- `scaffold/index.ts` — project creation and destination-safety boundary
- `cli/index.ts` — command-line adapter
- `app/` — canonical TypeScript/tagged-template starter
- `test/` — executable contracts

Creation behavior belongs in one place. Future integrations should call `createProject()` rather than copy templates or reimplement generation logic.
