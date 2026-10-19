#!/usr/bin/env node

import {realpathSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
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
        '  create <directory>  Create a tagged-template White Label project.',
        '',
        'Options:',
        '  -h, --help         Show this help message.'
    ].join('\n');
}

function isHelpFlag(value: string | undefined) {
    return value === '--help' || value === '-h';
}

export function formatCliError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
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
    const [command, destination, ...options] = args;

    if (isHelpFlag(command) || args.length === 0 || (command === 'create' && isHelpFlag(destination) && !options.length)) {
        stdout.write(`${usage()}\n`);
        return 0;
    }

    // An option-like destination is almost always a mistyped flag; refuse it rather than create a directory named `--flag`.
    if (command !== 'create' || !destination || destination.startsWith('-') || options.length) {
        stderr.write(`${usage()}\n`);
        return 1;
    }

    const resolvedDestination = path.resolve(cwd(), destination);
    await assertDestinationAvailable(resolvedDestination);
    await scaffold({destination: resolvedDestination});
    stdout.write(`Created White Label project at ${resolvedDestination}\n`);
    return 0;
}

/** Run only as the entry script; importing the module (including from `node -e`, which has no script path) must not. */
function isEntryScript(invokedPath: string | undefined) {
    if (!invokedPath) {return false;}
    try {
        return realpathSync(path.resolve(invokedPath)) === realpathSync(fileURLToPath(import.meta.url));
    } catch {
        return false;
    }
}

if (isEntryScript(process.argv[1])) {
    runCli(process.argv.slice(2)).then(
        (exitCode) => {process.exitCode = exitCode;},
        (error: unknown) => {
            process.stderr.write(`Unable to create White Label project: ${formatCliError(error)}\n`);
            process.exitCode = 1;
        }
    );
}
