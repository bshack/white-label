import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, symlink, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync, spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {build, parseArguments} from '../dist/scripts/build.js';
import {createProject, createSiteManifest} from '../dist/scaffold/index.js';
const root = path.resolve('.');

function compileSite(destination) {
    execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], {cwd: destination, stdio: 'pipe'});
}

async function availablePort() {
    return new Promise((resolve, reject) => {
        const probe = createServer();
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', () => {
            const address = probe.address();
            if (!address || typeof address === 'string') {
                probe.close(() => reject(new Error('Unable to allocate a local preview port')));
                return;
            }
            probe.close(error => error ? reject(error) : resolve(address.port));
        });
    });
}

async function waitForPreview(origin, process) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        if (process.exitCode !== null) {
            throw new Error(`Local preview exited before becoming available with code ${process.exitCode}`);
        }
        try {
            const response = await fetch(`${origin}/`);
            if (response.ok) {return response;}
            await response.arrayBuffer();
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Local preview did not become available');
}

async function verifyLocalPreview(destination) {
    const port = await availablePort();
    const origin = `http://127.0.0.1:${port}`;
    const preview = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', '_deploy'], {
        cwd: destination,
        stdio: 'pipe'
    });

    try {
        const response = await waitForPreview(origin, preview);
        assert.equal(response.status, 200);
        const html = await response.text();
        const localUrls = [...new Set(
            [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
                .map(match => match[1])
                .filter(url => url.startsWith('/') && !url.startsWith('//'))
        )];
        assert.ok(localUrls.some(url => url.includes('/assets/style/global.css')));
        assert.ok(localUrls.some(url => url.includes('/assets/script/index.compiled.js')));

        for (const url of localUrls) {
            const assetResponse = await fetch(new URL(url, origin));
            assert.equal(assetResponse.status, 200, `${url} should be served from _deploy`);
            await assetResponse.arrayBuffer();
        }
    } finally {
        if (preview.exitCode === null) {preview.kill('SIGTERM');}
        await new Promise(resolve => preview.exitCode === null ? preview.once('exit', resolve) : resolve());
    }
}

const taggedTemplateDescription = /tagged(?: HTML)? templates?|tagged-template/i;

test('programmatic scaffold API creates the canonical tagged-template site', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const destination = path.join(temporary, 'site');
    await createProject({destination});
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8')), createSiteManifest());
    const readme = await readFile(path.join(destination, 'README.md'), 'utf8');
    assert.match(readme, taggedTemplateDescription);
    assert.match(readme, /--directory _deploy/);
    assert.match(readme, /http:\/\/localhost:8080\//);
    const yarnConfig = await readFile(path.join(destination, '.yarnrc.yml'), 'utf8');
    assert.match(yarnConfig, /nodeLinker:\s*node-modules/);
    assert.match(yarnConfig, /npmPreapprovedPackages/);
    assert.match(yarnConfig, /white-label-mediator/);
    assert.match(yarnConfig, /white-label-model/);
    assert.match(yarnConfig, /white-label-router/);
    assert.match(yarnConfig, /white-label-view/);
    assert.doesNotMatch(yarnConfig, /approvedGitRepositories/);
    const pnpmWorkspace = await readFile(path.join(destination, 'pnpm-workspace.yaml'), 'utf8');
    assert.doesNotMatch(pnpmWorkspace, /white-label-view/);
    assert.match(pnpmWorkspace, /@parcel\/watcher/);
    assert.match(pnpmWorkspace, /esbuild/);
    assert.doesNotMatch(await readFile(path.join(destination, 'tsconfig.json'), 'utf8'), /jsxImportSource|"jsx"/);
    assert.match(await readFile(path.join(destination, 'app/index.ts'), 'utf8'), /white-label-view\/html/);
    assert.match(await readFile(path.join(destination, 'app/assets/view/examples/tasks/TaskExample.ts'), 'utf8'), /attributes\(/);
    assert.match(await readFile(path.join(destination, 'scripts/build.ts'), 'utf8'), /tailwindcss/);
    assert.match(await readFile(path.join(destination, 'test/site.test.js'), 'utf8'), /test/);
});

test('packaged project creator creates a strictly typed Tailwind and tagged-template site that builds in development and production', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-generator-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const pack = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], {encoding: 'utf8'}))[0];
    execFileSync('tar', ['-xzf', path.join(temporary, pack.filename), '-C', temporary]);
    await symlink(path.join(root, 'node_modules'), path.join(temporary, 'package/node_modules'));
    const destination = path.join(temporary, 'site');
    const packagedScaffold = await import(new URL(`file://${path.join(temporary, 'package/dist/scaffold/index.js')}`).href);
    await packagedScaffold.createProject({destination});
    const manifest = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8'));
    assert.deepEqual(manifest, createSiteManifest());
    assert.equal(manifest.type, 'module');
    assert.equal(manifest.dependencies['white-label-mediator'], '5.0.1');
    assert.equal(manifest.dependencies['white-label-model'], '7.0.2');
    assert.equal(manifest.dependencies['white-label-router'], '6.1.1');
    assert.equal(manifest.dependencies['white-label-view'], '7.0.1');
    assert.equal(manifest.allowScripts['white-label-view@7.0.1'], undefined);
    assert.equal(manifest.dependenciesMeta['white-label-view@7.0.1'], undefined);
    assert.equal(manifest.allowScripts['esbuild@0.28.2'], true);
    assert.equal(manifest.dependenciesMeta['esbuild@0.28.2']?.built, true);
    assert.equal(manifest.dependencies.eta, undefined);
    assert.equal(manifest.devDependencies.bootstrap, undefined);
    assert.equal(manifest.devDependencies.sass, undefined);
    assert.equal(manifest.devDependencies.tailwindcss, '4.3.3');
    assert.equal(manifest.devDependencies['@tailwindcss/cli'], '4.3.3');
    assert.equal(manifest.dependencies.react, undefined);
    assert.equal(manifest.dependencies.handlebars, undefined);
    assert.equal(manifest.engines.node, '^22.18.0 || >=24.11.0');
    assert.match(await readFile(path.join(destination, 'README.md'), 'utf8'), taggedTemplateDescription);
    assert.match(manifest.scripts.typecheck, /tsc/);
    await symlink(path.join(root, 'node_modules'), path.join(destination, 'node_modules'));

    execFileSync('npm', ['run', 'build', '--', '--version=local'], {cwd: destination, stdio: 'pipe'});
    await verifyLocalPreview(destination);

    compileSite(destination);
    execFileSync(process.execPath, ['dist/scripts/build.js', '--version=package-test', '--site-url=https://example.com'], {cwd: destination, stdio: 'pipe'});
    assert.match(await readFile(path.join(destination, '_deploy/index.html'), 'utf8'), /<!DOCTYPE html>/i);
    execFileSync(process.execPath, ['--test', 'test/site.test.js'], {cwd: destination, stdio: 'pipe'});

    await build(parseArguments(['--version=development']), destination);
    const css = await readFile(path.join(destination, '_deploy/release/development/assets/style/global.css'), 'utf8');
    assert.match(css, /tailwindcss v4\.3\.3/i);
    assert.match(css, /\.visually-hidden/);
    assert.match(css, /\.mx-auto/);
    assert.doesNotMatch(css, /Bootstrap\s+v5/);
    await build(parseArguments(['--version=production', '--production=true', '--site-url=https://example.com']), destination);
    assert.ok((await readFile(path.join(destination, '_deploy/release/production/assets/style/global.css'), 'utf8')).length < css.length);

    await writeFile(path.join(destination, 'app/no-data.ts'), "import {html} from 'white-label-view/html';\nexport default function Page(data: Record<string, unknown>) { return html`<p>${String(data.www)}</p>`; }\n");
    compileSite(destination);
    await build(parseArguments(['--version=no-data']), destination);
    assert.ok((await readFile(path.join(destination, '_deploy/no-data.html'), 'utf8')).includes('<p>/</p>'));
    assert.match(await readFile(path.join(destination, '_deploy/robots.txt'), 'utf8'), /Allow: \//);
    assert.match(await readFile(path.join(destination, '_deploy/sitemap.xml'), 'utf8'), /http:\/\/localhost:8080/);

    await writeFile(path.join(destination, 'app/bad.ts'), 'export default 1;\n');
    compileSite(destination);
    await assert.rejects(build(parseArguments(['--version=bad-page']), destination), /must export a default render function/);
    await rm(path.join(destination, 'app/bad.ts'));

    await writeFile(path.join(destination, 'app/assets/data/view/no-data.json'), '{invalid');
    await assert.rejects(build(parseArguments(['--version=invalid']), destination), SyntaxError);
});

test('build default arguments work through the compiled CLI', () => {
    execFileSync(process.execPath, ['dist/scripts/build.js'], {cwd: root, stdio: 'pipe'});
    assert.equal(parseArguments([]).www, '/');
    execFileSync(process.execPath, ['--input-type=module', '-e', "await import('./dist/scripts/build.js')"], {cwd: root, stdio: 'pipe'});
});
