import assert from 'node:assert/strict';
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
