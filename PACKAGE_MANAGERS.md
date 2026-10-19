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

### The `@parcel/watcher` override

**Why it exists.** `@tailwindcss/cli` 4.3.3 (the latest release when the override was added) depends on `@parcel/watcher` 2.5.1. That version depends on `micromatch`, which depends on `braces`, and `braces` has a high-severity advisory ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) with no patched release. Without the override, `npm audit` in a new project reports it. `@parcel/watcher` 2.6.0 replaced `micromatch` with `picomatch`, and the Tailwind CLI works with it.

**How it is applied.** Each package manager reads overrides from a different place, so a generated project forces 2.6.0 in three:

| Package manager | Where | Setting |
| --- | --- | --- |
| npm | `package.json` | `"overrides": {"@parcel/watcher": "2.6.0"}` |
| Yarn | `package.json` | `"resolutions": {"@parcel/watcher": "2.6.0"}` |
| pnpm | `pnpm-workspace.yaml` | `overrides: {'@parcel/watcher': 2.6.0}` |

The install-script approvals above name `@parcel/watcher@2.6.0` to match. This repository applies the same npm override in its own `package.json` and `pnpm-workspace.yaml`, and a test fails if the generated overrides drift from the version in the committed lockfile.

**When to remove it.** Once a `@tailwindcss/cli` release depends on `@parcel/watcher` 2.6.0 or later (or a patched `braces`), upgrade `@tailwindcss/cli` and delete all three overrides. In a generated project, also update the `@parcel/watcher` version in `allowScripts` and `dependenciesMeta` to whatever version is then installed. In this repository, make the same change in `createSiteManifest()` (`scaffold/index.ts`), `package.json`, and `pnpm-workspace.yaml`, regenerate the lockfile with npm, and confirm `npm run audit` stays clean.

## Repository development

The committed `package-lock.json` is the generator repository's only lockfile, and npm is the package manager for maintenance and audits. Compatibility CI packs the real generator and checks its API and CLI under npm, Yarn, and pnpm, then generates a project and runs its tests under each. Lockfiles for Yarn and pnpm are not committed.

Generator 10 pins the published runtime line exactly (`white-label-mediator@5.0.1`, `white-label-model@7.0.3`, `white-label-router@6.1.2`, `white-label-view@7.0.2`), and the committed lockfile resolves them from the npm registry. The security workflow also substitutes a packed build of a fixed View source revision in integration jobs; that is an additional cross-repository check, not a workaround for an unpublished release. Keep the lockfile registry-based rather than pointing runtime dependencies at Git or local packages.
