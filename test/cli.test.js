import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {formatCliError, runCli} from '../dist/cli/index.js';

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
        createProject: async () => {called = true;},
        stdout: stdout.stream,
        stderr: captureStream().stream
    });

    assert.equal(exitCode, 0);
    assert.equal(called, false);
    assert.match(stdout.read(), /white-label create <directory>/);
    assert.match(stdout.read(), /tagged-template White Label project/);
});

test('CLI accepts explicit help flags', async () => {
    for (const flag of ['--help', '-h']) {
        const stdout = captureStream();
        const exitCode = await runCli([flag], {
            cwd: () => '/workspace',
            createProject: async () => {},
            stdout: stdout.stream,
            stderr: captureStream().stream
        });
        assert.equal(exitCode, 0);
        assert.match(stdout.read(), /Commands:/);
    }
});

test('CLI rejects malformed create commands and removed renderer flags', async () => {
    for (const args of [['unknown'], ['create'], ['create', 'site', 'extra'], ['create', 'site', '--jsx'], ['create', 'site', '--no-jsx']]) {
        const stderr = captureStream();
        const exitCode = await runCli(args, {
            cwd: () => '/workspace',
            createProject: async () => {},
            stdout: captureStream().stream,
            stderr: stderr.stream
        });
        assert.equal(exitCode, 1);
        assert.match(stderr.read(), /Usage:/);
    }
});

test('CLI refuses an existing non-empty destination before scaffolding', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'white-label-cli-existing-'));
    await writeFile(path.join(directory, 'keep.txt'), 'existing work');
    let called = false;

    await assert.rejects(
        runCli(['create', directory], {
            cwd: () => process.cwd(),
            createProject: async () => {called = true;},
            stdout: captureStream().stream,
            stderr: captureStream().stream
        }),
        /Destination directory must be empty/
    );
    assert.equal(called, false);
});

test('CLI accepts an existing empty destination', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'white-label-cli-empty-'));
    let received;
    const exitCode = await runCli(['create', directory], {
        cwd: () => process.cwd(),
        createProject: async options => {received = options;},
        stdout: captureStream().stream,
        stderr: captureStream().stream
    });

    assert.equal(exitCode, 0);
    assert.deepEqual(received, {destination: directory});
});

test('CLI resolves a missing destination and creates the canonical scaffold', async () => {
    const stdout = captureStream();
    let received;
    const exitCode = await runCli(['create', 'sites/storefront'], {
        cwd: () => '/workspace',
        createProject: async options => {received = options;},
        stdout: stdout.stream,
        stderr: captureStream().stream
    });

    const destination = path.resolve('/workspace', 'sites/storefront');
    assert.equal(exitCode, 0);
    assert.deepEqual(received, {destination});
    assert.match(stdout.read(), new RegExp(`Created White Label project at ${destination}`));
});

test('CLI error formatting handles Error and non-Error values', () => {
    assert.equal(formatCliError(new Error('boom')), 'boom');
    assert.equal(formatCliError('boom'), 'boom');
});

test('compiled CLI executes its main success path', () => {
    const result = spawnSync(process.execPath, ['dist/cli/index.js', '--help'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /white-label create <directory>/);
});

test('compiled CLI executes when invoked through a symlink', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'white-label-cli-symlink-'));
    const executable = path.join(directory, 'white-label');
    await symlink(path.resolve('dist/cli/index.js'), executable);

    const result = spawnSync(process.execPath, [executable, '--help'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /white-label create <directory>/);
});

test('compiled CLI executes its main error path', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'white-label-cli-'));
    const blocker = path.join(directory, 'blocker');
    await writeFile(blocker, 'not a directory');

    const result = spawnSync(process.execPath, ['dist/cli/index.js', 'create', path.join(blocker, 'site')], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unable to create White Label project:/);
});
