import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {PassThrough} from 'node:stream';
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

test('CLI rejects malformed create commands', async () => {
    for (const args of [['unknown'], ['create'], ['create', 'site', 'extra'], ['create', 'site', '--jsx', '--no-jsx']]) {
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

test('CLI resolves the destination and defaults to JSX when non-interactive', async () => {
    const stdout = captureStream();
    let received;
    const exitCode = await runCli(['create', 'sites/storefront'], {
        cwd: () => '/workspace',
        createProject: async (options) => {received = options;},
        isInteractive: false,
        stdout: stdout.stream,
        stderr: captureStream().stream
    });

    const destination = path.resolve('/workspace', 'sites/storefront');
    assert.equal(exitCode, 0);
    assert.deepEqual(received, {destination, jsx: true});
    assert.match(stdout.read(), new RegExp(`Created White Label project at ${destination}`));
});

test('CLI detects non-interactive streams when no override is provided', async () => {
    let received;
    const exitCode = await runCli(['create', 'site'], {
        cwd: () => '/workspace',
        createProject: async (options) => {received = options;},
        stdout: captureStream().stream,
        stderr: captureStream().stream
    });

    assert.equal(exitCode, 0);
    assert.deepEqual(received, {destination: path.resolve('/workspace', 'site'), jsx: true});
});

test('CLI detects interactive TTY streams when no override is provided', async () => {
    const stdinDescriptor = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
    const stdoutDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    const input = new PassThrough();
    const output = new PassThrough();
    let received;

    try {
        Object.defineProperty(process.stdin, 'isTTY', {configurable: true, value: true});
        Object.defineProperty(process.stdout, 'isTTY', {configurable: true, value: true});
        input.end('no\n');

        const exitCode = await runCli(['create', 'site'], {
            cwd: () => '/workspace',
            createProject: async (options) => {received = options;},
            input,
            output,
            stdout: captureStream().stream,
            stderr: captureStream().stream
        });

        assert.equal(exitCode, 0);
        assert.deepEqual(received, {destination: path.resolve('/workspace', 'site'), jsx: false});
    } finally {
        if (stdinDescriptor) Object.defineProperty(process.stdin, 'isTTY', stdinDescriptor);
        else delete process.stdin.isTTY;
        if (stdoutDescriptor) Object.defineProperty(process.stdout, 'isTTY', stdoutDescriptor);
        else delete process.stdout.isTTY;
    }
});

test('CLI supports explicit JSX and non-JSX generation', async () => {
    for (const [flag, jsx] of [['--jsx', true], ['--no-jsx', false]]) {
        let received;
        const exitCode = await runCli(['create', 'site', flag], {
            cwd: () => '/workspace',
            createProject: async (options) => {received = options;},
            isInteractive: false,
            stdout: captureStream().stream,
            stderr: captureStream().stream
        });
        assert.equal(exitCode, 0);
        assert.deepEqual(received, {destination: path.resolve('/workspace', 'site'), jsx});
    }
});

test('CLI asks an understandable interactive JSX question and honors yes/no answers', async () => {
    for (const [answer, jsx] of [['\n', true], ['yes\n', true], ['n\n', false], ['No\n', false]]) {
        const input = new PassThrough();
        const output = new PassThrough();
        let prompt = '';
        output.on('data', chunk => {prompt += chunk.toString();});
        let received;
        input.end(answer);
        const exitCode = await runCli(['create', 'site'], {
            cwd: () => '/workspace',
            createProject: async options => {received = options;},
            isInteractive: true,
            input,
            output,
            stdout: captureStream().stream,
            stderr: captureStream().stream
        });
        assert.equal(exitCode, 0);
        assert.deepEqual(received, {destination: path.resolve('/workspace', 'site'), jsx});
        assert.match(prompt, /Use JSX\/TSX for page and view templates\?/);
        assert.match(prompt, /plain TypeScript that returns HTML strings/);
    }
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
