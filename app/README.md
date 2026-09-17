# White Label starter application

This static starter uses ordinary TypeScript and White Label View's first-party tagged HTML templates, with Tailwind CSS 4 for styling. It makes no API or service calls.

The rendering path is intentionally small and explicit:

```ts
import {html} from 'white-label-view/html';

export default function Page(data: {title: string}) {
    return html`<main><h1>${data.title}</h1></main>`;
}
```

Dynamic text and quoted-attribute values are HTML-escaped by default. Use `attributes()` for conditional/opening-tag attributes. `unsafeHTML()` is an explicit trust boundary for application-owned content that is already trusted or sanitized; it is not a sanitizer.

White Label View remains template-engine agnostic. If the application prefers JSX, Handlebars, Eta, EJS, Mustache, Nunjucks, Pug, or another renderer, add it to the application and return its rendered output from View's `template` function. JSX is a tested third-party option rather than a White Label runtime requirement.

See [Template engines](https://whitelabeljs.org/docs/view/#template-engines) for tested integrations and rendering/security boundaries.

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

Serve `_deploy` as the web server's document root. Do **not** browse to `_deploy/index.html` through a server rooted at the project directory, because generated asset URLs such as `/release/local/assets/style/global.css` are intentionally rooted at the deployed site's origin.

The build output is `_deploy`. The test suite checks starter content, progressive interaction, production build behavior, accessibility/indexability signals, serverless request isolation, Web-standard bundling, and serverless size/startup budgets.

Pages live in `app/*.ts`, page data lives in `app/assets/data/view`, browser code lives in `app/assets/script`, the provider-neutral serverless example lives in `server/handler.ts`, and shared styles live in `app/assets/style`.

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

Edit TypeScript sources, not `dist`. Keep untrusted values in normal `html` interpolations; use `unsafeHTML()` only when the application has deliberately established trust or sanitization. Replace the starter copy with application content while retaining the tested accessibility and progressive-enhancement patterns.
