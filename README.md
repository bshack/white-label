# generator-white-label

`generator-white-label` is a framework-independent TypeScript project generator for small, accessible, SEO-friendly, HTML-first sites with progressive enhancement, composable White Label primitives, first-party tagged HTML templates, and a provider-neutral Node.js function example.

[Documentation](https://whitelabeljs.org/docs/generator/) · [API reference](https://whitelabeljs.org/api/#generator) · [Demo site](https://whitelabeljs.org/)

White Label does not prescribe a framework. It provides focused pieces that can be composed where useful and omitted where they are not.

## Where the generator fits

Use the generator when starting a **new** site or small web application and you want:

- meaningful static HTML before client JavaScript runs;
- progressive enhancement instead of an SPA requirement;
- explicit Model/View/Mediator/Router boundaries;
- ordinary TypeScript with readable HTML-shaped templates;
- accessibility and search-oriented defaults;
- a small codebase that remains easy for humans and coding agents to inspect;
- provider-neutral Web `Request`/`Response` serverless composition.

The generated project is especially well suited to public sites, documentation/content experiences, agency or multi-client work, small product/account surfaces, and teams that want application structure without handing architecture to a full framework.

### Already have an application?

Do **not** use the generator to layer a scaffold over it. The generator intentionally rejects a non-empty destination.

Existing server-rendered, CMS, commerce, Rails/PHP/Java/.NET, or long-lived frontend applications should install the individual White Label runtime packages they need and adopt them incrementally. See [`EXISTING_APPLICATIONS.md`](EXISTING_APPLICATIONS.md) and the public [incremental server-rendered application guide](https://whitelabeljs.org/guides/incremental-javascript-for-server-rendered-apps/).

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

These are responsibilities, not mandatory layers. Static content can stay a plain TypeScript function that returns tagged HTML. A feature that does not need routing does not need a router; a feature that only needs local state can use Model by itself.

- [`white-label-router`](https://github.com/bshack/white-label-router) turns location into application intent.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) coordinates application events.
- [`white-label-model`](https://github.com/bshack/white-label-model) owns observable state.
- [`white-label-view`](https://github.com/bshack/white-label-view) owns rendering and DOM lifecycle.
- `white-label-view/html` provides the first-party tagged-template helpers used by the generator.

The goal is simple boundaries with explicit composition.

## Tagged HTML templates

Generated pages and View templates are ordinary `.ts` functions:

```ts
import {html} from 'white-label-view/html';

export default function Page(data: {title: string}) {
    return html`
        <main>
            <h1>${data.title}</h1>
        </main>
    `;
}
```

Normal text and quoted-attribute interpolations are escaped. Tagged markup composes without double escaping, so small view functions can remain reusable without introducing a component runtime.

Conditional or grouped opening-tag attributes use `attributes()`:

```ts
import {attributes, html} from 'white-label-view/html';

const input = html`
    <input ${attributes({
        type: 'checkbox',
        checked: complete,
        'data-task-id': taskId
    })}>
`;
```

`unsafeHTML()` is deliberately explicit. Use it only for application-owned content that is already trusted or sanitized, such as controlled JSON-LD after applying the application's serialization policy. It is not a sanitizer and it is not a replacement for contextual URL/CSS validation.

The tagged-template runtime rejects interpolation in ambiguous or dangerous contexts such as script/style bodies, comments, tag names, and unquoted attribute positions rather than pretending generic escaping makes those contexts safe.

White Label View remains template-engine agnostic. JSX, Handlebars, Eta, EJS, Mustache, Nunjucks, Pug, and other renderers can remain application dependencies and return their rendered output from View's `template` function. JSX is a tested third-party option rather than a White Label-owned runtime.

See [Template engines](https://whitelabeljs.org/docs/view/#template-engines) for tested integrations and trust boundaries.

## Learn from the generated application

The project is also a teaching tool. The generated landing page demonstrates the same architecture its source and tests document.

The task example shows all four runtime packages working together:

```text
TaskRouter
    ↓ route intent
TaskMediator
    ↓ state operation
TaskModel
    ↓ observable state
TaskView
    ↓ tagged HTML render
DOM
```

A useful reading order is:

1. [`app/index.ts`](app/index.ts) — page composition.
2. [`app/assets/view/sections/LiveExampleSection.ts`](app/assets/view/sections/LiveExampleSection.ts) — static composition around an interactive feature.
3. [`app/assets/view/examples/tasks/TaskExample.ts`](app/assets/view/examples/tasks/TaskExample.ts) — shared tagged-template rendering.
4. [`app/assets/script/tasks/TaskApplication.ts`](app/assets/script/tasks/TaskApplication.ts) — explicit dependency wiring.
5. `TaskRouter`, `TaskMediator`, `TaskModel`, and `TaskView` — one responsibility at a time.
6. [`server/handler.ts`](server/handler.ts) — provider-neutral `Request`/`Response` composition.
7. Tests — executable contracts for browser and generated-project behavior.

## Create a project

Requirement:

- Node.js `^22.18.0` or `>=24.11.0`

Run the package directly:

```sh
npx generator-white-label create my-project
# or
yarn dlx generator-white-label create my-project
# or
pnpm dlx generator-white-label create my-project
```

A global install also exposes the `white-label` command:

```sh
npm install --global generator-white-label
white-label create my-project
```

After generation, use one package manager consistently:

```sh
cd my-project
npm install && npm test
# or: yarn install && yarn test
# or: pnpm install && pnpm test
```

There is one canonical scaffold. The CLI has no renderer prompt and no `--jsx`/`--no-jsx` mode switch.

The generator refuses to layer a scaffold over an existing non-empty destination. This protection is enforced by the shared `createProject()` engine for both CLI and programmatic use. An existing empty directory is allowed; a missing directory is created.

See [`CLI.md`](CLI.md), [`PACKAGE_MANAGERS.md`](PACKAGE_MANAGERS.md), and [`EXISTING_APPLICATIONS.md`](EXISTING_APPLICATIONS.md).

## Progressive enhancement and SEO

The generated project renders meaningful HTML during the build. Interactive task filters are real links first and are enhanced with History API navigation after initialization.

```text
HTML owns semantics.
JavaScript enhances behavior.
```

Public content should remain readable, navigable, and crawlable without executing the enhancement bundle. Generated pages include canonical URLs, page titles/descriptions, robots metadata, semantic navigation, JSON-LD, and sitemap-oriented output; deployment still needs to serve the generated files correctly.

Do not treat metadata in source code as proof of search-engine indexing. Verify deployed behavior and indexing with actual production/search-console evidence.

## A simple View click event

Use View lifecycle hooks to add and remove browser listeners with the same callback reference:

```ts
import View from 'white-label-view';

class ButtonView extends View {
    handleClick = () => console.log('Clicked');

    addListeners() {
        this.element.addEventListener('click', this.handleClick);
        return this;
    }

    removeListeners() {
        this.element.removeEventListener('click', this.handleClick);
        return this;
    }
}
```

`addListeners()` runs when the View mounts. `removeListeners()` runs before replacement or destruction, so listener ownership remains explicit.

## Programmatic API

Project creation has one implementation:

```js
import {createProject} from 'generator-white-label';

await createProject({
    destination: new URL('./my-project', import.meta.url).pathname
});
```

`createProject(options)` returns `Promise<void>`. A successful call resolves with `undefined`; file-system failures reject. If the destination exists and contains files, it rejects before copying or writing project content.

`createProject()` is the canonical creation API. The CLI and future integrations are adapters around it rather than separate generation systems. Keeping overwrite policy here prevents adapters from bypassing the same safety boundary.

## Serverless and function runtimes

Every generated project includes `server/handler.ts`, a provider-neutral example built around Web `Request` and `Response`. It composes Router, Mediator, Model, and `white-label-view/server` without Express or a provider SDK.

Mutable White Label instances are created inside `handleRequest()`. Serverless hosts can reuse a warm process for many requests, so mutable module-level state can leak request data or listeners. Immutable configuration can still live at module scope when its lifetime is intentionally process-wide.

Cloud-specific adapters should stay at the boundary: translate a provider request into a Web `Request` when needed, call `handleRequest()`, then translate the returned `Response` back only if required.

Generated-project tests exercise sequential warm invocations, concurrent requests, request-data escaping, execution without browser globals, and a browser/Web-target bundle smoke test. They also enforce serverless composition size/import regression budgets. These are regression guards, not universal latency guarantees.

The Web-target smoke test does **not** claim blanket Cloudflare/Deno/edge-provider compatibility. Published runtime packages document Node as their supported server runtime; verify a specific target before deployment.

## Source layout

| Path | Purpose |
| --- | --- |
| `scaffold/index.ts` | Canonical `createProject()` implementation and destination-safety boundary |
| `cli/index.ts` | First-party command-line adapter |
| `app/*.ts` | Static pages using tagged HTML templates |
| `app/assets/view/` | Reusable tagged-template views and sections |
| `app/assets/script/tasks/` | Model/View/Mediator/Router example |
| `server/handler.ts` | Provider-neutral serverless Request → Response example |
| `scripts/build.ts` | Static rendering and asset build |
| `test/` | Executable contracts and integration tests |
| `template-test/` | Generated-project validation |

No React, Bootstrap, Sass, Eta, Handlebars, Mustache, Nunjucks, Pug, web font, cloud SDK, or browser-side template framework is required. Optional renderers/providers remain application dependencies.

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

Tests are part of the documentation. Executable project source is held to 100% statement, branch, function, and line coverage. CI checks supported Node versions, packed CLI/programmatic installation, production builds, and generated-project compatibility across npm, Yarn, and pnpm.

## Coordinated runtime release

Generator 10 targets the published White Label runtime line: `white-label-mediator@5.0.1`, `white-label-model@7.0.2`, `white-label-router@6.1.1`, and `white-label-view@7.0.1`. The release and install baseline is registry-backed; CI additionally substitutes a fixed packed View 7 source revision in coordinated integration jobs.

## White Label ecosystem

- [`white-label-model`](https://github.com/bshack/white-label-model) — observable state.
- [`white-label-view`](https://github.com/bshack/white-label-view) — rendering, existing-DOM lifecycle, tagged HTML templates, server rendering, and a template-engine-agnostic contract.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) — application events.
- [`white-label-router`](https://github.com/bshack/white-label-router) — progressive routing and URL state.

The generated project imports the real packages rather than reproducing their behavior locally. That makes it both an example and an ecosystem integration test.
