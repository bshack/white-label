/**
 * Project creation for `generator-white-label`.
 *
 * `createProject()` is the only code that copies the starter into a destination. The CLI and any other integration
 * call it, so the "never write over existing files" rule lives in one place.
 *
 * @module scaffold
 */
import {cp, lstat, mkdir, readdir, rm, rmdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Compiled to dist/scaffold/index.js, so the package root (where app/, server/, and the other templates live) is two
// levels up.
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * The two file operations `createProject()` needs. Pass your own implementation to record or redirect writes, for
 * example in tests; the default writes to disk.
 */
export interface ScaffoldFileSystem {
    /** Copy a file or directory from the generator package to `destination`, failing if `destination` exists. */
    copy(source: string, destination: string): void | Promise<void>;
    /** Write `value` as formatted JSON to `destination`, failing if `destination` exists. */
    writeJSON(destination: string, value: unknown): void | Promise<void>;
}

/** Options for {@link createProject}. */
export interface CreateProjectOptions {
    /** Directory to create the project in. It may be missing or empty; relative paths resolve against the process cwd. */
    destination: string;
    /** File operations to use instead of the real file system. */
    fileSystem?: ScaffoldFileSystem;
}

// The default file system never overwrites: `errorOnExist` and the `wx` flag make a copy or write fail if something
// appeared at the target after the destination was checked.

const nodeFileSystem: ScaffoldFileSystem = {
    async copy(source, destination) {
        await mkdir(path.dirname(destination), {recursive: true});
        await cp(source, destination, {recursive: true, force: false, errorOnExist: true});
    },
    async writeJSON(destination, value) {
        await mkdir(path.dirname(destination), {recursive: true});
        await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'});
    }
};

/** True when a file-system error means "no such file or directory". */
function isMissing(error: unknown) {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

/** True when anything (file, directory, or symlink, even a broken one) exists at `location`. */
function exists(location: string) {
    return lstat(location).then(() => true, () => false);
}

/**
 * Refuse to create a project on top of existing files.
 *
 * @returns The missing directories, deepest first, that creating `destination` will add. If creation fails they can be
 *     removed again. An existing empty destination returns an empty list.
 * @throws If `destination` is a non-empty directory, or cannot be read for any reason other than not existing.
 */
async function assertDestinationAvailable(destination: string) {
    try {
        const entries = await readdir(destination);
        if (entries.length) {throw new Error(`Destination directory must be empty: ${destination}`);}
        return [];
    } catch (error) {
        if (!isMissing(error)) {throw error;}
    }
    const missing: string[] = [];
    for (let directory = destination; !await exists(directory); directory = path.dirname(directory)) {
        missing.push(directory);
    }
    return missing;
}

/**
 * Undo a failed creation. Removes the scaffold entries this call created, then the directories it created, stopping
 * at the first directory that is not empty. Anything that existed before the call is left alone.
 */
async function removeCreated(entries: readonly string[], directories: readonly string[]) {
    await Promise.allSettled(entries.map(entry => rm(entry, {recursive: true, force: true})));
    for (const directory of directories) {
        try {
            await rmdir(directory);
        } catch {
            return;
        }
    }
}

/**
 * Build the `package.json` written into every generated project.
 *
 * Versions are exact pins. A repository test checks they match the versions this repository is tested with.
 *
 * @returns A fresh manifest object; callers may modify it.
 */
export function createSiteManifest() {
    return {
        name: 'white-label-site',
        version: '1.0.0',
        private: true,
        type: 'module',
        engines: {node: '^22.18.0 || >=24.11.0'},
        // `build` runs `tsc` with `noEmitOnError`, which already type checks, so `test` skips a separate `typecheck`.
        scripts: {
            build: 'tsc -p tsconfig.json && node dist/scripts/build.js',
            typecheck: 'tsc -p tsconfig.json --noEmit',
            test: 'node --run build -- --version=test --production=true --site-url=https://example.com && node --test --experimental-test-coverage --test-coverage-include="dist/app/assets/script/**/*.js" --test-coverage-include="dist/app/assets/view/examples/tasks/*.js" --test-coverage-lines=100 --test-coverage-functions=100 --test-coverage-branches=100 test/*.test.js'
        },
        allowScripts: {
            '@parcel/watcher@2.6.0': true,
            'esbuild@0.28.2': true
        },
        dependenciesMeta: {
            '@parcel/watcher@2.6.0': {built: true},
            'esbuild@0.28.2': {built: true}
        },
        // @tailwindcss/cli 4.3.3 pins @parcel/watcher 2.5.1, which depends on micromatch -> braces, and braces has a
        // high-severity advisory with no fixed release. @parcel/watcher 2.6.0 uses picomatch instead, so force it.
        // npm reads `overrides`, Yarn reads `resolutions`, and pnpm reads `overrides` in pnpm-workspace.yaml.
        // Remove all three once @tailwindcss/cli depends on a fixed @parcel/watcher (see PACKAGE_MANAGERS.md).
        overrides: {'@parcel/watcher': '2.6.0'},
        resolutions: {'@parcel/watcher': '2.6.0'},
        devDependencies: {
            '@tailwindcss/cli': '4.3.3',
            '@types/node': '24.13.3',
            'axe-core': '4.14.0',
            'esbuild': '0.28.2',
            'html-validate': '11.16.2',
            'jsdom': '30.1.2',
            'tailwindcss': '4.3.3',
            'typescript': '7.0.2'
        },
        dependencies: {
            'white-label-mediator': '5.0.2',
            'white-label-model': '7.1.0',
            'white-label-router': '6.2.0',
            'white-label-view': '8.0.0'
        }
    };
}

// [source in this package, target in the new project]. npm never publishes files named .gitignore, so the generated
// project's ignore rules ship as scaffold/gitignore and are renamed on copy. app/README.md becomes the project README.
// scaffold/project-AGENTS.md becomes the project's AGENTS.md; it has another name here so agents working on this
// repository do not mistake it for this directory's guide.
const scaffoldCopies = [
    ['.editorconfig', '.editorconfig'],
    ['scaffold/gitignore', '.gitignore'],
    ['.yarnrc.yml', '.yarnrc.yml'],
    ['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
    ['app', 'app'],
    ['app/README.md', 'README.md'],
    ['scaffold/project-AGENTS.md', 'AGENTS.md'],
    ['server', 'server'],
    ['scripts', 'scripts'],
    ['template-test', 'test'],
    ['tsconfig.site.json', 'tsconfig.json']
] as const;

/**
 * Create a new White Label starter project.
 *
 * The destination must be missing or an empty directory; nothing is ever overwritten. If creation fails part-way,
 * everything this call created is removed before the error is rethrown, so a retry is not blocked by a half-written
 * project.
 *
 * @param options - See {@link CreateProjectOptions}.
 * @returns Resolves with `undefined` once every file is written.
 * @throws {TypeError} If `destination` is not a non-empty string.
 * @throws {Error} If `destination` is a non-empty directory, or a file-system operation fails.
 */
export async function createProject({destination, fileSystem = nodeFileSystem}: CreateProjectOptions) {
    if (typeof destination !== 'string' || destination === '') {
        throw new TypeError('Destination must be a non-empty path');
    }
    const createdDirectories = await assertDestinationAvailable(destination);
    const createdEntries: string[] = [];
    // Track a target for cleanup only if nothing was there before this call wrote it.
    const create = async (target: string, write: () => void | Promise<void>) => {
        if (!await exists(target)) {createdEntries.push(target);}
        await write();
    };
    try {
        // Each copy writes a different top-level entry, so they run concurrently. Wait for all of them to settle before
        // reporting a failure, so cleanup does not race a copy that is still writing. The manifest is written last.
        const copies = await Promise.allSettled(scaffoldCopies.map(([source, target]) => {
            const location = path.join(destination, target);
            return create(location, () => fileSystem.copy(path.join(packageRoot, source), location));
        }));
        const failure = copies.find((result): result is PromiseRejectedResult => result.status === 'rejected');
        if (failure) {throw failure.reason;}
        const manifest = path.join(destination, 'package.json');
        await create(manifest, () => fileSystem.writeJSON(manifest, createSiteManifest()));
    } catch (error) {
        await removeCreated(createdEntries, createdDirectories);
        throw error;
    }
}
