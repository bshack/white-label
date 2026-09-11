# generator-white-label

`generator-white-label` creates a small, production-oriented static TypeScript site. Version 6 uses Eta templates, Sass, the complete Bootstrap stylesheet, and the white-label model, view, router, and mediator packages. It renders meaningful HTML during the build so content does not depend on JavaScript for accessibility or search discovery.

The generated example is the Gold North historical site. It is deliberately substantial enough to exercise the complete stack; replace its editorial content while retaining the tested structure and conventions.

## Requirements

- Node.js `^22.18.0` or `>=24.11.0`
- npm 10 or newer

## Versioning policy

White Label does not preserve old APIs or generated-project behavior with compatibility aliases, deprecated signatures, sentinel arguments, duplicate code paths, or other runtime shims. When a public generator contract or generated application API changes incompatibly, that change is communicated with a Semantic Versioning major release and migration notes. Generated projects should use the current documented contracts directly rather than carrying forward compatibility code for earlier major versions.

## Create a site

```sh
npm install --global yo generator-white-label
mkdir my-site && cd my-site
yo white-label
npm install
npm test
```

The generated manifest is intentionally reviewable before installation. Runtime application libraries are in `dependencies`; compilers, Bootstrap source CSS, validation tools, test DOM, and type declarations are in `devDependencies`.

## Source layout

| Path | Purpose |
| --- | --- |
| `app/*.eta` | Eta page templates rendered to HTML |
| `app/assets/data/view/*.json` | Global and page-specific rendering data |
| `app/assets/script/*.ts` | Strict browser TypeScript bundled by esbuild |
| `app/assets/style/*.scss` | Site and print styles built with full Bootstrap CSS |
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

- `white-label-model`: observable filter state and collection lifecycle.
- `white-label-view`: DOM lifecycle and model-driven rendering.
- `white-label-mediator`: decoupled selection and navigation events.
- `white-label-router`: crawlable query-string navigation with History API enhancement.
- Eta: escaped server/build-time pages and client-side view markup.

`white-label-service` remains independent and is not required by the static example.

## Version 6 migration

Version 6 is a SemVer major release because template files and APIs change:

- Rename page templates from `.hbs` to `.eta`.
- Replace Handlebars expressions and partials with Eta syntax.
- Remove React components and return a DOM node or Eta-rendered HTML from `white-label-view` templates.
- Remove local font assets and `@font-face` declarations.
- Supply `--site-url=https://your-origin.example` for production builds.

## License

MIT

## Unreleased performance changes

The generated stylesheet includes Bootstrap's reset, theme variables, visually-hidden helper, and the flex/wrap/gap utilities used by the starter. Other Bootstrap components are no longer bundled by default. Add their Sass imports in `app/assets/style/bootstrap.scss` when adding those components. Bootstrap's MIT attribution is retained.

The status template is compiled once. Scroll progress uses a coalesced animation frame and a transform; resize and route changes refresh it, and teardown cancels pending work. Runtime Eta compilation still occurs at initialization, so this is not a change to strict CSP compatibility. Published library versions remain pinned until their fixes are released and explicitly adopted.
