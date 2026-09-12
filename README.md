# generator-white-label

`generator-white-label` creates a small, production-oriented static TypeScript site using Tailwind CSS 4, the framework-independent JSX runtime from `white-label-view`, esbuild, and the White Label model, view, router, and mediator packages. It renders meaningful HTML during the build so content does not depend on JavaScript for accessibility or search discovery.

The generated example is the Gold North historical site. It is deliberately substantial enough to exercise the complete stack; replace its editorial content while retaining the tested structure and conventions.

## Requirements

- Node.js `^22.18.0` or `>=24.11.0`
- npm 11 or newer

## Versioning policy

White Label does not preserve superseded APIs or generated-project behavior with compatibility aliases, deprecated signatures, sentinel arguments, duplicate code paths, or other runtime shims. When a public generator contract or generated application API changes incompatibly, that change is communicated with a Semantic Versioning major release and release notes outside this README. Generated projects should use the current documented contracts directly rather than carrying compatibility code.

## Create a site

The Yeoman interface remains available as an optional interactive wrapper:

```sh
npm install --global yo generator-white-label
mkdir my-site && cd my-site
yo white-label
npm install
npm test
```

The scaffold can also be called directly from Node without creating a Yeoman environment:

```js
import {createSite} from 'generator-white-label/scaffold';

await createSite({
    destination: new URL('./my-site', import.meta.url).pathname
});
```

`createSite()` is the canonical scaffold implementation. The Yeoman generator delegates to that API through Yeoman's staged filesystem adapter, so both entry points generate the same files and manifest. Integrations that stage filesystem changes may supply a custom `fileSystem` adapter implementing `copy()` and `writeJSON()`.

The generated manifest is intentionally reviewable before installation. Runtime application libraries are in `dependencies`; compilers, Tailwind tooling, validation tools, test DOM, and type declarations are in `devDependencies`.

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

Generated tests validate HTML, run axe rules tagged for WCAG 2.0/2.1/2.2 Level A and AA, require crawlable links and initial HTML content, parse structured data, and verify canonical, robots, and sitemap signals. Custom browser integration has 100% line, branch, and function coverage.

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

- `white-label-model`: one observable entry point for plain-object, array, and Map state.
- `white-label-view`: DOM lifecycle and model-driven JSX rendering.
- `white-label-mediator`: decoupled selection and navigation events.
- `white-label-router`: crawlable query-string navigation with History API enhancement.
- `white-label-view/jsx-runtime`: escaped static and client-side JSX without React or another template engine.

`white-label-service` remains independent and is not required by the static example.

## License

MIT

## Current performance notes

Tailwind is compiled to static CSS during the build and emits only detected utilities plus the starter's project-specific CSS. No browser-side Tailwind runtime, Bootstrap JavaScript, web-font request, or template compiler is shipped to the client.

Scroll progress uses a coalesced animation frame and a transform; resize and route changes refresh it, and teardown cancels pending work. JSX rendering uses the White Label runtime directly rather than runtime template compilation, which removes the starter's previous Eta compilation requirement and is friendlier to strict CSP deployments. Runtime library revisions remain explicitly pinned and are adopted through reviewed version or commit updates.
