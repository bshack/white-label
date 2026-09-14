#!/usr/bin/env node

import {readdir} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {createInterface} from 'node:readline/promises';
import {fileURLToPath} from 'node:url';
import {createProject} from '../scaffold/index.js';

export interface CliDependencies {
    cwd?: () => string;
    createProject?: typeof createProject;
    stdout?: Pick<NodeJS.WriteStream, 'write'>;
    stderr?: Pick<NodeJS.WriteStream, 'write'>;
    input?: NodeJS.ReadableStream;
    output?: NodeJS.WritableStream;
    isInteractive?: boolean;
}

function usage() {
    return [
        'Usage:',
        '  white-label create <directory> [--jsx | --no-jsx]',
        '',
        'Commands:',
        '  create <directory>  Create a White Label project.',
        '',
        'Options:',
        '  --jsx              Generate TypeScript with JSX/TSX templates.',
        '  --no-jsx           Generate plain TypeScript with HTML string templates.',
        '  -h, --help         Show this help message.'
    ].join('\n');
}

export function formatCliError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

async function askForJsx(input: NodeJS.ReadableStream, output: NodeJS.WritableStream): Promise<boolean> {
    const readline = createInterface({input, output});
    try {
        const answer = await readline.question(
            'Use JSX/TSX for page and view templates? Choose Yes for JSX syntax like <section>...</section>, or No for plain TypeScript that returns HTML strings. (Y/n) '
        );
        return !/^n(?:o)?$/i.test(answer.trim());
    } finally {
        readline.close();
    }
}

/** Reject an existing non-empty target so a mistyped CLI destination cannot overwrite project files. */
async function assertDestinationAvailable(destination: string) {
    try {
        const entries = await readdir(destination);
        if (entries.length) {
            throw new Error(`Destination directory must be empty: ${destination}`);
        }
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {return;}
        throw error;
    }
}

export async function runCli(args: readonly string[], dependencies: CliDependencies = {}) {
    const cwd = dependencies.cwd ?? process.cwd;
    const scaffold = dependencies.createProject ?? createProject;
    const stdout = dependencies.stdout ?? process.stdout;
    const stderr = dependencies.stderr ?? process.stderr;
    const input = dependencies.input ?? process.stdin;
    const output = dependencies.output ?? process.stdout;
    const [command, destination, ...options] = args;

    if (command === '--help' || command === '-h' || args.length === 0) {
        stdout.write(`${usage()}\n`);
        return 0;
    }

    const allowedOptions = new Set(['--jsx', '--no-jsx']);
    if (
        command !== 'create' ||
        !destination ||
        options.some(option => !allowedOptions.has(option)) ||
        (options.includes('--jsx') && options.includes('--no-jsx'))
    ) {
        stderr.write(`${usage()}\n`);
        return 1;
    }

    let jsx: boolean;
    if (options.includes('--jsx')) {
        jsx = true;
    } else if (options.includes('--no-jsx')) {
        jsx = false;
    } else if (dependencies.isInteractive ?? Boolean(process.stdin.isTTY && process.stdout.isTTY)) {
        jsx = await askForJsx(input, output);
    } else {
        jsx = true;
    }

    const resolvedDestination = path.resolve(cwd(), destination);
    await assertDestinationAvailable(resolvedDestination);
    await scaffold({destination: resolvedDestination, jsx});
    stdout.write(`Created White Label project at ${resolvedDestination}\n`);
    return 0;
}

const invokedPath = path.resolve(process.argv[1] as string);
const modulePath = fileURLToPath(import.meta.url);
if (invokedPath === modulePath) {
    runCli(process.argv.slice(2)).then(
        (exitCode) => {process.exitCode = exitCode;},
        (error: unknown) => {
            process.stderr.write(`Unable to create White Label project: ${formatCliError(error)}\n`);
            process.exitCode = 1;
        }
    );
}