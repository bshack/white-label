# White Label starter application

This static starter was generated with the **JSX/TSX** template option. It uses TypeScript and the White Label JSX runtime for page and client-side View rendering, with Tailwind CSS 4 for styling. It makes no API or service calls.

JSX is optional in White Label. If you prefer plain TypeScript or want a third-party template engine to own rendering, generate with `--no-jsx` (or answer **No** to the generator's JSX question), then install and call that renderer from the View `template` function. The Model, View, Router, Mediator, progressive-enhancement behavior, and generated feature set remain equivalent.

See [Template engines and JSX options](https://whitelabeljs.org/docs/view/#template-engines) for the tested third-party engines, rendering contract, and no-JSX setup.

## Start developing

Use Node.js `^22.18.0` or `>=24.11.0`, matching the generated `package.json`. npm, Yarn, and pnpm are supported.

With npm:

```sh
npm install
npm test
npm run build -- --version=local
```

With Yarn:

```sh
yarn install
yarn test
yarn build --version=local
```

With pnpm:

```sh
pnpm install
pnpm test
pnpm build -- --version=local
```

Then preview the generated output:

```sh
python3 -m http.server 8080 --directory _deploy
```

Open `http://localhost:8080/`.

Serve `_deploy` as the web server's document root. Do **not** browse to `_deploy/index.html` through a server rooted at the project directory (for example, `/white-label-site/_deploy/index.html`), because generated asset URLs such as `/release/local/assets/style/global.css` are intentionally rooted at the deployed site's origin and will otherwise return 404 responses.

The build output is `_deploy`. The test suite checks the starter content, progressive interaction, production build, accessibility/indexability signals, and full coverage for the custom browser code.

Pages live in `app/*.tsx`, page data lives in `app/assets/data/view`, browser code lives in `app/assets/script`, and shared styles live in `app/assets/style`. TypeScript is configured with `jsx: react-jsx` and `jsxImportSource: white-label-view`, so this scaffold's JSX does not require React.

`app/assets/style/global.css` imports Tailwind and contains the starter's custom theme styles. `print.css` remains plain CSS. Tailwind scans the project source during the build and emits static CSS; there is no browser-side Tailwind runtime.

For production, pass a version and HTTPS site URL through your package manager's normal script-argument syntax. For example with npm:

```sh
npm run build -- --version=release-1 --production=true --site-url=https://www.example.com
```

Build flags use `--key=value`. `--www` and `--cdn` default to `/`; `--version` selects `_deploy/release/<version>/assets`; without a version, the current timestamp is used. Production builds require a real HTTPS `--site-url` for canonical, Open Graph, robots, and sitemap output. Each build replaces `_deploy`.

Edit TypeScript/TSX sources, not `dist`. JSX expressions are escaped by the White Label runtime; reserve `raw()` for trusted application-authored markup. Replace the starter copy with application content while retaining the tested accessibility and progressive-enhancement patterns.
