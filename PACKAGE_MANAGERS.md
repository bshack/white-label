# Package manager support

`generator-white-label` and the projects it creates support npm, Yarn, and pnpm.

## Run the generator

```sh
npx generator-white-label create my-project
yarn dlx generator-white-label create my-project
pnpm dlx generator-white-label create my-project
```

The same `--jsx` and `--no-jsx` options are available through every invocation path. JSX is optional: use `--jsx` for the first-party White Label JSX runtime, or `--no-jsx` for plain TypeScript templates and as the starting point for a third-party template engine.

See [Template engines and JSX options](https://whitelabeljs.org/docs/view/#template-engines) for tested third-party renderers and the View rendering contract.

## Work with a generated project

After generation, use the package manager you prefer:

```sh
npm install && npm test
yarn install && yarn test
pnpm install && pnpm test
```

Generated manifests require the supported Node.js runtime but do not require a specific package manager. Nested scripts use Node's `--run` support instead of invoking npm internally.

Generated projects also carry narrow install-script approvals for the dependencies that actually need lifecycle builds: `esbuild`, `@parcel/watcher`, and the pinned `white-label-view` Git dependency. npm uses pinned `allowScripts` entries, Yarn uses pinned `dependenciesMeta` build permissions plus approved White Label Git repositories, and pnpm uses `onlyBuiltDependencies`. These settings avoid requiring users to disable package-manager security globally.

## Repository development

The committed `package-lock.json` remains the generator repository's canonical dependency lockfile and npm remains the maintenance/audit path used by primary CI. Compatibility CI packs the real generator artifact and verifies its API and CLI under npm, Yarn, and pnpm. Alternate lockfiles are not committed merely for compatibility testing.
