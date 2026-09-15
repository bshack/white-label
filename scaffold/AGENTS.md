# generator-white-label scaffold instructions

These instructions are more specific than the repository-root agent guide for files under `scaffold/`.

## Generator 9 creation contract

- `createProject()` is the canonical project-creation engine. CLI and future adapters must call it rather than reimplement scaffold copying or policy.
- Destination safety belongs in `createProject()`: missing and empty destinations are allowed; an existing non-empty destination must be rejected before scaffold files are copied or package metadata is written.
- Do not add a force/overwrite path unless the user explicitly requests and approves that product change.
- JSX and no-JSX scaffolds must preserve equivalent White Label architecture and core behavior. JSX is a rendering-syntax choice, not a capability tier.
- Keep third-party template engines application-owned. Start those integrations from the no-JSX scaffold; do not add renderer-specific adapters or runtime dependencies to the generator without an explicit requirement.
- Generated JSX uses the `white-label-view` trust contract: ordinary text/attributes are HTML-escaped, intrinsic `on*` handlers are not supported, and URL/CSS semantics remain application validation concerns.
- Keep generated serverless examples provider-neutral and request-scoped. Do not make Express, a cloud provider SDK, or mutable module-level request state a requirement.
- Do not hand-edit dependency lockfiles. Regenerate them with the package manager only after the coordinated runtime versions actually exist in the registry.

## Coordinated release dependency

Generator 9 targets `white-label-mediator@5`, `white-label-model@7`, `white-label-router@6`, and `white-label-view@6`. Registry installation failures for unpublished target versions are a real release gate; do not bypass them with Git references in the release lockfile.
