# White Label starter application

This static starter uses TypeScript and the White Label JSX runtime for page and client-side View rendering, with Tailwind CSS 4 for styling. It makes no API or service calls.

## Start developing

Use Node.js `^22.18.0` or `>=24.11.0`, matching the generated `package.json`, with npm 11 or newer.

```sh
npm ci
npm test
npm run build -- --version=local
python3 -m http.server 8080 --directory _deploy
```

Then open `http://localhost:8080/`.

Serve `_deploy` as the web server's document root. Do **not** browse to `_deploy/index.html` through a server rooted at the project directory (for example, `/white-label-site/_deploy/index.html`), because generated asset URLs such as `/release/local/assets/style/global.css` are intentionally rooted at the deployed site's origin and will otherwise return 404 responses.

The build output is `_deploy`. The test suite checks the starter content, progressive interaction, production build, accessibility/indexability signals, and full coverage for the custom browser code.

Pages live in `app/*.tsx`, page data lives in `app/assets/data/view`, browser code lives in `app/assets/script`, and shared styles live in `app/assets/style`. TypeScript is configured with `jsx: react-jsx` and `jsxImportSource: white-label-view`, so JSX does not require React.

`app/assets/style/global.css` imports Tailwind and contains the starter's custom theme styles. `print.css` remains plain CSS. Tailwind scans the project source during the build and emits static CSS; there is no browser-side Tailwind runtime.

```sh
npm run build -- --version=release-1 --production=true --site-url=https://www.example.com
```

Build flags use `--key=value`. `--www` and `--cdn` default to `/`; `--version` selects `_deploy/release/<version>/assets`; without a version, the current timestamp is used. Production builds require a real HTTPS `--site-url` for canonical, Open Graph, robots, and sitemap output. Each build replaces `_deploy`.

Edit TypeScript/TSX sources, not `dist`. JSX expressions are escaped by the White Label runtime; reserve `raw()` for trusted application-authored markup. Replace the starter copy with application content while retaining the tested accessibility and progressive-enhancement patterns.
