# white-label

`white-label` is a Yeoman generator and build system for creating static websites. It provides a working project structure with Handlebars templates, Sass styles, Bootstrap, responsive images, and bundled JavaScript.

Use it when you want a small, understandable static-site foundation that you can brand and extend without adopting a full application framework.

## What it builds

The project separates source files by responsibility:

- `app/*.hbs` contains pages.
- `app/assets/markup` contains reusable Handlebars partials.
- `app/assets/data/view` contains global and page-specific JSON data.
- `app/assets/style` contains Sass entry points and partials.
- `app/assets/script` contains JavaScript and JSX entry points.
- `app/assets/image` and `app/assets/font` contain static assets.
- `scripts/build.js` turns those sources into a deployable `_deploy` directory.

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
npm test
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
