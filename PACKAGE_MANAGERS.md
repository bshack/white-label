# Package manager support

`generator-white-label` and the projects it creates work with npm, Yarn, and pnpm.

## Run the generator

```sh
npx generator-white-label create my-project
yarn dlx generator-white-label create my-project
pnpm dlx generator-white-label create my-project
```

Every invocation creates the same TypeScript/tagged-template starter. There are no renderer-selection flags.

White Label View is template-engine agnostic. Projects that prefer JSX or a third-party renderer can install it after generation and return its rendered output from View's `template` function. See [Template engines](https://whitelabeljs.org/docs/view/#template-engines).

## Work with a generated project

Pick one package manager and use it consistently:

```sh
npm install && npm test
yarn install && yarn test
pnpm install && pnpm test
```

The generated `package.json` requires a supported Node.js version but no particular package manager. Scripts call each other with `node --run`, not `npm run`, so they work under all three.

Passing build flags differs by package manager:

```sh
npm run build -- --version=local
yarn build --version=local
pnpm build --version=local
```

pnpm passes a `--` through to the script, so `pnpm build -- --version=local` fails with `Unknown build option: --`.

### Install scripts

All dependencies are exact versions. Only two packages need to run install scripts: `esbuild` and `@parcel/watcher`. Each package manager is told so in its own way:

| Package manager | Where | Setting |
| --- | --- | --- |
| npm | `package.json` | `allowScripts`, pinned to `@parcel/watcher@2.6.0` and `esbuild@0.28.2` |
| Yarn | `package.json` | `dependenciesMeta`, the same two pinned versions with `built: true` |
| pnpm | `pnpm-workspace.yaml` | `onlyBuiltDependencies: ['@parcel/watcher', esbuild]` |

The published White Label runtime packages include their built output and are not allowed to run install scripts.

### Yarn package age

Yarn's package-age gate stays on for ordinary dependencies. The generated `.yarnrc.yml` preapproves only `white-label-mediator`, `white-label-model`, `white-label-router`, and `white-label-view`, so a newly published coordinated White Label release installs immediately. Preapproval does not allow install scripts.

## Repository development

The committed `package-lock.json` is the generator repository's only lockfile, and npm is the package manager for maintenance and audits. Compatibility CI packs the real generator and checks its API and CLI under npm, Yarn, and pnpm, then generates a project and runs its tests under each. Lockfiles for Yarn and pnpm are not committed.

### Repository-only overrides

`package.json` also overrides `minimatch` to 11.0.5 and `glob` to 14.0.4 for this repository's own development tools. `eslint` 10.14.0 depends on `minimatch` ^10.2.6 ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), fixed in 11.0.1), and `c8` 12.0.0 depends, through `test-exclude`, on `glob` ^13.0.6 ([GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), fixed in 14.0.2). Generated projects install neither tool, so these overrides are not copied into `createSiteManifest()` or `pnpm-workspace.yaml`; `test/generator.test.js` lists them in `REPOSITORY_ONLY_OVERRIDES`. Remove both once `eslint` and `c8` releases depend on fixed versions, then confirm `npm run lint`, `npm run coverage`, and `npm run audit` still pass.

Generator 11 pins the published runtime line exactly (`white-label-mediator@5.0.2`, `white-label-model@7.1.0`, `white-label-router@6.2.0`, `white-label-view@8.0.0`), and the committed lockfile resolves them from the npm registry. The security workflow also substitutes a packed build of a fixed View source revision in integration jobs; that is an additional cross-repository check, not a workaround for an unpublished release. Keep the lockfile registry-based rather than pointing runtime dependencies at Git or local packages.
