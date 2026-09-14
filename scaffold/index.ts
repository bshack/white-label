/** @module scaffold */
import {cp, mkdir, writeFile} from 'node:fs/promises';
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
    jsx?: boolean;
}

const nodeFileSystem: ScaffoldFileSystem = {
    async copy(source, destination) {
        await mkdir(path.dirname(destination), {recursive: true});
        await cp(source, destination, {recursive: true});
    },
    async writeJSON(destination, value) {
        await mkdir(path.dirname(destination), {recursive: true});
        await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`);
    }
};

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
            'esbuild@0.28.2': true,
            'white-label-view@5.1.0': true
        },
        dependenciesMeta: {
            '@parcel/watcher@2.5.1': {built: true},
            'esbuild@0.28.2': {built: true},
            'white-label-view@5.1.0': {built: true}
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
            'white-label-mediator': '4.0.0',
            'white-label-model': '6.0.0',
            'white-label-router': '5.0.0',
            'white-label-view': '5.1.0'
        }
    };
}

const commonNoJsxCopies = [
    ['app/assets/data', 'app/assets/data'],
    ['app/assets/style', 'app/assets/style'],
    ['app/assets/script/tasks/TaskApplication.ts', 'app/assets/script/tasks/TaskApplication.ts'],
    ['app/assets/script/tasks/TaskMediator.ts', 'app/assets/script/tasks/TaskMediator.ts'],
    ['app/assets/script/tasks/TaskModel.ts', 'app/assets/script/tasks/TaskModel.ts'],
    ['app/assets/script/tasks/TaskRouter.ts', 'app/assets/script/tasks/TaskRouter.ts'],
    ['app/assets/view/examples/tasks/task-state.ts', 'app/assets/view/examples/tasks/task-state.ts'],
    ['app/package.json', 'app/package.json']
] as const;

const noJsxTemplateCopies = [
    ['scaffold/no-jsx/app/index.ts', 'app/index.ts'],
    ['scaffold/no-jsx/app/404.ts', 'app/404.ts'],
    ['scaffold/no-jsx/app/assets/script/index.ts', 'app/assets/script/index.ts'],
    ['scaffold/no-jsx/app/assets/script/tasks/TaskView.ts', 'app/assets/script/tasks/TaskView.ts'],
    ['scaffold/no-jsx/app/assets/view/examples/tasks/TaskExample.ts', 'app/assets/view/examples/tasks/TaskExample.ts'],
    ['scaffold/no-jsx/README.md', 'README.md'],
    ['tsconfig.site.no-jsx.json', 'tsconfig.json']
] as const;

/**
 * Create a White Label project.
 *
 * This is the shared implementation behind every creation interface. Adapters
 * translate their environment into these options instead of owning templates or
 * project-generation behavior themselves.
 */
export async function createProject({destination, fileSystem = nodeFileSystem, jsx = true}: CreateProjectOptions) {
    const copies = jsx ? [
        ['.editorconfig', '.editorconfig'],
        ['.yarnrc.yml', '.yarnrc.yml'],
        ['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
        ['app', 'app'],
        ['app/README.md', 'README.md'],
        ['server', 'server'],
        ['scripts', 'scripts'],
        ['template-test', 'test'],
        ['tsconfig.site.json', 'tsconfig.json']
    ] as const : [
        ['.editorconfig', '.editorconfig'],
        ['.yarnrc.yml', '.yarnrc.yml'],
        ['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
        ...commonNoJsxCopies,
        ...noJsxTemplateCopies,
        ['server', 'server'],
        ['scripts', 'scripts'],
        ['template-test', 'test']
    ] as const;

    for (const [source, target] of copies) {
        await fileSystem.copy(path.join(packageRoot, source), path.join(destination, target));
    }

    await fileSystem.writeJSON(path.join(destination, 'package.json'), createSiteManifest());
}
