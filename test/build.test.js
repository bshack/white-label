import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import test from 'node:test';
import {parseArguments} from '../scripts/build.js';

test('build arguments retain explicit deployment values', function() {
    assert.deepEqual(parseArguments([
        '--www=https://www.example.test',
        '--cdn=https://cdn.example.test',
        '--service=https://service.example.test',
        '--version=release-1',
        '--production=true'
    ]), {
        cdn: 'https://cdn.example.test',
        production: true,
        service: 'https://service.example.test',
        version: 'release-1',
        www: 'https://www.example.test'
    });
});

test('build version rejects path traversal', function() {
    assert.throws(() => parseArguments(['--version=../../outside']), /Version/);
});

test('responsive demo images prefer modern formats while retaining a JPEG fallback', async function() {
    const template = await readFile('app/assets/markup/element/picture.hbs', 'utf8');
    assert.match(template, /type="image\/avif"/);
    assert.match(template, /type="image\/webp"/);

    const files = [
        'fallback.jpg',
        'fallback.avif',
        'fallback.webp',
        'large.avif',
        'large.webp',
        'small.avif',
        'small.webp'
    ];
    const sizes = await Promise.all(files.map(async (file) => (
        await stat(`app/assets/image/demo/${file}`)
    ).size));

    // The previous three-JPEG demo weighed 1,267,178 bytes. Keep the complete
    // AVIF/WebP/JPEG fallback set below that baseline so this remains a real
    // packaging improvement, not merely a format expansion.
    assert.ok(sizes.reduce((total, size) => total + size, 0) < 1267178);
});
