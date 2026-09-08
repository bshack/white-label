import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {parseArguments} from '../dist/scripts/build.js';

test('build arguments retain explicit deployment values', () => {
    assert.deepEqual(parseArguments(['--www=/site/', '--cdn=/assets/', '--version=release-1', '--production=true', '--site-url=https://www.example.test/']), {
        cdn: '/assets/', production: true, siteUrl: 'https://www.example.test', version: 'release-1', www: '/site/'
    });
});

test('build arguments reject path traversal and non-HTTPS production origins', () => {
    assert.throws(() => parseArguments(['--version=../../outside']), /Version/);
    assert.throws(() => parseArguments(['--production=true', '--site-url=http://example.test']), /HTTPS/);
    assert.throws(() => parseArguments(['--site-url=not-a-url']), /HTTPS/);
});

test('starter uses Eta, Bootstrap native fonts, and no React or Handlebars', async () => {
    const [manifest, build, style] = await Promise.all(['package.json', 'scripts/build.ts', 'app/assets/style/global.scss'].map(file => readFile(file, 'utf8')));
    assert.match(manifest, /"eta": "4\.6\.0"/);
    assert.doesNotMatch(`${manifest}${build}`, /handlebars|react-dom|from 'react'/i);
    assert.doesNotMatch(style, /@font-face|assets\/font/);
});
