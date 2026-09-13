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

These are responsibilities, not mandatory layers. Static content can stay plain JSX. A feature that does not need routing does not need a router.

- [`white-label-router`](https://github.com/bshack/white-label-router) turns location into application intent.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) coordinates application events.
- [`white-label-model`](https://github.com/bshack/white-label-model) owns observable state.
- [`white-label-view`](https://github.com/bshack/white-label-view) owns rendering and DOM lifecycle.
- [`white-label-view/jsx-runtime`](https://github.com/bshack/white-label-view) provides escaped JSX without React or another template engine.

The goal is simple boundaries with explicit composition.

## Learn from the generated application

The generated landing page demonstrates the same architecture it documents.

Its static sections are ordinary JSX functions. The task example then shows all four packages working together:

```text
TaskRouter
    ↓ route intent
TaskMediator
    ↓ state operation
TaskModel
    ↓ observable state
TaskView
    ↓ JSX
DOM
```

The initial task markup and browser updates share the same JSX renderer. The example stays useful before JavaScript enhancement and remains easy to trace after initialization.

## Read the source

A useful reading order is:

1. [`app/index.tsx`](app/index.tsx) — page composition.
2. [`app/assets/view/sections/LiveExampleSection.tsx`](app/assets/view/sections/LiveExampleSection.tsx) — static composition around an interactive feature.
3. [`app/assets/view/examples/tasks/TaskExample.tsx`](app/assets/view/examples/tasks/TaskExample.tsx) — shared JSX rendering.
4. [`app/assets/script/tasks/TaskApplication.ts`](app/assets/script/tasks/TaskApplication.ts) — explicit dependency wiring.
5. `TaskRouter`, `TaskMediator`, `TaskModel`, and `TaskView` — one responsibility at a time.
6. [`test/app.test.js`](test/app.test.js) — the architecture exercised as a feature.

Comments focus on why boundaries exist instead of narrating obvious TypeScript.

A useful rule when extending the project is:

> Introduce an abstraction when it gives a concern a clear home, not merely to create another layer.

## Create a project

Requirements:

- Node.js `^22.18.0` or `>=24.11.0`
- npm 11 or newer

Use the CLI:

```sh
npm install --global generator-white-label
white-label create my-project
cd my-project
npm install
npm test
```

Or run it without a global install:

```sh
npx generator-white-label create my-project
```

See [`CLI.md`](CLI.md) for the small CLI contract.

## Programmatic API

Project creation has one implementation:

```js
import {createProject} from 'generator-white-label';

await createProject({
    destination: new URL('./my-project', import.meta.url).pathname
});
```

`createProject()` is the canonical creation API. The CLI and future integrations are adapters around it rather than separate generation systems.

This is the same design principle used throughout White Label: one responsibility, one implementation, explicit adapters at environment boundaries.

## Source layout

| Path | Purpose |
| --- | --- |
| `scaffold/index.ts` | Canonical `createProject()` implementation |
| `cli/index.ts` | First-party command-line adapter |
| `app/*.tsx` | Top-level static pages |
| `app/assets/view/` | JSX views and page sections |
| `app/assets/script/tasks/` | Model/View/Mediator/Router example |
| `scripts/build.ts` | Static rendering and asset build |
| `test/` | Executable contracts and integration tests |
| `template-test/` | Generated-project validation |

No React, Bootstrap, Sass, Eta, Handlebars, web fonts, or browser-side template framework are required.

## JSX

TypeScript uses the White Label JSX runtime:

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

For larger pages, compose focused views instead of growing one renderer indefinitely.

JSX expressions are escaped by default. Use `raw()` only for trusted application-authored markup.

## Progressive enhancement

The generated project renders meaningful HTML during the build. Interactive task filters are real links first and are enhanced with History API navigation after initialization.

The principle is intentional:

```text
HTML owns semantics.
JavaScript enhances behavior.
```

## Build and verify

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
- [`white-label-view`](https://github.com/bshack/white-label-view) — rendering, DOM lifecycle, and JSX.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) — application events.
- [`white-label-router`](https://github.com/bshack/white-label-router) — routing and URL state.

The generated project imports the real packages rather than reproducing their behavior locally. That makes it both an example and an ecosystem integration test.
