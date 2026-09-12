import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {runCli} from '../dist/cli/index.js';

function captureStream() {
    let output = '';
    return {
        stream: {write(value) {output += String(value); return true;}},
        read: () => output
    };
}

test('CLI shows help without scaffolding', async () => {
    const stdout = captureStream();
    let called = false;
    const exitCode = await runCli([], {
        cwd: () => '/workspace',
        createSite: async () => {called = true;},
        stdout: stdout.stream,
        stderr: captureStream().stream
    });

    assert.equal(exitCode, 0);
    assert.equal(called, false);
    assert.match(stdout.read(), /white-label create <directory>/);
});

test('CLI accepts explicit help flags', async () => {
    for (const flag of ['--help', '-h']) {
        const stdout = captureStream();
        const exitCode = await runCli([flag], {
            cwd: () => '/workspace',
            createSite: async () => {},
            stdout: stdout.stream,
            stderr: captureStream().stream
        });
        assert.equal(exitCode, 0);
        assert.match(stdout.read(), /Commands:/);
    }
});

test('CLI rejects malformed create commands', async () => {
    for (const args of [['unknown'], ['create'], ['create', 'site', 'extra']]) {
        const stderr = captureStream();
        const exitCode = await runCli(args, {
            cwd: () => '/workspace',
            createSite: async () => {},
            stdout: captureStream().stream,
            stderr: stderr.stream
        });
        assert.equal(exitCode, 1);
        assert.match(stderr.read(), /Usage:/);
    }
});

test('CLI resolves the destination and delegates to the scaffold API', async () => {
    const stdout = captureStream();
    let received;
    const exitCode = await runCli(['create', 'sites/storefront'], {
        cwd: () => '/workspace',
        createSite: async (options) => {received = options;},
        stdout: stdout.stream,
        stderr: captureStream().stream
    });

    const destination = path.resolve('/workspace', 'sites/storefront');
    assert.equal(exitCode, 0);
    assert.deepEqual(received, {destination});
    assert.match(stdout.read(), new RegExp(`Created White Label site at ${destination}`));
});
