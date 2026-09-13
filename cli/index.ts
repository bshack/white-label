#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {createProject} from '../scaffold/index.js';

export interface CliDependencies {
    cwd?: () => string;
    createProject?: typeof createProject;
    stdout?: Pick<NodeJS.WriteStream, 'write'>;
    stderr?: Pick<NodeJS.WriteStream, 'write'>;
}

function usage() {
    return [
        'Usage:',
        '  white-label create <directory>',
        '',
        'Commands:',
        '  create <directory>  Create a White Label project.',
        '',
        'Options:',
        '  -h, --help          Show this help message.'
    ].join('\n');
}

export function formatCliError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export async function runCli(args: readonly string[], dependencies: CliDependencies = {}) {
    const cwd = dependencies.cwd ?? process.cwd;
    const scaffold = dependencies.createProject ?? createProject;
    const stdout = dependencies.stdout ?? process.stdout;
    const stderr = dependencies.stderr ?? process.stderr;
    const [command, destination, ...extra] = args;

    if (command === '--help' || command === '-h' || args.length === 0) {
        stdout.write(`${usage()}\n`);
        return 0;
    }

    if (command !== 'create' || !destination || extra.length) {
        stderr.write(`${usage()}\n`);
        return 1;
    }

    const resolvedDestination = path.resolve(cwd(), destination);
    await scaffold({destination: resolvedDestination});
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
