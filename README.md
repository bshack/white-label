# generator-white-label

`generator-white-label` creates a small, production-oriented static TypeScript site using Eta templates, Sass, a curated Bootstrap 5.3 stylesheet, and the white-label model, view, router, and mediator packages. It renders meaningful HTML during the build so content does not depend on JavaScript for accessibility or search discovery.

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

The generated manifest is intentionally reviewable before installation. Runtime application libraries are in `dependencies`; compilers, Bootstrap source CSS, validation tools, test DOM, and type declarations are in `devDependencies`.

## Source layout

| Path | Purpose |
| --- | --- |
| `app/*.eta` | Eta page templates rendered to HTML |
| `app/assets/data/view/*.json` | Global and page-specific rendering data |
| `app/assets/script/*.ts` | Strict browser TypeScript bundled by esbuild |
| `app/assets/style/*.scss` | Site and print styles built with Sass and the curated Bootstrap reset/theme/accessibility/utility subset used by the starter |
| `scripts/build.ts` | Static build, robots, canonical and sitemap generation |
| `test/` | Integration, WCAG-oriented and search-indexability checks |

No web fonts or font files are included. The starter uses Bootstrap's native system font stack, avoiding a blocking font request and preserving the user's platform typography.

## Eta templates

Eta escapes interpolated values by default:

```eta
<h1><%= it.title %></h1>
<p><%= it.description %></p>
```

Only use Eta's raw-output tag (`<%~ ... %>`) for trusted, application-authored markup such as serialized structured data. Never treat user-controlled text as a template. See [Eta's security guidance](https://eta.js.org/docs/4.x.x/intro/security).

## Build and preview

Development builds default to `http://localhost:8080`:

```sh
npm run build -- --version=local
python3 -m http.server 8080 --directory _deploy
```

Production builds require the public HTTPS origin so canonical, Open Graph, robots, and sitemap URLs are correct:

```sh
npm run build -- \
  --version=2026.09.07 \
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
- `white-label-view`: DOM lifecycle and model-driven rendering.
- `white-label-mediator`: decoupled selection and navigation events.
- `white-label-router`: crawlable query-string navigation with History API enhancement.
- Eta: escaped server/build-time pages and client-side view markup.

`white-label-service` remains independent and is not required by the static example.

## License

MIT

## Current performance notes

The generated stylesheet includes Bootstrap's reset, theme variables, visually-hidden helper, and the flex/wrap/gap utilities used by the starter. Other Bootstrap components are not bundled by default. Add their Sass imports in `app/assets/style/bootstrap.scss` when adding those components. Bootstrap's MIT attribution is retained.

The status template is compiled once. Scroll progress uses a coalesced animation frame and a transform; resize and route changes refresh it, and teardown cancels pending work. Runtime Eta compilation occurs at initialization, so strict CSP deployments should account for that behavior. Runtime library revisions remain explicitly pinned and are adopted through reviewed version or commit updates.
