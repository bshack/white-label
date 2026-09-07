# white-label

`white-label` is a Yeoman generator and build system for creating static websites. It provides a working project structure with Handlebars templates, Sass styles, Bootstrap, responsive images, and TypeScript sources compiled to bundled JavaScript.

Use it when you want a small, understandable static-site foundation that you can brand and extend without adopting a full application framework.

## What it builds

The project separates source files by responsibility:

- `app/*.hbs` contains pages.
- `app/assets/markup` contains reusable Handlebars partials.
- `app/assets/data/view` contains global and page-specific JSON data.
- `app/assets/style` contains Sass entry points and partials.
- `app/assets/script` contains TypeScript and TSX entry points.
- `app/assets/image` and `app/assets/font` contain static assets.
- `scripts/build.ts` turns those sources into a deployable `_deploy` directory.

The build renders Handlebars pages, compiles Sass, bundles JavaScript with esbuild, copies static assets, and writes the deployment configuration to `assets/data/config.json`. `global.css` includes the complete compiled Bootstrap CSS followed by the project's styles.

Generated formatting utilities use native `Intl` and `Date` APIs, so new projects do not need Lodash, Moment, or Numeral for the included examples.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Generate a new site

Install Yeoman and the generator, then run it in an empty project directory:

```sh
npm install --global yo generator-white-label
mkdir my-site
cd my-site
yo white-label
```

The generator copies the `app` and `scripts` directories and creates a project `package.json`. It intentionally does not install dependencies automatically, so you can review that manifest first:

```sh
npm install
npm test
```

## Build the site

A build with defaults is enough for local inspection:

```sh
npm run build
```

The generated site is written to `_deploy`. Each asset build is placed under `_deploy/release/<version>/assets`; when no version is supplied, the build uses the current Unix timestamp.

For a deployment build, pass explicit values after `--`:

```sh
npm run build -- \
  --www=https://www.example.com \
  --cdn=https://cdn.example.com \
  --service=https://api.example.com \
  --version=2026.09.06 \
  --production=true
```

| Option | Default | Purpose |
| --- | --- | --- |
| `--www` | `/` | Public website base URL exposed to templates and configuration. |
| `--cdn` | `/` | Asset base URL exposed to templates and configuration. |
| `--service` | `/service-endpoint` | Backend service URL exposed to the site. |
| `--version` | Current Unix timestamp | Directory name used for versioned assets. |
| `--production` | `false` | Minifies CSS and JavaScript when set to `true`. |

The version may contain only letters, numbers, dots, underscores, and hyphens. This prevents it from escaping the deployment directory.

## Add a page

Create `app/about.hbs`:

```handlebars
{{> element/head}}
<main>
    <h1>{{title}}</h1>
    <p>{{introduction}}</p>
</main>
```

Then create matching data at `app/assets/data/view/about.json`:

```json
{
  "title": "About us",
  "introduction": "A short description of the organization."
}
```

Global data from `app/assets/data/view/global.json`, page data, and build options are merged before the template is rendered. Page-specific values take precedence over global values, and build options take precedence over both.

## Responsive images

The included `picture` partial supports AVIF and WebP sources at each responsive breakpoint, with an ordinary image as the final fallback:

```handlebars
{{> element/picture
    imageFallback='assets/image/hero/fallback.jpg'
    imageSmallAvif='assets/image/hero/small.avif'
    imageSmallWebp='assets/image/hero/small.webp'
    imageLargeAvif='assets/image/hero/large.avif'
    imageLargeWebp='assets/image/hero/large.webp'
    width='2048'
    height='1600'
    loading='lazy'
    decoding='async'
    alt='A human-readable description of the image'
}}
```

Browsers choose the first supported source whose media query matches. Browsers without AVIF or WebP support use `imageFallback`. Supplying width and height also reserves layout space and helps avoid content movement while the image loads.

## Development checks

Run the same basic checks before proposing a change:

```sh
npm run build
npm run typecheck
npm test
npm run coverage
npm run audit
```

## Version 4 migration notes

Version 4 intentionally replaced the unsupported Gulp 3, Babel 6, PhantomJS, Karma, Bower, and legacy plugin pipeline. It also replaced Foundation with Bootstrap 5.3.8 and migrated the grid markup to Bootstrap `row` and responsive `col-*` classes. Projects upgrading from an older major version should treat the build tooling, supported Node.js versions, CSS framework, and generated markup as breaking changes.

Version 4.1 removes Lodash, Moment, and Numeral from generated projects. If application code added its own imports from those packages, either retain the dependency in that application or migrate those calls before upgrading.

## Related packages

- [`white-label-model`](https://github.com/bshack/white-label-model) provides event-emitting models and collections.
- [`white-label-view`](https://github.com/bshack/white-label-view) renders templates and manages delegated DOM events.
- [`white-label-router`](https://github.com/bshack/white-label-router) provides History API navigation.
- [`white-label-mediator`](https://github.com/bshack/white-label-mediator) provides shared application messaging.
- [`white-label-service`](https://github.com/bshack/white-label-service) provides an authenticated JSON service backed by MySQL.

## TypeScript development and version 5.0.0 migration

Implementation code now uses strict TypeScript. Builds emit JavaScript, source maps with embedded source, and `.d.ts` declarations into `dist`. JavaScript callers can still use the package without compiling TypeScript themselves. JSDoc comments describe parameters, return values, lifecycle behavior, and validation at the implementation, and are retained in declarations.

```ts
// app/assets/script/profile.ts
import User from './model/user.js';

const profile = new User({name: 'Ada'});
console.log(profile.get().name);
```

Write implementation files as `.ts`, or `.tsx` for React markup. Keep `.js` extensions on relative imports: TypeScript resolves them to source files and emits imports usable by Node. Every top-level script entry is bundled, except declaration-only `.d.ts` files. The build checks all sample modules, including modules not imported by an entry point.

The `types.d.ts` file documents the subset of older published white-label dependencies used by the scaffold. It also declares optional SDK callbacks on `window`. These are explicit compatibility declarations, not unrestricted `any` modules. New releases of the related packages are not required from npm until they are actually published.

Version 5 is a major release because generated projects now contain TypeScript and use a two-stage TypeScript/esbuild pipeline. Use Node.js 24 for development and CI. Existing generated sites are not changed automatically: migrate their script files, copy the new build configuration, and resolve strict type errors before deploying. The small `generators/app/index.js` file is only Yeoman's discovery bridge to compiled TypeScript.

The generated project includes its own README. Full Bootstrap CSS remains included. Old inactive Gulp and Karma configuration has been removed; all historical share-URL assertions now run in the active Node test suite.

### Sample utility reference

| Module | Functionality and example |
| --- | --- |
| `utility/ajax.ts` | `getScript('/sdk.js')` appends an asynchronous script; call it only when needed. |
| `utility/form.ts` | Read multiselect values, select or find an option, decorate/split metadata, and build named options: `buildOptions([{id: 1, name: 'Ada'}], 1)`. Metadata helpers mutate their supplied arrays. |
| `utility/string.ts` | Parse trusted HTML, read query values, format local dates, numbers and USD currency, and create phone/email links: `formatCurrency(12.5)` returns `$12.50`. `getQueryStringParamater` retains its historical spelling. |
| `utility/share.ts` | Construct encoded Facebook, Twitter, LinkedIn and email URLs. Missing required values return `false`. Twitter retains its legacy 140-character rule; Google Plus support is a deprecated URL formatter for a discontinued service. |
| `utility/regex.ts` | Legacy presentation-validation expressions for dates, passwords, phone numbers, ZIP codes, length and currency. These are not substitutes for server validation or a modern password policy. |
| `model/user.ts` | An extendable observable object model. Country/state singletons contain the bundled JSON data. The global model starts with local URL defaults; the build separately writes deployment settings to `assets/data/config.json`. |
| `api/facebook.ts`, `api/youtube.ts` | Optional SDK adapters that emit readiness events through the shared mediator. They are tested with local browser doubles, not live provider accounts. Review provider configuration before enabling them in a real site. |
| `view/default.tsx` | A React greeting component: `<HelloMessage name="Ada" />`. |
| `view/toolkit/youtube-player-1.ts` | An extension skeleton for a concrete player, with the legacy `removeListners` hook retained. |

### Verification and coverage

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run coverage
npm pack --dry-run
```

`npm test` builds the code, checks TypeScript consumer examples against the emitted declarations, and runs the tests. `npm run coverage` additionally enforces **100% statements, branches, functions, and lines for each implementation file**. Unexecuted implementation files count toward the result; declaration-only files contain no executable code and are excluded. Reports are written to `coverage`, including `lcov.info` for coverage viewers. CI runs the same gate and checks committed build output for drift.

Tests exercise the compiled JavaScript interface used by downstream callers. Coverage is an execution metric, not proof that all possible inputs or external integrations are correct. Tests for third-party SDKs use local doubles. No live provider requests are needed.

To undo this migration, revert its commit and run `npm ci` from the restored lockfile. No npm release, database migration, or production deployment is performed by these development changes.
