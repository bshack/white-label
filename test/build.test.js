import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {parseArguments, tailwindExecutable} from '../dist/scripts/build.js';

test('build arguments retain and normalize explicit deployment values', () => {
    assert.deepEqual(parseArguments(['--www=/site', '--cdn=https://cdn.example.test/assets', '--version=release-1', '--production=true', '--site-url=https://www.example.test/']), {
        cdn: 'https://cdn.example.test/assets/', production: true, siteUrl: 'https://www.example.test', version: 'release-1', www: '/site/'
    });
});

test('build arguments reject unsafe deployment URL values', () => {
    assert.throws(() => parseArguments(['--version=../../outside']), /Version/);
    assert.throws(() => parseArguments(['--production=true', '--site-url=http://example.test']), /HTTPS/);
    assert.throws(() => parseArguments(['--site-url=not-a-url']), /HTTP/);
    assert.throws(() => parseArguments(['--site-url=https://user:pass@example.test']), /credentials/);
    assert.throws(() => parseArguments(['--site-url=https://example.test/?next=<script>']), /query/);
    assert.throws(() => parseArguments(['--site-url=https://example.test\nSitemap: https://evil.test']), /HTTP/);
    assert.throws(() => parseArguments(['--www=javascript:alert(1)']), /www/);
    assert.throws(() => parseArguments(['--www=//evil.example.test/']), /www/);
    assert.throws(() => parseArguments(['--cdn=/assets/\"><script>']), /cdn/);
    assert.throws(() => parseArguments(['--production=true', '--cdn=http://cdn.example.test/']), /HTTPS/);
});

test('Tailwind executable selection supports Windows and POSIX package-manager bins', () => {
    assert.equal(tailwindExecutable('win32'), 'tailwindcss.cmd');
    assert.equal(tailwindExecutable('linux'), 'tailwindcss');
});

test('starter uses Tailwind and White Label tagged HTML without Bootstrap, Eta, React, Handlebars, or npm-only build commands', async () => {
    const [manifest, build, style, page] = await Promise.all([
        'package.json', 'scripts/build.ts', 'app/assets/style/global.css', 'app/index.ts'
    ].map(file => readFile(file, 'utf8')));
    assert.match(manifest, /"tailwindcss": "4\.3\.3"/);
    assert.match(manifest, /"@tailwindcss\/cli": "4\.3\.3"/);
    assert.match(style, /@import "tailwindcss"/);
    assert.match(page, /white-label-view\/html/);
    assert.doesNotMatch(page, /white-label-view\/jsx-runtime/);
    assert.doesNotMatch(build, /\bnpx\b/);
    assert.doesNotMatch(`${manifest}${build}${style}${page}`, /bootstrap|\beta\b|handlebars|react-dom|from 'react'/i);
    assert.doesNotMatch(style, /@font-face|assets\/font/);
});
