# generator-white-label

`generator-white-label` creates a small, production-oriented static TypeScript site using Tailwind CSS 4, the framework-independent JSX runtime from [`white-label-view`](https://github.com/bshack/white-label-view), esbuild, and the White Label model, view, router, and mediator packages. It renders meaningful HTML during the build so content does not depend on JavaScript for accessibility or search discovery.

The package now provides three interfaces over one canonical scaffold implementation: the first-party `white-label` CLI, the programmatic `generator-white-label/scaffold` API, and an optional Yeoman compatibility wrapper. New automation does not need a Yeoman environment.

The generated example is a neutral White Label starter and package showcase. It is deliberately substantial enough to exercise the complete stack; replace its editorial content while retaining the tested structure and conventions.

## Requirements

- Node.js `^22.18.0` or `>=24.11.0`
- npm 11 or newer

## Create a site

### First-party CLI

The preferred interactive shell entrypoint is the package's own CLI:

```sh
npm install --global generator-white-label
white-label create my-site
cd my-site
npm install
npm test
```

Run `white-label --help` for usage. The CLI resolves the destination relative to the current working directory and delegates directly to the same `createSite()` implementation used by every other interface. See `CLI.md` for the complete CLI contract.

### Programmatic API

The scaffold can be called directly from Node without creating a CLI or Yeoman environment:

```js
import {createSite} from 'generator-white-label/scaffold';

await createSite({
    destination: new URL('./my-site', import.meta.url).pathname
});
```

`createSite()` is the canonical scaffold implementation. Integrations that stage filesystem changes may supply a custom `fileSystem` adapter implementing `copy()` and `writeJSON()`.

### Optional Yeoman wrapper

The Yeoman interface remains available for users who already have Yeoman-based workflows:

```sh
npm install --global yo generator-white-label
mkdir my-site && cd my-site
yo white-label
npm install
npm test
```

The Yeoman generator delegates to `createSite()` through Yeoman's staged filesystem adapter. It does not own a second template or scaffolding implementation, and downstream applications do not depend on Yeoman at runtime.

The generated manifest is intentionally reviewable before installation. Runtime application libraries are in `dependencies`; compilers, Tailwind tooling, validation tools, test DOM, and type declarations are in `devDependencies`.

## Source layout

| Path | Purpose |
| --- | --- |
| `cli/index.ts` | First-party `white-label create` command backed by `createSite()` |
| `scaffold/index.ts` | Canonical Yeoman-independent scaffold API |
| `generators/app/index.ts` | Optional Yeoman adapter over the scaffold API |
| `app/*.tsx` | JSX page modules rendered to static HTML |
| `app/assets/data/view/*.json` | Global and page-specific rendering data |
| `app/assets/script/*.tsx` | Strict browser TypeScript/JSX bundled by esbuild |
| `app/assets/style/global.css` | Tailwind entry plus project-specific styles |
| `app/assets/style/print.css` | Print-only CSS |
| `scripts/build.ts` | Static JSX rendering, Tailwind compilation, scripts, robots, and sitemap generation |
| `test/` | CLI, scaffold, integration, WCAG-oriented, and search-indexability checks |

No Bootstrap, Sass, Eta, React, Handlebars, web fonts, or font files are included. The starter retains a system font stack, avoiding a blocking font request and preserving the user's platform typography.

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

Page modules export a default render function:

```tsx
export default function Page(data: Record<string, unknown>) {
    return <main><h1>{String(data.title)}</h1></main>;
}
```

JSX text and attribute expressions are escaped by the White Label runtime. Use `raw()` only for trusted, application-authored markup. The starter uses it only for serialized structured data after escaping `<` to prevent script termination. Never treat user-controlled text as trusted raw markup.

## Tailwind CSS

The generated site uses Tailwind CSS 4.3.3 through the first-party Tailwind CLI. `app/assets/style/global.css` imports Tailwind and explicitly sets the project root as the source-detection base. Tailwind scans the TSX page and browser source files at build time and emits a static stylesheet with no browser-side Tailwind runtime.

Project-specific component styles can live alongside Tailwind in `global.css`; prefer normal Tailwind utilities in TSX for new layout and presentation work when they keep the markup readable.

## Build and preview

Development builds default to `http://localhost:8080`:

```sh
npm run build -- --version=local
python3 -m http.server 8080 --directory _deploy
```

Open `http://localhost:8080/`. `_deploy` must be the static server's document root. Do not serve the parent project directory and browse to `/my-site/_deploy/index.html`; the generated HTML intentionally uses origin-rooted asset URLs such as `/release/local/assets/style/global.css`, and serving the wrong document root will make those assets return 404 responses.

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

## Accessibility and search verification

```sh
npm run lint
npm test
npm run coverage
npm run audit
npm pack --dry-run
```

Generated tests validate HTML, run axe rules tagged for WCAG 2.0/2.1/2.2 Level A and AA, require crawlable links and initial HTML content, parse structured data, and verify canonical, robots, and sitemap signals. Project coverage is enforced at 100% for statements, branches, functions, and lines, including the first-party CLI. CI also packs the npm artifact, installs it into a clean temporary project, verifies the public scaffold import, verifies the `white-label` bin entry, and executes the packed CLI help path.

Automated testing cannot establish every WCAG success criterion. Before deployment, manually verify at minimum:

1. Keyboard-only operation, focus order, and focus not being obscured at responsive sizes.
2. 200% text resize and 400% zoom/reflow without loss of content or function.
3. Screen-reader names, landmarks, headings, status messages, and reading order.
4. Text and non-text contrast in actual supported browsers, including forced-colors mode.
5. Reduced-motion behavior and pointer targets of at least 24 by 24 CSS pixels, with 44 by 44 preferred.
6. Accuracy of alternative text, page titles, descriptions, canonical URLs, and structured data.

For indexing, deploy public pages with successful `200` responses, do not add `noindex`, keep assets crawlable, serve `robots.txt` and `sitemap.xml` from the origin root, and verify the deployed URL in the search engine's inspection tool. A sitemap assists discovery but does not guarantee indexing.

## Integrated package example

The generated browser entry demonstrates:

- [`white-label-model`](https://github.com/bshack/white-label-model): one observable entry point for plain-object, array, and Map state.
- [`white-label-view`](https://github.com/bshack/white-label-view): DOM lifecycle and model-driven JSX rendering.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator): decoupled selection and navigation events.
- [`white-label-router`](https://github.com/bshack/white-label-router): crawlable query-string navigation with History API enhancement.
- [`white-label-view/jsx-runtime`](https://github.com/bshack/white-label-view): escaped static and client-side JSX without React or another template engine.

## License

MIT

## Current performance notes

Tailwind is compiled to static CSS during the build and emits only detected utilities plus the starter's project-specific CSS. No browser-side Tailwind runtime, Bootstrap JavaScript, web-font request, or template compiler is shipped to the client.

Scroll progress uses a coalesced animation frame and a transform; resize and route changes refresh it, and teardown cancels pending work. JSX rendering uses the White Label runtime directly rather than runtime template compilation, which removes the starter's previous Eta compilation requirement and is friendlier to strict CSP deployments.
