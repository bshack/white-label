# Adopt White Label in an existing application

The generator is intentionally for creating a new project. It refuses to scaffold over a non-empty destination. Existing applications should install only the White Label packages they need and integrate them at explicit boundaries instead of regenerating the host application.

This works well for server-rendered applications such as commerce storefronts, CMS sites, Rails/PHP/Java/.NET applications, or any site where meaningful HTML already exists before client JavaScript runs.

## Install only the needed primitives

```sh
npm install white-label-view white-label-model
```

Add Router or Mediator only when the feature actually needs URL state or cross-module events:

```sh
npm install white-label-router white-label-mediator
```

White Label packages do not require the generator at runtime and do not require one another unless the application chooses to compose them.

## Adopt existing server-rendered markup

`white-label-view` can own the lifecycle around an existing element instead of replacing the host application's rendering system.

```ts
import {Model} from 'white-label-model';
import View from 'white-label-view';

const status = document.querySelector<HTMLElement>('[data-filter-status]')!;
const filters = new Model({color: ''});

const statusView = new View({
    parentElement: status.parentElement!,
    element: status,
    model: filters,
    update(element, data) {
        const state = data as {color: string};
        element.textContent = state.color
            ? `Color filter: ${state.color}`
            : 'No color filter selected';
        return true;
    }
}).initialize();
```

No client template is required when the existing element should be updated in place. The host remains responsible for the initial HTML; View owns only the adopted root and its lifecycle.

Keep ownership narrow. Unrelated server-rendered siblings, headers, forms, and page chrome should remain outside the View unless the feature genuinely owns them.

## Scope progressive routing to one enhanced region

By default, Router listens for opted-in `data-pushstate` links across the document. An embedded or incrementally adopted feature can limit that interception to its own DOM region:

```ts
import Router from 'white-label-router';

const refinementArea = document.querySelector<HTMLElement>('[data-refinements]')!;
const router = new Router();

router.navigationRoot = refinementArea;
router.routes = {
    '/search': (_scope, location) => {
        filters.update({color: location.data.query.prefv1 || ''});
    }
};
router.initialize();
```

Only eligible links whose click event reaches that navigation root are enhanced by that Router. Other page links retain the host application's normal behavior. Multiple independently owned regions can therefore coexist without every Router claiming document-wide link handling.

`navigationRoot` controls click-listener ownership. It is deliberately separate from `router.scope`, which remains the value passed to route handlers.

## Preserve the host application's server contract

White Label should not duplicate or bypass server-owned responsibilities. Keep these in the existing platform when it already owns them:

- authentication and authorization;
- pricing, inventory, tax, promotions, checkout, and other authoritative business rules;
- canonical URLs and directly requestable public routes;
- initial semantic content and crawlable navigation;
- CSRF/session protections and trusted API boundaries.

Use White Label where a client-side state, lifecycle, event, or URL boundary adds value. Normal server navigation is still the right choice when enhancement does not materially improve the interaction.

## Teardown

Long-lived shells and dynamically mounted regions should release the objects they own:

```ts
statusView.destroy();
router.destroy();
filters.destroy();
```

Destroying an adopted View removes the root it owns. If a host platform intends to keep that element after the enhancement lifecycle ends, structure ownership accordingly rather than calling `destroy()` while the host still expects the root to remain.

## Commerce example

The White Label demo repository contains a concrete Salesforce B2C Commerce / SFRA example using the same incremental boundary:

- [SFCC / SFRA progressive enhancement recipe](https://github.com/bshack/white-label-demo-site/blob/main/docs/recipes/sfcc-sfra-progressive-enhancement.md)

The same pattern applies to other server-rendered stacks: keep the server as the source of truth, then adopt only the client-side regions that need richer behavior.
