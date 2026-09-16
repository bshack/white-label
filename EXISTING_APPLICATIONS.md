# Adopt White Label in an existing server-rendered application

White Label does not require a rewrite. Existing applications should install only the runtime packages a feature needs and integrate them at explicit boundaries.

The **generator is intentionally for new projects** and refuses to scaffold over a non-empty destination. If an application already exists—SFCC/SFRA, a CMS, Rails, PHP, Java, .NET, another server-rendered stack, or a long-lived frontend—do not regenerate the host application. Add White Label to one feature or DOM region at a time.

This is one of the strongest White Label use cases: modern TypeScript structure and lifecycle where it helps, while the existing platform keeps ownership of routing, business rules, initial HTML, and the rest of the page.

## When this pattern fits

Incremental adoption is a good fit when:

- the server or CMS already renders meaningful HTML;
- public URLs, SEO, accessibility, or no-JavaScript behavior matter;
- a rewrite would be disproportionate to the feature being added;
- teams want observable state, lifecycle, application events, or URL-backed interaction without introducing a full frontend framework;
- multiple teams/features need clear ownership boundaries on the same page;
- commerce/account/content flows must keep authoritative business logic on the server.

It is less compelling for experiences that are intentionally fully client-owned and deeply stateful across most of the viewport, such as editors, design tools, complex collaborative workspaces, or other applications where a component framework already provides valuable shared conventions.

## Install only the needed primitives

Start with the actual responsibility the feature needs:

```sh
npm install white-label-view white-label-model
```

Add Router or Mediator only when the feature genuinely needs URL state or cross-module events:

```sh
npm install white-label-router white-label-mediator
```

White Label packages do not require the generator at runtime and do not require one another unless the application chooses to compose them.

A useful rule is:

```text
existing platform owns the page
        +
White Label owns a deliberate feature boundary
```

## Adopt existing server-rendered markup

`white-label-view` can own lifecycle around an element that already exists instead of replacing the host application's rendering system.

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

No client template is required when an attached existing element can be updated in place. The host remains responsible for the initial HTML; View owns only the adopted root and its lifecycle.

Keep ownership narrow. Unrelated server-rendered siblings, headers, forms, navigation, and page chrome should remain outside the View unless the feature genuinely owns them.

`destroy()` removes the root the View owns. If the host application expects that element to remain after enhancement teardown, choose an ownership boundary that can be removed safely rather than treating host-owned markup as disposable.

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

## Add state and events only where needed

A feature does not need the full White Label stack.

Use `white-label-model` when the feature needs observable state. Load data through the application's existing fetch/client/service layer, validate it at that boundary when appropriate, then apply it to Model. Model should not replace a backend API, persistence layer, or framework store solely for architectural symmetry.

Use `white-label-mediator` when separate modules need to exchange intent without importing one another. Direct function calls are clearer when there is already an ownership relationship. Avoid turning a mediator into an unstructured global event namespace.

## Preserve the host application's server contract

White Label should not duplicate or bypass server-owned responsibilities. Keep these in the existing platform when it already owns them:

- authentication and authorization;
- pricing, inventory, tax, promotions, checkout, and other authoritative business rules;
- canonical URLs and directly requestable public routes;
- initial semantic content and crawlable navigation;
- CSRF/session protections and trusted API boundaries;
- CMS/content governance and server-side personalization rules;
- persistence, queues, retries, and cross-process workflows.

Use White Label where a client-side state, lifecycle, event, or URL boundary adds value. Normal server navigation is still the right choice when enhancement does not materially improve the interaction.

## SEO and accessibility boundary

For public content, keep the important information in the initial response. Progressive enhancement should improve interaction rather than become a prerequisite for discovery or comprehension.

Prefer:

- real `href` values and directly requestable routes;
- semantic headings, forms, controls, landmarks, and status regions in initial HTML;
- server/static ownership of canonical URLs, titles, descriptions, robots directives, and structured data;
- deliberate focus handling after meaningful client-side navigation or content replacement;
- client behavior that preserves keyboard, context-menu, modified-click, and no-JavaScript behavior.

Do not treat source-level metadata as proof of search-engine indexing. Validate deployed behavior and indexing with actual production/search-console evidence.

## Teardown

Long-lived shells and dynamically mounted regions should release the objects they own:

```ts
statusView.destroy();
router.destroy();
filters.destroy();
```

Also destroy a feature-owned Mediator when that event boundary leaves the application lifecycle.

## Commerce and SFCC example

The White Label demo repository contains a concrete Salesforce B2C Commerce / SFRA example using the same incremental boundary:

- [SFCC / SFRA progressive enhancement recipe](https://github.com/bshack/white-label-demo-site/blob/main/docs/recipes/sfcc-sfra-progressive-enhancement.md)
- [Incremental JavaScript for server-rendered applications](https://whitelabeljs.org/guides/incremental-javascript-for-server-rendered-apps/)

The same pattern applies to other server-rendered stacks: keep the server as the source of truth, then adopt only the client-side regions that need richer behavior.
