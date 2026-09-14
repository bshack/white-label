# White Label generated site

This project was generated with the **plain TypeScript / no-JSX** template option.

- Pages and views are `.ts` files.
- Templates return HTML strings instead of using JSX/TSX syntax.
- React is not required.
- White Label Model, View, Router, and Mediator are used the same way as in the JSX template.
- npm, Yarn, and pnpm are supported.

This scaffold is also the right starting point when you want a third-party template engine. Install the renderer your application uses, then call it from the View `template` function instead of returning a hand-built string. White Label does not require a renderer adapter or change the rest of the application architecture.

See [Template engines and JSX options](https://whitelabeljs.org/docs/view/#template-engines) for the tested third-party engines, examples, rendering contract, and escaping/security guidance.

## Commands

Use the package manager you prefer:

```sh
npm install
npm run build
npm test
```

```sh
yarn install
yarn build
yarn test
```

```sh
pnpm install
pnpm build
pnpm test
```

## Serverless / function runtimes

`server/handler.ts` is the same provider-neutral serverless example included in the JSX scaffold. It uses Web `Request` and `Response`, request-scoped Model/View/Router/Mediator instances, and the server View entrypoint; it does not require JSX or a provider SDK.

Keep immutable configuration at module scope when useful, but create mutable White Label instances per request unless shared state is explicitly intended. Warm serverless processes may handle many requests, so module-level mutable application state can leak data between invocations.

Use a thin cloud adapter around the handler when a platform does not expose Web `Request`/`Response` directly. The generated tests exercise repeated and concurrent requests, browser-global absence, Web-target bundling, and serverless bundle/startup budgets.

The Web-target bundle check is a portability smoke test, not a blanket claim of compatibility with every edge runtime. Verify the provider runtime you deploy to.

If you prefer JSX syntax for templates, generate a new project with `--jsx` or answer **Yes** to the generator's JSX question. JSX and no-JSX projects provide equivalent White Label functionality; the choice is about template syntax and renderer ownership.
