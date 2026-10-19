import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, realpath, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import test from 'node:test';
import {build, parseArguments} from '../dist/scripts/build.js';

test('build arguments retain and normalize explicit deployment values', () => {
    assert.deepEqual(parseArguments(['--www=/site', '--cdn=https://cdn.example.test/assets', '--version=release-1', '--production=true', '--site-url=https://www.example.test/']), {
        cdn: 'https://cdn.example.test/assets/', production: true, siteUrl: 'https://www.example.test', version: 'release-1', www: '/site/'
    });
    assert.equal(
        parseArguments(['--www=https://www.example.test/', '--version=release-2']).www,
        'https://www.example.test/'
    );
    assert.equal(parseArguments(['--production=false']).production, false);
});

test('build arguments reject unsafe deployment URL values', () => {
    assert.throws(() => parseArguments(['--version=../../outside']), /Version/);
    assert.throws(() => parseArguments(['--version=..']), /Version/);
    assert.throws(() => parseArguments(['--production=true', '--site-url=http://example.test']), /HTTPS/);
    assert.throws(() => parseArguments(['--site-url=not-a-url']), /HTTP/);
    assert.throws(() => parseArguments(['--site-url=https://user:pass@example.test']), /credentials/);
    assert.throws(() => parseArguments(['--site-url=https://example.test/?next=<script>']), /query/);
    assert.throws(() => parseArguments(['--site-url=https://example.test\nSitemap: https://evil.test']), /HTTP/);
    assert.throws(() => parseArguments(['--www=javascript:alert(1)']), /www/);
    assert.throws(() => parseArguments(['--www=//evil.example.test/']), /www/);
    assert.throws(() => parseArguments(['--www=/safe\nbad']), /www/);
    assert.throws(() => parseArguments(['--cdn=/assets/"><script>']), /cdn/);
    assert.throws(() => parseArguments(['--production=true', '--cdn=http://cdn.example.test/']), /HTTPS/);
});

test('build arguments reject mistyped production values and option names', () => {
    assert.throws(() => parseArguments(['--production=tru']), /Production must be true or false/);
    assert.throws(() => parseArguments(['--production=1']), /Production must be true or false/);
    assert.throws(() => parseArguments(['--production']), /must use --production=value/);
    assert.throws(() => parseArguments(['--prodution=true']), /Unknown build option/);
    assert.throws(() => parseArguments(['production=true']), /Unknown build option/);
});

test('programmatic build validates configuration before changing the deployment directory', async t => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'white-label-build-security-'));
    t.after(() => rm(projectRoot, {recursive: true, force: true}));
    const outputRoot = join(projectRoot, '_deploy');
    const marker = join(outputRoot, 'marker.txt');
    await mkdir(outputRoot, {recursive: true});
    await writeFile(marker, 'keep');

    const config = {
        cdn: '/',
        production: true,
        siteUrl: 'https://example.test',
        version: 'release-1',
        www: '/'
    };
    await assert.rejects(build({...config, version: '../../outside'}, projectRoot), /Version/);
    assert.equal(await readFile(marker, 'utf8'), 'keep');
    await assert.rejects(build({...config, production: 'true'}, projectRoot), /Production/);
    assert.equal(await readFile(marker, 'utf8'), 'keep');
    await assert.rejects(build({...config, siteUrl: 42}, projectRoot), /Site URL/);
    assert.equal(await readFile(marker, 'utf8'), 'keep');
});

test('starter uses Tailwind and White Label tagged HTML without Bootstrap, Eta, React, Handlebars, or npm-only build commands', async () => {
    const [manifest, buildSource, style, page] = await Promise.all([
        'package.json', 'scripts/build.ts', 'app/assets/style/global.css', 'app/index.ts'
    ].map(file => readFile(file, 'utf8')));
    assert.match(manifest, /"tailwindcss": "4\.3\.3"/);
    assert.match(manifest, /"@tailwindcss\/cli": "4\.3\.3"/);
    assert.match(style, /@import "tailwindcss"/);
    assert.match(page, /white-label-view\/html/);
    assert.doesNotMatch(page, /white-label-view\/jsx-runtime/);
    assert.doesNotMatch(buildSource, /\bnpx\b/);
    assert.doesNotMatch(`${manifest}${buildSource}${style}${page}`, /bootstrap|\beta\b|handlebars|react-dom|from 'react'/i);
    assert.doesNotMatch(style, /@font-face|assets\/font/);
});

/** Create the smallest buildable project, with a stand-in Tailwind CLI that records how it was invoked. */
async function createFixtureProject(projectRoot, tailwindManifest) {
    const files = {
        'app/page.ts': '',
        'dist/app/page.js': "export default data => `<html><body>${data.version}</body></html>`;\n",
        'app/assets/data/view/global.json': '{}',
        'app/assets/style/global.css': 'body{}',
        'app/assets/style/print.css': '@media print{}',
        'app/assets/script/main.ts': 'document.title = String(1);\n',
        'node_modules/@tailwindcss/cli/package.json': JSON.stringify(tailwindManifest),
        'node_modules/@tailwindcss/cli/fake-bin.mjs': [
            "import {writeFileSync} from 'node:fs';",
            'const options = process.argv.slice(2);',
            "writeFileSync(options[options.indexOf('-o') + 1], JSON.stringify({options, cwd: process.cwd()}));"
        ].join('\n')
    };
    for (const [file, contents] of Object.entries(files)) {
        await mkdir(dirname(join(projectRoot, file)), {recursive: true});
        await writeFile(join(projectRoot, file), contents);
    }
}

test('build runs the project-local Tailwind CLI through Node without relying on PATH or Windows shims', async t => {
    const temporary = await mkdtemp(join(tmpdir(), 'white-label-build-tailwind-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    // An "assets" ancestor must not hide pages: only assets/ inside app/ holds non-page modules.
    const projectRoot = join(temporary, 'assets', 'site');
    await createFixtureProject(projectRoot, {
        name: '@tailwindcss/cli',
        bin: {tailwindcss: './fake-bin.mjs'},
        exports: {'./package.json': './package.json'}
    });

    const previousPath = process.env.PATH;
    process.env.PATH = '';
    t.after(() => {process.env.PATH = previousPath;});
    await build(parseArguments(['--version=fixture', '--production=true', '--site-url=https://example.test']), projectRoot);
    process.env.PATH = previousPath;

    const assets = join(projectRoot, '_deploy/release/fixture/assets');
    const tailwind = JSON.parse(await readFile(join(assets, 'style/global.css'), 'utf8'));
    assert.deepEqual(tailwind.options, [
        '-i', join(projectRoot, 'app/assets/style/global.css'),
        '-o', join(assets, 'style/global.css'),
        '--minify'
    ]);
    assert.equal(await realpath(tailwind.cwd), await realpath(projectRoot));
    assert.equal(await readFile(join(assets, 'style/print.css'), 'utf8'), '@media print{}');
    assert.equal(await readFile(join(projectRoot, '_deploy/page.html'), 'utf8'), '<!DOCTYPE html>\n<html><body>fixture</body></html>\n');
    assert.match(await readFile(join(assets, 'script/main.compiled.js'), 'utf8'), /document\.title/);
    assert.equal(JSON.parse(await readFile(join(assets, 'data/config.json'), 'utf8')).version, 'fixture');
});

test('build reports a Tailwind CLI package without its executable', async t => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'white-label-build-tailwind-missing-'));
    t.after(() => rm(projectRoot, {recursive: true, force: true}));
    await createFixtureProject(projectRoot, {name: '@tailwindcss/cli'});

    await assert.rejects(build(parseArguments(['--version=fixture']), projectRoot), /@tailwindcss\/cli does not declare a tailwindcss executable/);
});
