/** @module scaffold */
import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const nodeFileSystem = {
    async copy(source, destination) {
        await mkdir(path.dirname(destination), { recursive: true });
        await cp(source, destination, { recursive: true });
    },
    async writeJSON(destination, value) {
        await mkdir(path.dirname(destination), { recursive: true });
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
        engines: { node: '^22.18.0 || >=24.11.0', npm: '>=11.0' },
        scripts: {
            build: 'tsc -p tsconfig.json && node dist/scripts/build.js',
            typecheck: 'tsc -p tsconfig.json --noEmit',
            test: 'npm run typecheck && npm run build -- --version=test --production=true --site-url=https://example.com && node --test --experimental-test-coverage --test-coverage-include=dist/app/assets/script/index.js --test-coverage-lines=100 --test-coverage-functions=100 --test-coverage-branches=100 test/*.test.js',
            audit: 'npm audit --audit-level=low'
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
            'white-label-mediator': 'github:bshack/white-label-mediator#e815f704a759de76f96f66ac198b4dc42dfc30f4',
            'white-label-model': 'github:bshack/white-label-model#b5b45b13b45f509497d0a5bdbed86c8bcc054980',
            'white-label-router': 'github:bshack/white-label-router#23295657a29764a140218e03d384631ce3a2b9c3',
            'white-label-view': 'github:bshack/white-label-view#b612930edaef814412899b3391a14fd36df28d9d'
        }
    };
}
/**
 * Create a White Label project.
 *
 * This is the shared implementation behind every creation interface. Adapters
 * translate their environment into these options instead of owning templates or
 * project-generation behavior themselves.
 */
export async function createProject({ destination, fileSystem = nodeFileSystem }) {
    const copies = [
        ['app', 'app'],
        ['app/README.md', 'README.md'],
        ['scripts', 'scripts'],
        ['template-test', 'test'],
        ['tsconfig.site.json', 'tsconfig.json']
    ];
    for (const [source, target] of copies) {
        await fileSystem.copy(path.join(packageRoot, source), path.join(destination, target));
    }
    await fileSystem.writeJSON(path.join(destination, 'package.json'), createSiteManifest());
}
/** Compatibility alias for the original scaffold API. */
export const createSite = createProject;
//# sourceMappingURL=index.js.map