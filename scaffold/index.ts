/** @module scaffold */
import {cp, lstat, mkdir, readdir, rm, rmdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export interface ScaffoldFileSystem {
    copy(source: string, destination: string): void | Promise<void>;
    writeJSON(destination: string, value: unknown): void | Promise<void>;
}

export interface CreateProjectOptions {
    destination: string;
    fileSystem?: ScaffoldFileSystem;
}

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

function isMissing(error: unknown) {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function exists(location: string) {
    return lstat(location).then(() => true, () => false);
}

/**
 * Refuse to layer a generated project over existing user files.
 *
 * Returns the directories, deepest first, that are missing and will be created for the destination, so a failed
 * creation can remove them again.
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
 * Undo a failed creation: remove the scaffold entries this call created, then the directories it created while
 * they are empty. Entries that already existed when the call reached them are never removed.
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

/** Return the package manifest used by generated White Label projects. */
export function createSiteManifest() {
    return {
        name: 'white-label-site',
        version: '1.0.0',
        private: true,
        type: 'module',
        engines: {node: '^22.18.0 || >=24.11.0'},
        // `build` compiles with `noEmitOnError`, which type checks, so `test` does not run a separate `typecheck` pass.
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
        // @tailwindcss/cli 4.3.3 pins @parcel/watcher 2.5.1, whose micromatch/braces chain has a high-severity
        // advisory with no patched braces release. 2.6.0 uses picomatch instead. npm reads `overrides`, Yarn reads
        // `resolutions`, and pnpm reads `overrides` in pnpm-workspace.yaml.
        overrides: {'@parcel/watcher': '2.6.0'},
        resolutions: {'@parcel/watcher': '2.6.0'},
        devDependencies: {
            '@tailwindcss/cli': '4.3.3',
            '@types/node': '24.13.3',
            'axe-core': '4.13.0',
            'esbuild': '0.28.2',
            'html-validate': '11.16.0',
            'jsdom': '30.1.0',
            'tailwindcss': '4.3.3',
            'typescript': '7.0.2'
        },
        dependencies: {
            'white-label-mediator': '5.0.1',
            'white-label-model': '7.0.3',
            'white-label-router': '6.1.2',
            'white-label-view': '7.0.2'
        }
    };
}

// npm never packs files named .gitignore, so the generated project's ignore rules ship under another name.
const scaffoldCopies = [
    ['.editorconfig', '.editorconfig'],
    ['scaffold/gitignore', '.gitignore'],
    ['.yarnrc.yml', '.yarnrc.yml'],
    ['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
    ['app', 'app'],
    ['app/README.md', 'README.md'],
    ['server', 'server'],
    ['scripts', 'scripts'],
    ['template-test', 'test'],
    ['tsconfig.site.json', 'tsconfig.json']
] as const;

/**
 * Create the canonical tagged-template White Label starter without overwriting user files.
 *
 * If creation fails part-way, the entries and directories this call created are removed before the error is
 * rethrown, so a failed call does not leave a half-written project behind.
 */
export async function createProject({destination, fileSystem = nodeFileSystem}: CreateProjectOptions) {
    if (typeof destination !== 'string' || destination === '') {
        throw new TypeError('Destination must be a non-empty path');
    }
    const createdDirectories = await assertDestinationAvailable(destination);
    const createdEntries: string[] = [];
    /** Record a target as created by this call only if nothing occupied it beforehand. */
    const create = async (target: string, write: () => void | Promise<void>) => {
        if (!await exists(target)) {createdEntries.push(target);}
        await write();
    };
    try {
        // Copies target distinct top-level entries, so they can run concurrently; the manifest is written last.
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
