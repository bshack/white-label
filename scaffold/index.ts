/** @module scaffold */
import {cp, mkdir, readdir, writeFile} from 'node:fs/promises';
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

/** Refuse to layer a generated project over existing user files. */
async function assertDestinationAvailable(destination: string) {
    try {
        const entries = await readdir(destination);
        if (entries.length) {throw new Error(`Destination directory must be empty: ${destination}`);}
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {return;}
        throw error;
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
        scripts: {
            build: 'tsc -p tsconfig.json && node dist/scripts/build.js',
            typecheck: 'tsc -p tsconfig.json --noEmit',
            test: 'node --run typecheck && node --run build -- --version=test --production=true --site-url=https://example.com && node --test --experimental-test-coverage --test-coverage-include=dist/app/assets/script/index.js --test-coverage-lines=100 --test-coverage-functions=100 --test-coverage-branches=100 test/*.test.js'
        },
        allowScripts: {
            '@parcel/watcher@2.5.1': true,
            'esbuild@0.28.2': true
        },
        dependenciesMeta: {
            '@parcel/watcher@2.5.1': {built: true},
            'esbuild@0.28.2': {built: true}
        },
        devDependencies: {
            '@tailwindcss/cli': '4.3.3',
            '@types/node': '24.13.3',
            'axe-core': '4.13.0',
            'esbuild': '0.28.2',
            'html-validate': '11.15.0',
            'jsdom': '30.0.1',
            'tailwindcss': '4.3.3',
            'typescript': '7.0.2'
        },
        dependencies: {
            'white-label-mediator': '5.0.1',
            'white-label-model': '7.0.2',
            'white-label-router': '6.1.1',
            'white-label-view': '7.0.1'
        }
    };
}

const scaffoldCopies = [
    ['.editorconfig', '.editorconfig'],
    ['.yarnrc.yml', '.yarnrc.yml'],
    ['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
    ['app', 'app'],
    ['app/README.md', 'README.md'],
    ['server', 'server'],
    ['scripts', 'scripts'],
    ['template-test', 'test'],
    ['tsconfig.site.json', 'tsconfig.json']
] as const;

/** Create the canonical tagged-template White Label starter without overwriting user files. */
export async function createProject({destination, fileSystem = nodeFileSystem}: CreateProjectOptions) {
    await assertDestinationAvailable(destination);
    for (const [source, target] of scaffoldCopies) {
        await fileSystem.copy(path.join(packageRoot, source), path.join(destination, target));
    }
    await fileSystem.writeJSON(path.join(destination, 'package.json'), createSiteManifest());
}
