# generator-white-label

`generator-white-label` creates small, production-oriented TypeScript sites from composable White Label primitives. The generated starter uses Tailwind CSS 4, the framework-independent JSX runtime from [`white-label-view`](https://github.com/bshack/white-label-view), esbuild, and the White Label model, view, mediator, and router packages.

The starter is intentionally more than a template. Its landing page, README, source code, and tests are designed as one reference application: **read the explanation, use the example, then follow the same architecture through the source.**

White Label does not prescribe a framework. It provides focused primitives that can be composed where they are useful and omitted where they are not.

## The idea

A typical interactive feature can be understood as a small flow of responsibilities:

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

That diagram describes responsibilities, not mandatory layers. A feature that does not need routing does not need a router. Static content does not need a model or mediator. The generated landing page deliberately uses plain JSX functions for static sections and introduces the full stack only for its interactive task example.

The goal is to keep each concern small enough to understand independently:

- [`white-label-router`](https://github.com/bshack/white-label-router) interprets location and turns URLs into application intent.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) coordinates application events without making otherwise independent pieces know about one another.
- [`white-label-model`](https://github.com/bshack/white-label-model) owns observable application state without knowing about the DOM or routing.
- [`white-label-view`](https://github.com/bshack/white-label-view) owns rendering and DOM lifecycle without owning application state.
- [`white-label-view/jsx-runtime`](https://github.com/bshack/white-label-view) provides escaped JSX for static and client-side rendering without React or another template engine.

Keeping those boundaries independent makes them easier to test, replace, reuse, and run in different environments.

## Learn from the generated application

The landing page is a working example of the architecture it documents. Its static sections show the simplest useful abstraction: small JSX view functions composed by `app/index.tsx`. The interactive task example then demonstrates Model, View, Mediator, and Router working together.

The task flow is intentionally easy to trace:

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

A user can add and complete tasks, filter them through crawlable URLs, navigate with browser history, and see model state rendered through the View. The initial task markup is also produced with the same JSX renderer used by the browser, so the example remains meaningful before JavaScript enhancement.

This is the central White Label pattern demonstrated by the starter: **state, coordination, navigation, and rendering remain separate while the application wiring stays explicit.**

## Read the source

The source is deliberately written as live documentation. A useful reading order is:

1. [`app/index.tsx`](app/index.tsx) — see how a page is composed from focused JSX views.
2. [`app/assets/view/sections/LiveExampleSection.tsx`](app/assets/view/sections/LiveExampleSection.tsx) — see static page composition around an interactive feature.
3. [`app/assets/view/examples/tasks/TaskExample.tsx`](app/assets/view/examples/tasks/TaskExample.tsx) — see one JSX representation shared by build-time and browser rendering.
4. [`app/assets/script/tasks/TaskApplication.ts`](app/assets/script/tasks/TaskApplication.ts) — see the application's dependencies wired together explicitly.
5. [`app/assets/script/tasks/TaskRouter.ts`](app/assets/script/tasks/TaskRouter.ts), [`TaskMediator.ts`](app/assets/script/tasks/TaskMediator.ts), [`TaskModel.ts`](app/assets/script/tasks/TaskModel.ts), and [`TaskView.tsx`](app/assets/script/tasks/TaskView.tsx) — follow one responsibility at a time.
6. [`test/app.test.js`](test/app.test.js) — see the same architecture exercised as an integrated feature.

Comments in these files focus on *why* a boundary exists rather than narrating obvious TypeScript. The example is intentionally small enough to copy, but realistic enough to demonstrate browser navigation, observable state, event coordination, rendering, teardown, progressive enhancement, and testing.

When extending a generated application, prefer the same rule used here: **introduce an abstraction when it gives a concern a clear home, not merely to create another layer.**

## Create a site

### Requirements

- Node.js `^22.18.0` or `>=24.11.0`
- npm 11 or newer

### First-party CLI

The simplest way to create a project is the first-party CLI:

```sh
npm install --global generator-white-label
white-label create my-site
cd my-site
npm install
npm test
```

Run `white-label --help` for usage. The CLI resolves the destination relative to the current working directory and delegates to the same `createSite()` implementation used by every other interface. See [`CLI.md`](CLI.md) for the complete CLI contract.

### Programmatic API

Automation can call the scaffold directly without creating a CLI or Yeoman environment:

```js
import {createSite} from 'generator-white-label/scaffold';

await createSite({
    destination: new URL('./my-site', import.meta.url).pathname
});
```

`createSite()` is the canonical scaffold implementation. Integrations that stage filesystem changes may supply a custom `fileSystem` adapter implementing `copy()` and `writeJSON()`.

This follows the same design principle as the generated application: **one responsibility has one implementation, while adapters translate different environments into that implementation.** The CLI and Yeoman wrapper therefore cannot quietly evolve separate scaffolding behavior.

### Optional Yeoman wrapper

Yeoman remains available for existing Yeoman-based workflows:

```sh
npm install --global yo generator-white-label
mkdir my-site && cd my-site
yo white-label
npm install
npm test
```

The Yeoman generator delegates to `createSite()` through Yeoman's staged filesystem adapter. Downstream applications do not depend on Yeoman at runtime.

The generated manifest is intentionally reviewable before installation. Runtime application libraries are in `dependencies`; compilers, Tailwind tooling, validation tools, test DOM, and type declarations are in `devDependencies`.

## Source layout

| Path | Purpose |
| --- | --- |
| `cli/index.ts` | First-party `white-label create` adapter over `createSite()` |
| `scaffold/index.ts` | Canonical, environment-independent scaffold API |
| `generators/app/index.ts` | Optional Yeoman adapter over the scaffold API |
| `app/*.tsx` | Top-level JSX pages rendered to static HTML |
| `app/assets/view/` | Reusable page sections and shared JSX feature views |
| `app/assets/script/tasks/` | Model/View/Mediator/Router task example and application wiring |
| `app/assets/data/view/*.json` | Global and page-specific rendering data |
| `app/assets/style/global.css` | Tailwind entry plus project-specific styles |
| `app/assets/style/print.css` | Print-only CSS |
| `scripts/build.ts` | Static JSX rendering, Tailwind compilation, scripts, robots, and sitemap generation |
| `test/` | CLI, scaffold, integration, architecture, and source-contract tests |
| `template-test/` | Generated-site HTML, accessibility, and search-indexability checks |

No Bootstrap, Sass, Eta, React, Handlebars, web fonts, or font files are included. The starter uses the platform font stack and ships no browser-side template framework.

## JSX rendering

TypeScript is configured with the White Label JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "white-label-view"
  }
}
```

A page can therefore remain an ordinary TypeScript function:

```tsx
export default function Page(data: Record<string, unknown>) {
    return <main><h1>{String(data.title)}</h1></main>;
}
```

For larger pages, compose focused views instead of growing one renderer indefinitely:

```tsx
export default function Page(data: PageData) {
    return (
        <>
            <HeroSection />
            <LiveExampleSection />
            <GettingStartedSection />
        </>
    );
}
```

This is intentionally ordinary JSX. White Label should make application boundaries clearer without making simple presentation code ceremonial.

JSX text and attribute expressions are escaped by the White Label runtime. Use `raw()` only for trusted, application-authored markup. Never treat user-controlled text as trusted raw markup.

## Progressive enhancement

The starter renders meaningful HTML during the build, so core content does not depend on JavaScript for accessibility or search discovery. Interactive task filters are real links first; the browser application enhances them with History API navigation after initialization.

That distinction is deliberate: **HTML owns navigation semantics, while JavaScript enhances application behavior.** A router does not require replacing useful browser primitives.

## Tailwind CSS

The generated site uses Tailwind CSS 4 through the first-party Tailwind CLI. `app/assets/style/global.css` imports Tailwind and sets the project root as the source-detection base. Tailwind scans TSX page and browser source files at build time and emits static CSS with no browser-side Tailwind runtime.

The reference landing page intentionally keeps presentation restrained so its architecture remains easy to inspect. Project-specific component styles can live alongside Tailwind in `global.css`; prefer normal Tailwind utilities in TSX when they keep markup readable, and use shared CSS when repeating utilities would obscure the example.

## Build and preview

Development builds default to `http://localhost:8080`:

```sh
npm run build -- --version=local
python3 -m http.server 8080 --directory _deploy
```

Open `http://localhost:8080/`. `_deploy` must be the static server's document root. The generated HTML uses origin-rooted asset URLs such as `/release/local/assets/style/global.css`, so serving the parent project directory will make those assets resolve incorrectly.

Production builds require the public HTTPS origin so canonical, Open Graph, robots, and sitemap URLs are correct:

```sh
npm run build -- \
  --version=2026.09.12 \
  --production=true \
  --site-url=https://www.example.com \
  --www=/ \
  --cdn=/
```

The build creates `_deploy/index.html`, `_deploy/404.html`, `_deploy/robots.txt`, `_deploy/sitemap.xml`, and versioned assets beneath `_deploy/release/<version>/assets`.

## Verification as documentation

The tests are another place to learn the intended contracts:

```sh
npm run lint
npm test
npm run coverage
npm run audit
npm pack --dry-run
```

The integration tests show how the real Model, View, Mediator, Router, and JSX runtime fit together. Generated-site tests validate HTML, run axe rules tagged for WCAG 2.0/2.1/2.2 Level A and AA, require crawlable links and initial HTML content, parse structured data, and verify canonical, robots, and sitemap signals.

Executable project source is held to 100% statement, branch, function, and line coverage. CI also packs the npm artifact, installs it into a clean temporary project, verifies the public scaffold import and `white-label` binary, and executes the packed CLI help path. The purpose is not only regression protection: these tests make the public contracts executable and reviewable.

Automated testing cannot establish every WCAG success criterion. Before deployment, manually verify at minimum:

1. Keyboard-only operation, focus order, and focus not being obscured at responsive sizes.
2. 200% text resize and 400% zoom/reflow without loss of content or function.
3. Screen-reader names, landmarks, headings, status messages, and reading order.
4. Text and non-text contrast in supported browsers, including forced-colors mode.
5. Reduced-motion behavior and pointer targets of at least 24 by 24 CSS pixels, with 44 by 44 preferred.
6. Accuracy of alternative text, page titles, descriptions, canonical URLs, and structured data.

For indexing, deploy public pages with successful `200` responses, do not add `noindex`, keep assets crawlable, serve `robots.txt` and `sitemap.xml` from the origin root, and verify the deployed URL in the search engine's inspection tool. A sitemap assists discovery but does not guarantee indexing.

## White Label ecosystem

The generator is an integration point for the active White Label packages. Each package remains independently useful:

- [`white-label-model`](https://github.com/bshack/white-label-model) — observable application state.
- [`white-label-view`](https://github.com/bshack/white-label-view) — rendering, DOM lifecycle, and JSX.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) — decoupled application events.
- [`white-label-router`](https://github.com/bshack/white-label-router) — application routing and URL state.

The generated site intentionally imports the real packages rather than reproducing their behavior locally. That makes the starter both an example and an ecosystem integration test.

## Design principles demonstrated here

- **Compose instead of prescribe.** Use only the White Label primitives a feature needs.
- **Keep ownership obvious.** State belongs to the Model, rendering to the View, coordination to the Mediator, and location interpretation to the Router.
- **Prefer explicit wiring.** `TaskApplication` makes dependencies visible instead of hiding them behind framework magic.
- **Keep simple things simple.** Static page sections remain ordinary JSX functions.
- **Enhance the platform.** Useful HTML exists before browser JavaScript initializes.
- **Use one implementation behind adapters.** CLI, programmatic, and Yeoman scaffolding share `createSite()`.
- **Make contracts executable.** Tests demonstrate intended usage as well as protecting behavior.
- **Let the source teach.** Structure and comments are part of the documentation surface.

## License

MIT
