# White Label starter

A static TypeScript site built from the White Label packages ([Model](https://github.com/bshack/white-label-model), [View](https://github.com/bshack/white-label-view), [Router](https://github.com/bshack/white-label-router), [Mediator](https://github.com/bshack/white-label-mediator)), with tagged HTML templates, Tailwind CSS 4, and esbuild. Pages are rendered to plain HTML at build time; browser JavaScript only adds interactivity on top. The starter makes no API or service calls.

It was created by [`generator-white-label`](https://github.com/bshack/white-label). Nothing here depends on the generator after creation, so change anything you like.

## Quick start

Requires Node.js `^22.18.0` or `>=24.11.0`. Use npm, Yarn, or pnpm, but pick one and stick with it.

```sh
npm install
npm test                          # build in production mode, then run the tests
npm run build -- --version=local  # development build into _deploy/
python3 -m http.server 8080 --directory _deploy
```

Open `http://localhost:8080/`. Any static file server works; Python is only an example.

Serve `_deploy/` as the server's root. Asset URLs such as `/release/local/assets/style/global.css` start at the site root, so browsing to `_deploy/index.html` through a server rooted at the project directory shows an unstyled page.

## Commands

| npm | Yarn | pnpm | What it does |
| --- | --- | --- | --- |
| `npm run build -- <flags>` | `yarn build <flags>` | `pnpm build <flags>` | Compile TypeScript into `dist/`, then build the site into `_deploy/` |
| `npm test` | `yarn test` | `pnpm test` | Production build, then all tests with a 100% coverage requirement |
| `npm run typecheck` | `yarn typecheck` | `pnpm typecheck` | Type check only, no output |

Pass build flags with your package manager's own syntax: npm needs `--` before the flags; Yarn and pnpm do not. With pnpm, `pnpm build -- --version=local` fails with `Unknown build option: --`, because pnpm passes the `--` through to the script.

## What's in the project

```text
app/
  index.ts, 404.ts          Pages. Each .ts file under app/ (outside assets/) becomes an .html file
  assets/data/view/         Page data: global.json for every page, <page>.json for one page
  assets/script/            Browser code. index.ts is the entry point
    tasks/                  The task example: Model, View, Router, Mediator, and the wiring
  assets/view/              Tagged HTML templates: layout, page sections, the task example's markup
  assets/style/             global.css (Tailwind and theme) and print.css (plain CSS)
server/handler.ts           Example server function using Web Request/Response
scripts/build.ts            The site build
test/site.test.js           Tests for the built site, the task example, and the server function
tsconfig.json               One strict TypeScript config for app/, server/, and scripts/
.gitignore                  Ignores node_modules/, dist/, _deploy/, coverage/, *.tgz
```

Generated output, which you should not edit or commit:

- `dist/` holds the compiled TypeScript. The build imports pages from here.
- `_deploy/` is the deployable site. Every build deletes and recreates it.

## Where to put code

**A new page.** Add `app/<name>.ts` with a default export that returns `html`. Subdirectories work: `app/docs/intro.ts` becomes `_deploy/docs/intro.html`. Optionally add `app/assets/data/view/<name>.json` (or `docs/intro.json`) for that page's data. The function receives one object, merged in this order with later values winning:

1. `app/assets/data/view/global.json`
2. the page's own JSON file, if there is one
3. the build settings: `cdn`, `production`, `siteUrl`, `version`, `www`

```ts
// app/about.ts
import {html} from 'white-label-view/html';

export default function AboutPage(data: Record<string, unknown>) {
    const page = data as {title: string; cdn: string; version: string};
    return html`<html lang="en-US">
        <head>
            <meta charset="utf-8">
            <title>${page.title}</title>
            <link rel="stylesheet" href="${page.cdn}release/${page.version}/assets/style/global.css">
        </head>
        <body><main><h1>About</h1></main></body>
    </html>`;
}
```

The build writes `sitemap.xml` with the site root only. If you add pages that should be indexed, add them to the sitemap in `scripts/build.ts`.

**Reusable markup.** Put template functions in `app/assets/view/`. Static markup only needs a function that returns `html`; see `layout/SiteHeader.ts`.

**Browser behaviour.** Each `.ts` file directly in `app/assets/script/` is bundled on its own into `release/<version>/assets/script/<name>.compiled.js`. Put supporting modules in subdirectories (like `tasks/`) so they are imported rather than bundled separately, and add a `<script src="...compiled.js" defer>` tag to the pages that need it.

**Server code.** `server/handler.ts` compiles to `dist/server/handler.js`. See [Serverless / function runtimes](#serverless--function-runtimes).

**Styles.** Edit `app/assets/style/global.css`. Tailwind scans the project source for class names at build time and writes static CSS; nothing runs in the browser.

## How Model, View, Router, and Mediator fit together

The task example on the home page uses all four packages, each with one job:

```text
URL (?tasks=active)  →  Router    turns the URL into an event: task:filter
form / checkbox      →  Mediator  carries task:add, task:toggle, task:filter between modules
                        Model     holds the tasks and filter; notifies listeners when they change
                        View      re-renders the task markup when the Model changes
```

Read it in this order:

1. `app/assets/view/sections/LiveExampleSection.ts` renders the example's first HTML at build time.
2. `app/assets/view/examples/tasks/TaskExample.ts` is the template. The build and the browser View both use it, so the first render and later updates match.
3. `app/assets/script/tasks/TaskApplication.ts` is the only file that connects the parts. Start here when adding a feature.
4. `TaskModel.ts`, `TaskView.ts`, `TaskRouter.ts`, `TaskMediator.ts` each do one thing.

You do not need all four for every feature. Static content needs only `html`. Local state with a re-render needs only Model and View. Add Router when the URL should drive state, and Mediator when separate modules need to talk without importing each other.

The filter links are real links (`/?tasks=active#example`), so they work without JavaScript. Their `data-pushstate` attribute tells the Router it may handle the click with the History API instead of loading a new page.

### Handling DOM events in a View

Add and remove listeners in View's lifecycle hooks, using the same function both times:

```ts
import View from 'white-label-view';

class ButtonView extends View {
    handleClick = () => {
        console.log('Clicked');
    };

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

View calls `addListeners()` when it attaches and `removeListeners()` before it replaces or destroys its element. For content that re-renders, listen on a parent that stays put, as `TaskApplication.ts` does with `view.delegate()`.

## Templates and escaping

Templates are ordinary TypeScript functions using `html` from `white-label-view/html`:

- Values in text and in quoted attribute values are HTML-escaped. Keep untrusted data (user input, query strings, API responses) in normal `${...}` interpolations.
- Nested `html` results are inserted as markup, without double escaping, so small template functions compose.
- Use `attributes({...})` to build attributes inside an opening tag. `false`, `null`, and `undefined` leave an attribute out; `true` writes a bare boolean attribute such as `checked`; arrays are joined with spaces. Event-handler names (`on*`) are rejected.
- `html` throws instead of interpolating where escaping cannot make a value safe: inside `<script>` or `<style>`, comments, tag names, unquoted attributes, and event-handler attributes such as `onclick`.
- Escaping does not validate meaning. A URL in `href` can still be `javascript:...`, and a value in `style` can still be any CSS. Validate URLs and CSS values yourself before rendering them.
- `unsafeHTML()` inserts a string as raw markup. It is not a sanitizer. Use it only for markup your application produced or has already sanitized. `app/index.ts` uses it for JSON-LD: the data is the page's own, and every `<` is replaced with `<` so it cannot close the `<script>` element.

You can use JSX, Handlebars, Eta, or another template engine instead: install it and return its output from a View's `template` function. See [Template engines](https://whitelabeljs.org/docs/view/#template-engines).

## Build flags

Flags use `--name=value`. Unknown flags and flags without `=value` are errors.

| Flag | Default | Meaning |
| --- | --- | --- |
| `--version` | current Unix time | Asset directory name: `_deploy/release/<version>/assets`. Letters, digits, `.`, `_`, `-` only. Not an npm version |
| `--production` | `false` | `true` minifies CSS and JavaScript, drops source maps, and requires HTTPS for every URL below |
| `--site-url` | `http://localhost:8080` | Public site URL, used for the canonical URL, Open Graph URL, robots.txt, and sitemap.xml |
| `--cdn` | `/` | Prefix for asset URLs: a root-relative path or an absolute URL |
| `--www` | `/` | Prefix for links back to the site, such as the 404 page's home link |

Output in `_deploy/`: one `.html` per page, `robots.txt`, `sitemap.xml`, and `release/<version>/assets/` containing `script/`, `style/`, and `data/` (a copy of `app/assets/data` plus `config.json` with the build settings).

## Deploy

```sh
npm run build -- --version=release-1 --production=true --site-url=https://www.example.com
```

Upload `_deploy/` to any static host as the site root. A new `--version` puts assets in a new directory, so you can cache `release/*` for a long time and only `*.html` needs a short cache. Configure the host to serve `404.html` for missing pages.

Set security headers on the host, too. A static host does not get the headers that `server/handler.ts` sends; a reasonable start is the same `Content-Security-Policy`, `Referrer-Policy`, and `X-Content-Type-Options` values. If you serve assets from another origin with `--cdn`, add that origin to the policy.

## Tests

`npm test` runs a production build with `--site-url=https://example.com`, then `node --test test/*.test.js`. The tests check:

- the built pages are valid HTML with no axe accessibility violations (WCAG 2.2 AA rules), and the 404 page as well;
- SEO signals: canonical URL, title, description, robots meta, JSON-LD, robots.txt, and sitemap.xml;
- the task example in a simulated browser (jsdom): adding, toggling, filtering, and keyboard focus;
- the server function: isolated warm and concurrent requests, escaping, security headers, and a 404;
- the server code bundles for a browser-like target under 100 KB and imports in under 750 ms;
- code colours meet AA contrast.

Coverage must be 100% for lines, branches, and functions in the compiled `app/assets/script/**` and `app/assets/view/examples/tasks/*` modules. New browser code there needs tests, or `npm test` fails. When you replace the starter content, update the tests that check it, and keep the accessibility and SEO checks.

Automated checks catch only some accessibility problems. Test with a keyboard and a screen reader before release.

## Serverless / function runtimes

`server/handler.ts` shows server-side rendering with the standard Web `Request`/`Response` API and no cloud SDK or Express:

```ts
import {handleRequest} from './dist/server/handler.js';

const response = await handleRequest(new Request('https://example.com/hello?name=Ada'));
// 200, "Hello Ada." (escaped); /health → 200; any other path → 404
```

- Everything mutable is request-scoped: it creates a Model, View, Router, and Mediator for each request and destroys them before returning. Serverless platforms reuse a warm process for many requests, so a module-level mutable instance could leak one request's data or listeners into the next. Constant configuration can stay at module level.
- Responses include `Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. Widen the policy deliberately, for one origin at a time, if pages load assets from elsewhere.
- To deploy on a provider, write a thin adapter that converts the provider's event to a `Request`, calls `handleRequest`, and converts the `Response` back if needed.
- A test bundles the server code for a browser-like target to catch Node-only imports. That suggests, but does not prove, that it runs on edge runtimes; test on your provider before relying on it.

## Dependencies and package managers

All versions in `package.json` are exact pins. The four `white-label-*` packages are the only runtime dependencies.

- **Install scripts.** Only `esbuild` and `@parcel/watcher` (used by the Tailwind CLI) may run install scripts: through `allowScripts` (npm), `dependenciesMeta` (Yarn), and `onlyBuiltDependencies` in `pnpm-workspace.yaml` (pnpm).
- **`@parcel/watcher` override.** `@tailwindcss/cli` 4.3.3 depends on `@parcel/watcher` 2.5.1, which pulls in `micromatch` and `braces`. `braces` has a high-severity advisory ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) with no fixed release. `@parcel/watcher` 2.6.0 no longer uses them, so the project forces 2.6.0 in three places: `overrides` (npm) and `resolutions` (Yarn) in `package.json`, and `overrides` in `pnpm-workspace.yaml` (pnpm). When you upgrade `@tailwindcss/cli` to a release that depends on `@parcel/watcher` 2.6.0 or later, delete all three, and update the version in `allowScripts` and `dependenciesMeta` to match.
- **Yarn package age.** `.yarnrc.yml` lets the four `white-label-*` packages install as soon as they are published; every other package still goes through Yarn's age check.

## Next steps

- Replace the starter copy, keeping the skip link, landmarks, headings, and status region patterns.
- Edit TypeScript in `app/`, `server/`, and `scripts/`, never the files in `dist/` or `_deploy/`.
- Documentation: [whitelabeljs.org](https://whitelabeljs.org/) and each package's README.
