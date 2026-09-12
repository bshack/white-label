# White Label CLI

The first-party `white-label` command creates a White Label site directly from the framework-independent scaffold API. It does not create or require a Yeoman environment.

## Create a site

Install the package globally or invoke its binary through your preferred npm workflow, then run:

```sh
white-label create my-site
cd my-site
npm install
npm test
```

The destination may be relative to the current working directory or absolute. The command creates the same reviewed scaffold as `generator-white-label/scaffold` and the optional Yeoman wrapper.

## Help

```sh
white-label --help
```

## Architecture

The CLI is intentionally thin:

```text
white-label CLI
      |
      v
generator-white-label/scaffold
      |
      v
createSite()
```

`createSite()` is the canonical implementation. The CLI and Yeoman generator are adapters around it; neither owns a separate template or generation path.

This means integrations can call the programmatic API directly:

```js
import {createSite} from 'generator-white-label/scaffold';

await createSite({destination: '/absolute/path/to/my-site'});
```

## Yeoman compatibility

The existing `yo white-label` interface remains supported as an optional interactive wrapper for users who already use Yeoman. New automation and integrations should prefer the first-party CLI or programmatic scaffold API so they do not depend on Yeoman-specific lifecycle behavior.

## Release verification

CI compiles the CLI, enforces the repository's 100% coverage gate, packs the npm artifact, installs that tarball into a clean temporary project, verifies the `white-label` bin entry exists, verifies the public scaffold import resolves, and executes the packed CLI help path.
