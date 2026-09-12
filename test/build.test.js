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

test('starter uses Tailwind and White Label JSX without Bootstrap, Eta, React, or Handlebars', async () => {
    const [manifest, build, style, page] = await Promise.all([
        'package.json', 'scripts/build.ts', 'app/assets/style/global.css', 'app/index.tsx'
    ].map(file => readFile(file, 'utf8')));
    assert.match(manifest, /"tailwindcss": "4\.3\.3"/);
    assert.match(manifest, /"@tailwindcss\/cli": "4\.3\.3"/);
    assert.match(style, /@import "tailwindcss"/);
    assert.match(page, /white-label-view\/jsx-runtime/);
    assert.doesNotMatch(`${manifest}${build}${style}${page}`, /bootstrap|\beta\b|handlebars|react-dom|from 'react'/i);
    assert.doesNotMatch(style, /@font-face|assets\/font/);
});
