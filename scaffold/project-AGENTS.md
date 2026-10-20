# Agent guide

A static TypeScript site built with the White Label packages (Model, View, Router, Mediator), first-party tagged HTML templates from `white-label-view/html`, Tailwind CSS 4, and esbuild. Pages render to plain HTML at build time; browser JavaScript only enhances them. `README.md` is the full user guide; read it before larger changes, and keep it accurate when you change commands, structure, or behaviour.

This project was created by `generator-white-label` and does not depend on it any more. Everything here is application-owned.

## Code map

- `app/*.ts` (outside `app/assets/`): pages. Each default-exports a function that receives page data and returns `html`; `app/<name>.ts` becomes `_deploy/<name>.html`, subdirectories included.
- `app/assets/data/view/`: page data. `global.json` applies to every page, `<page>.json` to one page; build settings (`cdn`, `production`, `siteUrl`, `version`, `www`) are merged in last.
- `app/assets/script/`: browser code. Each `.ts` file directly in this directory is bundled on its own as `release/<version>/assets/script/<name>.compiled.js`; `index.ts` is the entry point. Supporting modules go in subdirectories, such as `tasks/` (the task example's Model, View, Router, Mediator, and `TaskApplication.ts`, which wires them).
- `app/assets/view/`: tagged HTML templates, shared by the build and the browser: layout, page sections, and the task example's markup (`examples/tasks/`).
- `app/assets/style/`: `global.css` (Tailwind and theme) and `print.css` (plain CSS).
- `server/handler.ts`: example server function on the Web `Request`/`Response` API, with security headers.
- `scripts/build.ts`: the site build. Renders pages, bundles scripts, compiles CSS, and writes `robots.txt` and `sitemap.xml` into `_deploy/`.
- `test/site.test.js`: tests for the built site, the task example, and the server function.
- `tsconfig.json`: one strict config for `app/`, `server/`, and `scripts/`, compiled into `dist/`.
- Generated output, never edited or committed: `dist/` (compiled TypeScript; the build imports pages from it) and `_deploy/` (the deployable site, recreated by every build). Both are in `.gitignore`.

## Toolchain

Node.js `^22.18.0 || >=24.11.0`. Use the package manager the project already uses (look for its lockfile) and never switch.

**Gate**, before calling a change done:

```sh
npm test    # or: yarn test, pnpm test
```

It compiles with `tsc` (a full type check that emits nothing on error), runs a production build with `--site-url=https://example.com`, then runs `node --test` with 100% line, branch, and function coverage required for the compiled `app/assets/script/**` and `app/assets/view/examples/tasks/*` modules. There is no separate lint or formatter; `npm run typecheck` is a quick type check while iterating.

**Build**, passing flags with your package manager's own syntax:

```sh
npm run build -- --version=local
yarn build --version=local
pnpm build --version=local    # not `pnpm build -- ...`: pnpm forwards the `--` and the build rejects it
```

Flags are `--version`, `--production`, `--site-url`, `--cdn`, and `--www`, always as `--name=value`; see the Build flags table in `README.md`. `--version` names the asset directory and is not an npm version. Production builds (`--production=true`) require HTTPS URLs.

**Preview** after a build:

```sh
python3 -m http.server 8080 --directory _deploy
```

Open `http://localhost:8080/`. Serve `_deploy/` as the root; asset URLs are root-relative.

## Architectural rules

- **HTML first.** Meaningful content, headings, links, forms, and metadata must be in the built HTML. JavaScript enhances; it never provides public content on its own. Links stay real links (the task filters are `/?tasks=active#example`, with `data-pushstate` letting the Router handle them in place).
- **Escaping.** Build markup with `html` from `white-label-view/html`. Keep untrusted values (user input, query strings, API responses) in ordinary `${...}` interpolations so they are escaped. Do not work around the places `html` refuses to interpolate (inside `<script>`/`<style>`, comments, tag names, unquoted or `on*` attributes).
- **Attributes.** Compose opening-tag attributes with `attributes({...})`; it omits `false`/`null`/`undefined`, writes `true` as a bare attribute, and rejects `on*` names.
- **Escaping is not validation.** Validate URLs (`href`, `src`) and CSS values yourself before rendering them.
- **`unsafeHTML()` is a trust boundary**, not a sanitizer. Use it only for markup the application produced or has already sanitized, and say why at the call site, as `app/index.ts` does for JSON-LD.
- **Model, View, Router, Mediator.** Use only what a feature needs: static content needs only `html`; local state with re-rendering needs Model and View; add Router when the URL drives state and Mediator when modules talk without importing each other. Keep wiring in one place (like `TaskApplication.ts`), keep the first render and later updates on the same template, and add and remove DOM listeners in View's `addListeners()`/`removeListeners()` or with `view.delegate()`.
- **Browser code is fully tested.** New code under `app/assets/script/` or `app/assets/view/examples/tasks/` needs tests that keep coverage at 100%, or the gate fails. When replacing starter content, update the tests that check it; keep the accessibility and SEO checks.
- **Accessibility.** Target WCAG 2.2 AA: semantic HTML and landmarks, the skip link, logical headings, labelled forms, keyboard operation with visible focus, status announcements, and sufficient contrast. Prefer native controls to ARIA. The tests run html-validate and axe, which catch only some problems; list the manual keyboard and screen-reader checks still needed rather than claiming conformance.
- **Search.** Keep accurate, unique titles, descriptions, canonical URLs, and structured data. The build's `sitemap.xml` lists only the site root: add new indexable pages to it in `scripts/build.ts`.
- **Server code is request-scoped.** `handleRequest()` creates and destroys its Model, View, Router, and Mediator inside each call. Never keep mutable request state at module level (warm serverless processes reuse modules); constant configuration may stay there. Keep it on the Web `Request`/`Response` API, with provider adapters as thin wrappers. Widen the Content-Security-Policy one origin at a time, and mirror the security headers on any static host.
- **Dependencies.** Versions are exact pins. Only `esbuild` and `@parcel/watcher` may run install scripts (`allowScripts`, `dependenciesMeta`, `pnpm-workspace.yaml`). The `@parcel/watcher` override lives in three places (`overrides`, `resolutions`, `pnpm-workspace.yaml`); change all three together, as `README.md` explains.

## Working agreement

The user decides; you assist. Make routine, reversible changes that follow the project's conventions without asking, and report material assumptions. Otherwise: stop, explain, ask, then proceed.

- **Before changing anything**, read this file, `README.md`, and the code and tests involved. Check for uncommitted work: it belongs to the user, so never overwrite, discard, or assume you made it. Reuse existing code before adding new code. Verify that an API, option, or behaviour exists before relying on it.
- **Make the smallest correct change** that does what was asked. Do not invent behaviour, refactor unrelated code, or add abstractions, tools, or configuration without a reason. Edit TypeScript sources, never `dist/` or `_deploy/`.
- **Never hide failures.** Do not skip, delete, or weaken tests or assertions, lower coverage thresholds, disable checks, or suppress type errors to make the gate pass. Find and fix the cause, or report it.
- **Verify before claiming.** Run the gate before saying a change is done, and claim only checks you ran and saw pass. Review the whole diff for stray files, debug code, secrets, and unrelated changes. Say what you could not verify.
- **Protect secrets and data.** Never print, log, or commit credentials or personal data; use synthetic data in tests and examples.
- **Ask first** before deploying or uploading `_deploy/`, changing hosting, DNS, secrets, or other production settings; before destructive actions (deleting files or branches, resetting or discarding changes, rewriting history, force-pushing); before adding, removing, upgrading, or downgrading dependencies or switching package managers; and before commits, pushes, pull requests, or any other action with external effects, unless the user asked for that action.
