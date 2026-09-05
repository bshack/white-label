# white-label

Scaffolding for developing and building static sites with Handlebars, Sass, and
JavaScript modules.

## Version 4 security migration

Version 4 intentionally replaces the unsupported Gulp 3, Babel 6, PhantomJS,
Karma, Bower, and legacy plugin pipeline. Node.js 20 or newer is required.

The new build uses:

- Handlebars for page templates and partials
- Dart Sass for styles
- esbuild for JavaScript and JSX bundles
- Node's built-in test runner

The Yeoman generator no longer installs dependencies automatically. This gives
you an opportunity to review the generated `package.json` before running
`npm install`.

## Install

```sh
npm install
```

## Build

```sh
npm run build -- \
  --www=https://www.example.com \
  --cdn=https://cdn.example.com \
  --service=https://service.example.com \
  --version=123456789 \
  --production=true
```

Output is written to `_deploy`. The version is restricted to letters, numbers,
dots, underscores, and hyphens so it cannot escape the deployment directory.

## Test and audit

```sh
npm test
npm audit --audit-level=low
```

## Generate a project

Install this package through Yeoman and run the `white-label` generator. After
generation, review the dependency manifest and run `npm install` yourself.
