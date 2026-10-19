# Contributing

Thanks for improving `generator-white-label`.

## Setup

Use Node.js `^22.18.0` or `>=24.11.0` and npm 11 or later, from the repository root:

```sh
npm ci --ignore-scripts
```

## Check your change

```sh
npm run lint && npm run coverage && npm run audit
```

- `lint` runs ESLint over all authored TypeScript and the test files (`test/`, `template-test/`, `test-types/`); warnings fail.
- `coverage` compiles with `tsc` (a full type check), type checks the public declarations, runs every test, and requires 100% statement, branch, function, and line coverage per file. You do not need to run `typecheck` or `test` separately.
- `audit` fails on any npm advisory, including low severity.

While iterating, run one test file: `npm run compile && node --test test/<file>.test.js`.

If you change `app/`, `server/`, `scripts/`, `scaffold/`, or `template-test/`, also check a generated project:

```sh
npm run compile
node dist/cli/index.js create /tmp/white-label-check
cd /tmp/white-label-check && npm install && npm test
```

To check packaging, run `npm pack --dry-run`. CI runs it as well, together with a production build and checks under npm, Yarn, and pnpm. `dist/` is build output; do not commit it.

## Pull requests

Keep changes focused and preserve the generator's production-oriented goals: meaningful generated HTML, accessibility/search checks, reproducible builds, explicit package contracts, and a generated project that works without hidden setup.

Changes to templates, build scripts, or generated examples should update the relevant tests and consumer/type checks. Do not weaken accessibility, indexing, coverage, lint, type, or security checks simply to make a change pass.

Review the complete diff for generated-file drift, credentials, private data, debugging code, dependency changes, and unrelated formatting changes. Breaking generator contracts require a SemVer major release rather than compatibility shims.

## Accessibility and security

Generated public content should remain usable and discoverable without client JavaScript. Treat raw template output as trusted application-authored markup only. Follow `SECURITY.md` for suspected vulnerabilities.