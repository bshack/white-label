# Contributing

Thanks for improving `generator-white-label`.

## Setup

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run coverage
npm run audit
npm pack --dry-run
```

## Pull requests

Keep changes focused and preserve the generator's production-oriented goals: meaningful generated HTML, accessibility/search checks, reproducible builds, explicit package contracts, and a generated project that works without hidden setup.

Changes to templates, build scripts, or generated examples should update the relevant tests and consumer/type checks. Do not weaken accessibility, indexing, coverage, lint, type, or security checks simply to make a change pass.

Review the complete diff for generated-file drift, credentials, private data, debugging code, dependency changes, and unrelated formatting changes. Breaking generator contracts require a SemVer major release rather than compatibility shims.

## Accessibility and security

Generated public content should remain usable and discoverable without client JavaScript. Treat raw template output as trusted application-authored markup only. Follow `SECURITY.md` for suspected vulnerabilities.