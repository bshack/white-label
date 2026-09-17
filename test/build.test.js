import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {build, parseArguments, tailwindExecutable} from '../dist/scripts/build.js';

test('build arguments retain and normalize explicit deployment values', () => {
    assert.deepEqual(parseArguments(['--www=/site', '--cdn=https://cdn.example.test/assets', '--version=release-1', '--production=true', '--site-url=https://www.example.test/']), {
        cdn: 'https://cdn.example.test/assets/', production: true, siteUrl: 'https://www.example.test', version: 'release-1', www: '/site/'
    });
    assert.equal(
        parseArguments(['--www=https://www.example.test/', '--version=release-2']).www,
        'https://www.example.test/'
    );
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
    assert.throws(() => parseArguments(['--cdn=/assets/\"><script>']), /cdn/);
    assert.throws(() => parseArguments(['--production=true', '--cdn=http://cdn.example.test/']), /HTTPS/);
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
});

test('Tailwind executable selection supports Windows and POSIX package-manager bins', () => {
    assert.equal(tailwindExecutable('win32'), 'tailwindcss.cmd');
    assert.equal(tailwindExecutable('linux'), 'tailwindcss');
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
