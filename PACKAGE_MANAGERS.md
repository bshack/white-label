# Package manager support

`generator-white-label` and the projects it creates support npm, Yarn, and pnpm.

## Run the generator

```sh
npx generator-white-label create my-project
yarn dlx generator-white-label create my-project
pnpm dlx generator-white-label create my-project
```

Every invocation creates the same canonical TypeScript/tagged-template starter. There are no renderer-selection flags.

White Label View remains template-engine agnostic. Projects that prefer JSX or a third-party renderer can install it after generation and return its rendered output from View's `template` function. See [Template engines](https://whitelabeljs.org/docs/view/#template-engines) for tested integrations and trust boundaries.

## Work with a generated project

After generation, use the package manager you prefer:

```sh
npm install && npm test
yarn install && yarn test
pnpm install && pnpm test
```

Generated manifests require the supported Node.js runtime but do not require a specific package manager. Nested scripts use Node's `--run` support instead of invoking npm internally.

Generated projects use exact npm versions for the four first-party White Label packages. Install/build lifecycle approvals are limited to dependencies that need native or generated artifacts during installation: `esbuild` and `@parcel/watcher`. npm uses pinned `allowScripts` entries, Yarn uses pinned `dependenciesMeta` build permissions, and pnpm uses `onlyBuiltDependencies`. Published White Label runtime packages include their built output and do not receive lifecycle-script approval in generated projects.

Yarn's package-age security gate is left enabled for ordinary dependencies. The generated `.yarnrc.yml` preapproves only `white-label-mediator`, `white-label-model`, `white-label-router`, and `white-label-view` so a newly published coordinated White Label release can be installed immediately without disabling Yarn's protection for the rest of the dependency graph. Package-age preapproval does not grant lifecycle-script execution.

## Repository development

The committed `package-lock.json` remains the generator repository's canonical dependency lockfile and npm remains the maintenance/audit path used by primary CI. Compatibility CI packs the real generator artifact and verifies its API and CLI under npm, Yarn, and pnpm. Alternate lockfiles are not committed merely for compatibility testing.

Generator 10 depends on `white-label-view@7`. View 7's implementation is merged but not yet published, so coordinated CI temporarily builds and injects the exact merged View 7 revision for integration testing. The release lockfile remains registry-based; do not replace it with a Git dependency or treat the temporary packed artifact as a published dependency. Normal registry installation remains a release gate until View 7 is published.
