import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, symlink, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createEnv} from 'yeoman-environment';
import {build, parseArguments} from '../dist/scripts/build.js';
import {createSite, createSiteManifest} from '../dist/scaffold/index.js';
const root = path.resolve('.');

function compileSite(destination) {
    execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], {cwd: destination, stdio: 'pipe'});
}

test('programmatic scaffold API creates the same reviewable site without Yeoman', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const destination = path.join(temporary, 'site');
    await createSite({destination});
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8')), createSiteManifest());
    assert.match(await readFile(path.join(destination, 'README.md'), 'utf8'), /TypeScript/);
    assert.match(await readFile(path.join(destination, 'tsconfig.json'), 'utf8'), /jsxImportSource/);
    assert.match(await readFile(path.join(destination, 'scripts/build.ts'), 'utf8'), /tailwindcss/);
    assert.match(await readFile(path.join(destination, 'test/site.test.js'), 'utf8'), /test/);
});

test('packaged generator creates a strictly typed Tailwind and JSX site that builds in development and production', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-generator-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const pack = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], {encoding: 'utf8'}))[0];
    execFileSync('tar', ['-xzf', path.join(temporary, pack.filename), '-C', temporary]);
    await symlink(path.join(root, 'node_modules'), path.join(temporary, 'package/node_modules'));
    const sourceEnv = createEnv({cwd: path.join(temporary, 'source-site'), skipInstall: true});
    sourceEnv.register(path.join(root, 'generators/app/index.js'), {namespace: 'white-label:app'});
    await sourceEnv.run('white-label:app', {skipInstall: true, force: true});
    const destination = path.join(temporary, 'site');
    const env = createEnv({cwd: destination, skipInstall: true});
    env.register(path.join(temporary, 'package/generators/app/index.js'), {namespace: 'white-label:app'});
    await env.run('white-label:app', {skipInstall: true, force: true});
    const manifest = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8'));
    assert.deepEqual(manifest, createSiteManifest());
    assert.equal(manifest.type, 'module');
    assert.equal(manifest.dependencies['white-label-model'], 'github:bshack/white-label-model#582bef8c70cc246b2cd76b34aeb472ea7fef2f90');
    assert.equal(manifest.dependencies['white-label-view'], 'github:bshack/white-label-view#42b23195e7a1aac91a5e7d969e5c5c88e5b1e691');
    assert.equal(manifest.dependencies['white-label-router'], '4.0.0');
    assert.equal(manifest.dependencies['white-label-mediator'], '3.0.0');
    assert.equal(manifest.dependencies.eta, undefined);
    assert.equal(manifest.devDependencies.bootstrap, undefined);
    assert.equal(manifest.devDependencies.sass, undefined);
    assert.equal(manifest.devDependencies.tailwindcss, '4.3.3');
    assert.equal(manifest.devDependencies['@tailwindcss/cli'], '4.3.3');
    assert.equal(manifest.dependencies.react, undefined);
    assert.equal(manifest.dependencies.handlebars, undefined);
    assert.equal(manifest.engines.node, '^22.18.0 || >=24.11.0');
    assert.match(await readFile(path.join(destination, 'README.md'), 'utf8'), /TypeScript/);
    assert.match(manifest.scripts.typecheck, /tsc/);
    await symlink(path.join(root, 'node_modules'), path.join(destination, 'node_modules'));
    compileSite(destination);
    execFileSync(process.execPath, ['dist/scripts/build.js', '--version=package-test', '--site-url=https://example.com'], {cwd: destination, stdio: 'pipe'});
    assert.match(await readFile(path.join(destination, '_deploy/index.html'), 'utf8'), /<!DOCTYPE html>/i);
    execFileSync(process.execPath, ['--test', 'test/site.test.js'], {cwd: destination, stdio: 'pipe'});

    // Run the imported build too so its coverage maps to the repository's source.
    await build(parseArguments(['--version=development']), destination);
    const css = await readFile(path.join(destination, '_deploy/release/development/assets/style/global.css'), 'utf8');
    assert.match(css, /tailwindcss v4\.3\.3/i);
    assert.match(css, /\.visually-hidden/);
    assert.match(css, /\.mx-auto/);
    assert.doesNotMatch(css, /Bootstrap\s+v5/);
    await build(parseArguments(['--version=production', '--production=true', '--site-url=https://example.com']), destination);
    assert.ok((await readFile(path.join(destination, '_deploy/release/production/assets/style/global.css'), 'utf8')).length < css.length);

    await writeFile(path.join(destination, 'app/no-data.tsx'), "export default function Page(data: Record<string, unknown>) { return <p>{String(data.www)}</p>; }\n");
    compileSite(destination);
    await build(parseArguments(['--version=no-data']), destination);
    assert.match(await readFile(path.join(destination, '_deploy/no-data.html'), 'utf8'), /<p>\/</p>/);
    assert.match(await readFile(path.join(destination, '_deploy/robots.txt'), 'utf8'), /Allow: \//);
    assert.match(await readFile(path.join(destination, '_deploy/sitemap.xml'), 'utf8'), /http:\/\/localhost:8080/);

    await writeFile(path.join(destination, 'app/bad.tsx'), 'export default 1;\n');
    compileSite(destination);
    await assert.rejects(build(parseArguments(['--version=bad-page']), destination), /must export a default render function/);
    await rm(path.join(destination, 'app/bad.tsx'));

    await writeFile(path.join(destination, 'app/assets/data/view/no-data.json'), '{invalid');
    await assert.rejects(build(parseArguments(['--version=invalid']), destination), SyntaxError);
});

test('build default arguments work through the compiled CLI', () => {
    execFileSync(process.execPath, ['dist/scripts/build.js'], {cwd: root, stdio: 'pipe'});
    assert.equal(parseArguments([]).www, '/');
    execFileSync(process.execPath, ['--input-type=module', '-e', "await import('./dist/scripts/build.js')"], {cwd: root, stdio: 'pipe'});
});
