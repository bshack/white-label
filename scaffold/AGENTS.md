# generator-white-label scaffold instructions

These instructions are more specific than the repository-root agent guide for files under `scaffold/`.

## Generator 11 creation contract

- `createProject()` is the canonical project-creation engine. CLI and future adapters must call it rather than reimplement scaffold copying or policy.
- The generator is for **new projects**. Destination safety belongs in `createProject()`: missing and empty destinations are allowed; an existing non-empty destination must be rejected before scaffold files are copied or package metadata is written. An empty or non-string `destination` is a `TypeError` (it would otherwise write into the cwd).
- The default file system never overwrites (`cp` with `errorOnExist`, `writeFile` with `wx`), so a file that appears after the destination check still fails the call.
- On failure, `createProject()` removes only entries it created and then the directories it created, deepest first, stopping at the first non-empty one; pre-existing entries are never removed. Copies run concurrently and all settle before cleanup; `package.json` is written last.
- What a project receives is the `scaffoldCopies` list in `index.ts` plus the manifest from `createSiteManifest()`. `scaffold/gitignore` becomes `.gitignore`; `app/README.md` becomes `README.md`; `scaffold/project-AGENTS.md` becomes `AGENTS.md`; `template-test/` becomes `test/`; `tsconfig.site.json` becomes `tsconfig.json`. Every source must also be in `package.json` `files`.
- `createSiteManifest()` pins must match the repository's `devDependencies` and lockfile, including the `@parcel/watcher` override (`overrides` for npm, `resolutions` for Yarn, `pnpm-workspace.yaml` for pnpm); `test/generator.test.js` enforces it. See `PACKAGE_MANAGERS.md` for why the override exists and when to remove it.
- The CLI repeats the non-empty check before calling the creator (so an injected `createProject` is also protected) and rejects destinations starting with `-`.
- Existing server-rendered/CMS/commerce applications are an important White Label niche, but they should adopt individual runtime packages directly rather than asking the generator to merge a scaffold into host code. Keep that distinction explicit in product behavior and documentation.
- Do not add a force/overwrite/merge-into-existing-project path unless the user explicitly requests and approves that product change. Prefer documenting package-level incremental adoption over weakening destination safety.
- The generated application has one canonical rendering path: ordinary `.ts` modules using `html`, `attributes`, and explicit `unsafeHTML` trust boundaries from `white-label-view/html`.
- Do not reintroduce first-party JSX runtime assumptions or separate JSX/no-JSX scaffold trees. JSX and other renderers remain application-owned integrations through View's template contract.
- Generated public pages should remain HTML-first and progressively enhanced: meaningful initial content, semantic links/forms, crawlable URLs, and metadata should not depend on client JavaScript.
- Keep third-party template engines application-owned. Do not add renderer-specific adapters or runtime dependencies to the generator without an explicit requirement.
- Keep ordinary untrusted values in `html` interpolations so they are escaped. Use `attributes()` for opening-tag attribute composition. Treat `unsafeHTML()` as an explicit caller-owned trust boundary; it must not become a convenience escape hatch for untrusted values.
- Do not claim the tagged-template escaping model makes arbitrary URL, CSS, script, style, comment, or other semantic contexts safe. Preserve the runtime's context restrictions and keep application validation responsibilities explicit.
- Keep generated serverless examples provider-neutral and request-scoped. Do not make Express, a cloud provider SDK, or mutable module-level request state a requirement.
- Do not introduce framework-, commerce-, CMS-, analytics-, or AI-specific runtime dependencies merely to target a niche. The generator's value is a small, inspectable composition of standards-oriented pieces.
- Do not hand-edit dependency lockfiles. Regenerate them with the package manager only after coordinated runtime versions actually exist in the registry.

## Coordinated release dependency

Generator 11 targets the exact published coordinated runtime versions: `white-label-mediator@5.0.2`, `white-label-model@7.1.0`, `white-label-router@6.2.0`, and `white-label-view@8.0.0`. Keep the release lockfile registry-based and regenerate it with the package manager when coordinated runtime versions change.
