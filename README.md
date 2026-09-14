# generator-white-label

`generator-white-label` creates small, production-oriented TypeScript projects from composable White Label primitives.

The project is also its own teaching tool. The landing page, README, source, and tests are meant to be read together:

```text
understand → see → build → verify
```

White Label does not prescribe a framework. It provides focused pieces that can be composed where useful and omitted where they are not.

## The idea

A typical interactive feature can be understood as a flow of responsibilities:

```text
URL / user action
       ↓
    Router
       ↓
   Mediator
       ↓
     Model
       ↓
      View
       ↓
      DOM
```

These are responsibilities, not mandatory layers. Static content can stay plain JSX or plain TypeScript HTML strings. A feature that does not need routing does not need a router.

- [`white-label-router`](https://github.com/bshack/white-label-router) turns location into application intent.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) coordinates application events.
- [`white-label-model`](https://github.com/bshack/white-label-model) owns observable state.
- [`white-label-view`](https://github.com/bshack/white-label-view) owns rendering and DOM lifecycle.
- [`white-label-view/jsx-runtime`](https://github.com/bshack/white-label-view) provides optional escaped JSX without React or another template engine.

The goal is simple boundaries with explicit composition.

## Learn from the generated application

The generated landing page demonstrates the same architecture it documents.

Its static sections use either JSX functions or equivalent plain TypeScript HTML-string functions, depending on the generator choice. The task example then shows all four packages working together:

```text
TaskRouter
    ↓ route intent
TaskMediator
    ↓ state operation
TaskModel
    ↓ observable state
TaskView
    ↓ render
DOM
```

Both generated variants provide the same application behavior and progressive enhancement. The only difference is template syntax.

## Read the source

For the default JSX scaffold, a useful reading order is:

1. [`app/index.tsx`](app/index.tsx) — page composition.
2. [`app/assets/view/sections/LiveExampleSection.tsx`](app/assets/view/sections/LiveExampleSection.tsx) — static composition around an interactive feature.
3. [`app/assets/view/examples/tasks/TaskExample.tsx`](app/assets/view/examples/tasks/TaskExample.tsx) — shared JSX rendering.
4. [`app/assets/script/tasks/TaskApplication.ts`](app/assets/script/tasks/TaskApplication.ts) — explicit dependency wiring.
5. `TaskRouter`, `TaskMediator`, `TaskModel`, and `TaskView` — one responsibility at a time.
6. [`test/app.test.js`](test/app.test.js) — the architecture exercised as a feature.

The `--no-jsx` scaffold mirrors the same structure with `.ts` files and HTML-string render functions.

Comments focus on why boundaries exist instead of narrating obvious TypeScript.

When documenting public APIs, examples use comments where they clarify intent, lifecycle, side effects, or non-obvious behavior. Public method documentation should also state the return value—including meaningful boolean/status values, chaining returns, `undefined`, promises, and relevant thrown/rejected errors.

A useful rule when extending the project is:

> Introduce an abstraction when it gives a concern a clear home, not merely to create another layer.

## Create a project

Requirement:

- Node.js `^22.18.0` or `>=24.11.0`

Install the CLI globally with your preferred package manager, or run the package directly.

With npm:

```sh
npx generator-white-label create my-project
```

With Yarn:

```sh
yarn dlx generator-white-label create my-project
```

With pnpm:

```sh
pnpm dlx generator-white-label create my-project
```

A global install also exposes the `white-label` command:

```sh
npm install --global generator-white-label
white-label create my-project
```

After generation, use npm, Yarn, or pnpm consistently within the project:

```sh
cd my-project
npm install && npm test
# or: yarn install && yarn test
# or: pnpm install && pnpm test
```

Interactive creation asks whether templates should use JSX/TSX. JSX is optional: choose **Yes** for White Label's first-party JSX syntax such as `<section>...</section>`, or **No** for plain TypeScript functions that return HTML strings. Both choices generate the same functional starter application.

Choose the no-JSX path when another template engine should own rendering. Install that engine in the generated application and call it from the View `template` function; no White Label adapter is required. White Label View currently tests Handlebars, Eta, EJS, Mustache, Nunjucks, and Pug in both browser and server rendering. See [Template engines and JSX options](https://whitelabeljs.org/docs/view/#template-engines) for tested versions, examples, the rendering contract, and security guidance.

For explicit or non-interactive use:

```sh
white-label create my-project --jsx
white-label create my-project --no-jsx

npx generator-white-label create my-project --jsx
npx generator-white-label create my-project --no-jsx
```

The same `--jsx` and `--no-jsx` options work through `yarn dlx` and `pnpm dlx`.

If no interactive answer is available and neither flag is supplied, JSX is the default for backward compatibility.

See [`CLI.md`](CLI.md) for the CLI contract and [`PACKAGE_MANAGERS.md`](PACKAGE_MANAGERS.md) for package-manager compatibility details.

## Programmatic API

Project creation has one implementation:

```js
import {createProject} from 'generator-white-label';

// Resolves after the scaffold files and package manifest have been written.
await createProject({
    destination: new URL('./my-project', import.meta.url).pathname,
    jsx: false
});
```

Set `jsx: true` for JSX/TSX templates or `jsx: false` for plain TypeScript and HTML strings. Use `jsx: false` as the starting point for a third-party template engine. Omitting `jsx` defaults to `true`.

`createProject(options)` returns `Promise<void>`. A successful call resolves with `undefined`; file-system failures reject the promise instead of returning a status value.

`createProject()` is the canonical creation API. The CLI and future integrations are adapters around it rather than separate generation systems.

This is the same design principle used throughout White Label: one responsibility, one implementation, explicit adapters at environment boundaries.

## Source layout

| Path | Purpose |
| --- | --- |
| `scaffold/index.ts` | Canonical `createProject()` implementation |
| `scaffold/no-jsx/` | Plain-TypeScript template equivalents |
| `cli/index.ts` | First-party command-line adapter |
| `app/*.tsx` | Default JSX top-level static pages |
| `app/assets/view/` | Default JSX views and page sections |
| `app/assets/script/tasks/` | Model/View/Mediator/Router example |
| `scripts/build.ts` | Static rendering and asset build for `.ts` and `.tsx` pages |
| `test/` | Executable contracts and integration tests |
| `template-test/` | Generated-project validation |

No React, Bootstrap, Sass, Eta, Handlebars, Mustache, Nunjucks, Pug, web fonts, or browser-side template framework are required. Third-party template engines remain optional application dependencies.

## Template choice: JSX or no JSX

JSX is optional. When enabled, TypeScript uses the White Label JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "white-label-view"
  }
}
```

A page remains an ordinary function:

```tsx
export default function Page(data: Record<string, unknown>) {
    return <main><h1>{String(data.title)}</h1></main>;
}
```

With `--no-jsx`, the equivalent page is ordinary TypeScript returning an HTML string instead. The application architecture and generated features remain the same. That no-JSX scaffold is also the intended starting point when Handlebars, Eta, EJS, Mustache, Nunjucks, Pug, or another renderer should remain the project's template convention.

For larger pages, compose focused views instead of growing one renderer indefinitely.

JSX expressions are escaped by default. In plain-TypeScript templates or third-party engines, applications own the engine's escaping and raw-output configuration. See [Template engines and JSX options](https://whitelabeljs.org/docs/view/#template-engines) for the tested matrix and trust boundaries.

## Progressive enhancement

The generated project renders meaningful HTML during the build. Interactive task filters are real links first and are enhanced with History API navigation after initialization.

The principle is intentional:

```text
HTML owns semantics.
JavaScript enhances behavior.
```

## Build and verify

The repository keeps npm as its canonical maintenance/audit path and committed lockfile. Generated projects support npm, Yarn, and pnpm.

Development build:

```sh
npm run build -- --version=local
python3 -m http.server 8080 --directory _deploy
```

Production build:

```sh
npm run build -- \
  --version=production \
  --production=true \
  --site-url=https://www.example.com
```

Verification:

```sh
npm run lint
npm test
npm run coverage
npm run audit
npm pack --dry-run
```

Tests are part of the documentation. They demonstrate intended contracts while protecting behavior. Executable project source is held to 100% statement, branch, function, and line coverage.

## White Label ecosystem

- [`white-label-model`](https://github.com/bshack/white-label-model) — observable state.
- [`white-label-view`](https://github.com/bshack/white-label-view) — rendering, DOM lifecycle, optional JSX, and a template-engine-agnostic rendering contract.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) — application events.
- [`white-label-router`](https://github.com/bshack/white-label-router) — routing and URL state.

The generated project imports the real packages rather than reproducing their behavior locally. That makes it both an example and an ecosystem integration test.
