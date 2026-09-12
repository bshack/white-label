# generator-white-label

`generator-white-label` creates a small, production-oriented static TypeScript site using Tailwind CSS 4, the framework-independent JSX runtime from `white-label-view`, esbuild, and the White Label model, view, router, and mediator packages. It renders meaningful HTML during the build so primary content does not depend on JavaScript for accessibility or search discovery.

The generated example is the Gold North historical site. It is deliberately substantial enough to exercise the complete stack; replace its editorial content while retaining the tested structure and conventions.

## Requirements

- Node.js `^22.18.0` or `>=24.11.0`
- npm 11 or newer

## Create a site

The Yeoman interface remains available as an optional interactive wrapper:

```sh
npm install --global yo generator-white-label
mkdir my-site && cd my-site
yo white-label
npm install
npm test
```

The scaffold can also be called directly from Node:

```js
import {createSite} from 'generator-white-label/scaffold';

await createSite({destination: new URL('./my-site', import.meta.url).pathname});
```

`createSite()` is the canonical scaffold implementation. The Yeoman generator delegates to that API through Yeoman's staged filesystem adapter, so both entry points generate the same files and manifest.

## Source layout

| Path | Purpose |
| --- | --- |
| `app/*.tsx` | JSX page modules rendered to static HTML |
| `app/assets/data/view/*.json` | Global and page-specific rendering data |
| `app/assets/script/*.tsx` | Strict browser TypeScript/JSX bundled by esbuild |
| `app/assets/style/global.css` | Tailwind entry plus project-specific styles |
| `app/assets/style/print.css` | Print-only CSS |
| `scripts/build.ts` | Static JSX rendering, Tailwind compilation, scripts, robots, and sitemap generation |
| `test/` | Integration, WCAG-oriented, and search-indexability checks |

No Bootstrap, Sass, Eta, React, Handlebars, web fonts, or font files are included.

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

JSX text and attribute expressions are escaped by the White Label runtime. Use `raw()` only for trusted application-authored markup. The starter uses it only for serialized JSON-LD after escaping `<` to prevent script termination.

## Tailwind CSS

The generated site uses Tailwind CSS 4.3.3 through the first-party CLI. `app/assets/style/global.css` imports Tailwind and explicitly sets the project root as the source-detection base. Tailwind scans the TSX page and browser source files at build time and emits a static stylesheet with no browser-side Tailwind runtime.

Project-specific component styles can live alongside Tailwind in `global.css`; prefer normal Tailwind utilities in TSX for new layout and presentation work when they keep the markup readable.

## Build and preview

Development builds default to `http://localhost:8080`:

```sh
npm run build -- --version=local
python3 -m http.server 8080 --directory _deploy
```

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
npm run audit
```

Generated tests validate HTML, run axe rules tagged for WCAG 2.0/2.1/2.2 Level A and AA, require crawlable links and initial HTML content, parse structured data, and verify canonical, robots, and sitemap signals. Custom browser integration maintains full coverage requirements.

Automated testing cannot establish every WCAG success criterion. Before deployment, manually verify keyboard operation, responsive reflow/zoom, screen-reader structure, contrast, reduced-motion behavior, pointer targets, and SEO metadata accuracy.

## Integrated package example

The generated browser entry demonstrates:

- `white-label-model`: observable application state.
- `white-label-view`: DOM lifecycle and model-driven JSX rendering.
- `white-label-mediator`: decoupled selection and navigation events.
- `white-label-router`: crawlable query-string navigation with History API enhancement.
- `white-label-view/jsx-runtime`: escaped static and client-side JSX without React or another template engine.

`white-label-service` remains independent and is not required by the static example.

## License

MIT
