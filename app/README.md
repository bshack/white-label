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

The build output is `_deploy`. The test suite checks the starter content, progressive interaction, production build, accessibility/indexability signals, serverless request isolation, Web-standard bundling, and serverless size/startup budgets.

Pages live in `app/*.tsx`, page data lives in `app/assets/data/view`, browser code lives in `app/assets/script`, the provider-neutral serverless example lives in `server/handler.ts`, and shared styles live in `app/assets/style`. TypeScript is configured with `jsx: react-jsx` and `jsxImportSource: white-label-view`, so this scaffold's JSX does not require React.

## Simple View click event

View lifecycle hooks are the simplest place to own a browser listener:

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

The same callback reference is used for both registration and cleanup. View calls `removeListeners()` before replacement or destruction.

## Serverless / function runtimes

`server/handler.ts` demonstrates a cloud-agnostic server function using the Web `Request` and `Response` APIs. It composes a request-scoped Mediator, Model, Router, and server View, then destroys those mutable instances before the invocation completes.

```ts
import {handleRequest} from './dist/server/handler.js';

const response = await handleRequest(new Request('https://example.com/hello?name=Ada'));
```

Keep immutable configuration at module scope when useful, but create mutable Model/View/Router/Mediator instances per request unless their shared lifetime is intentional. Serverless platforms may reuse one process for many warm invocations, so module-level mutable application state can leak data between requests.

Cloud adapters should stay thin: translate the provider's event/request into a Web `Request`, call `handleRequest`, then translate the resulting `Response` if the platform requires it. The starter does not depend on AWS, Vercel, Netlify, Cloudflare, Azure, or another provider SDK.

The portability test bundles the server-side composition with a browser/Web target to catch unresolved Node built-ins. That is an edge-portability smoke test, not a claim that every edge provider is supported; verify the actual provider runtime before deployment.

`app/assets/style/global.css` imports Tailwind and contains the starter's custom theme styles. `print.css` remains plain CSS. Tailwind scans the project source during the build and emits static CSS; there is no browser-side Tailwind runtime.

For production, pass a version and HTTPS site URL through your package manager's normal script-argument syntax. For example with npm:

```sh
npm run build -- --version=release-1 --production=true --site-url=https://www.example.com
```

Build flags use `--key=value`. `--www` and `--cdn` default to `/`; `--version` selects `_deploy/release/<version>/assets`; without a version, the current timestamp is used. Production builds require a real HTTPS `--site-url` for canonical, Open Graph, robots, and sitemap output. Each build replaces `_deploy`.

Edit TypeScript/TSX sources, not `dist`. JSX expressions are escaped by the White Label runtime; reserve `raw()` for trusted application-authored markup. Replace the starter copy with application content while retaining the tested accessibility and progressive-enhancement patterns.
