#!/usr/bin/env node

/**
 * The `white-label` / `generator-white-label` command. It parses arguments and calls `createProject()`; it has no
 * generation logic of its own.
 *
 * @module cli
 */
import {realpathSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {createProject} from '../scaffold/index.js';

/** Replaceable process dependencies for {@link runCli}, so tests can run it without touching the real process. */
export interface CliDependencies {
    /** Directory that relative destinations resolve against. Defaults to `process.cwd`. */
    cwd?: () => string;
    /** Project creator to call. Defaults to the real `createProject()`. */
    createProject?: typeof createProject;
    /** Where help and success messages go. Defaults to `process.stdout`. */
    stdout?: Pick<NodeJS.WriteStream, 'write'>;
    /** Where usage errors go. Defaults to `process.stderr`. */
    stderr?: Pick<NodeJS.WriteStream, 'write'>;
}

/** The help text. CI greps for its first usage line, so keep `white-label create <directory>` intact. */
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

/** Turn a thrown value into a one-line message: an Error's message, or the value converted to a string. */
export function formatCliError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

/**
 * Fail early, before calling the creator, if the destination is a non-empty directory. `createProject()` enforces the
 * same rule; checking here as well protects a custom `createProject` passed in through {@link CliDependencies}.
 */
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

/**
 * Run the CLI with the given arguments (without the `node` and script paths).
 *
 * Supported forms: no arguments, `--help`/`-h`, or `create --help` print help to stdout; `create <directory>` creates
 * a project. Anything else, including extra arguments or a destination starting with `-`, prints help to stderr.
 *
 * @returns The process exit code: 0 for help or success, 1 for a usage error.
 * @throws If the destination is not empty or project creation fails. The entry-point wrapper below prints the message
 *     and exits with code 1.
 */
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

    // A destination starting with `-` is almost always a mistyped flag. Refuse it rather than create a directory called
    // `--flag`; users who really want that name can pass `./-name`.
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

/**
 * True when this file is the script Node was started with, following symlinks such as `node_modules/.bin/white-label`.
 * Importing the module, including from `node -e` (which has no script path), must not run the CLI.
 */
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
