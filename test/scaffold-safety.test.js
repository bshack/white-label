import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {cp, lstat, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createProject, createSiteManifest} from '../dist/scaffold/index.js';

async function injectManifestSymlink(destination, target) {
    const manifest = path.join(destination, 'package.json');
    for (let attempt = 0; attempt < 1000; attempt += 1) {
        try {
            await symlink(target, manifest);
            return true;
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                await new Promise(resolve => setImmediate(resolve));
                continue;
            }
            if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {return false;}
            throw error;
        }
    }
    throw new Error('Destination was not created while scaffolding');
}

test('programmatic project creation refuses a non-empty destination before copying', async t => {
    const destination = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-existing-'));
    t.after(() => rm(destination, {recursive: true, force: true}));
    await writeFile(path.join(destination, 'keep.txt'), 'existing work');
    let copies = 0;
    const fileSystem = {
        copy() {copies += 1;},
        writeJSON() {throw new Error('manifest should not be written');}
    };

    await assert.rejects(
        createProject({destination, fileSystem}),
        /Destination directory must be empty/
    );
    assert.equal(copies, 0);
});

test('programmatic project creation accepts an existing empty destination', async t => {
    const destination = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-empty-'));
    t.after(() => rm(destination, {recursive: true, force: true}));
    const copies = [];
    const manifests = [];
    const fileSystem = {
        copy(source, target) {copies.push(target);},
        writeJSON(target, value) {manifests.push({target, value});}
    };

    await createProject({destination, fileSystem});
    assert.ok(copies.length > 0);
    assert.ok(copies.every(target => path.dirname(target) === destination), 'scaffold copies must target the destination root');
    assert.ok(copies.includes(path.join(destination, 'app')));
    assert.ok(copies.includes(path.join(destination, 'test')));
    assert.deepEqual(manifests, [{target: path.join(destination, 'package.json'), value: createSiteManifest()}]);
});

test('native scaffolding refuses a manifest symlink injected after the destination check', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-race-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const destination = path.join(temporary, 'site');
    const external = path.join(temporary, 'external.json');
    await writeFile(external, 'preserve me');

    const creation = createProject({destination});
    assert.equal(await injectManifestSymlink(destination, external), true);
    await assert.rejects(creation, error => error instanceof Error && 'code' in error && error.code === 'EEXIST');

    assert.equal(await readFile(external, 'utf8'), 'preserve me');
    assert.equal((await lstat(path.join(destination, 'package.json'))).isSymbolicLink(), true);
    // Cleanup removes only what this call created, so the concurrently created entry and its directory remain.
    assert.deepEqual(await readdir(destination), ['package.json']);
});

test('programmatic project creation rejects empty and non-string destinations before copying', async () => {
    let calls = 0;
    const fileSystem = {
        copy() {calls += 1;},
        writeJSON() {calls += 1;}
    };

    for (const destination of ['', undefined, 42]) {
        await assert.rejects(
            createProject({destination, fileSystem}),
            /Destination must be a non-empty path/
        );
    }
    assert.equal(calls, 0);
});

/** A real file system whose operations can be made to fail, to exercise partial-creation cleanup. */
function failingFileSystem({failCopyOf, failManifest = false}) {
    return {
        async copy(source, destination) {
            await mkdir(path.dirname(destination), {recursive: true});
            await cp(source, destination, {recursive: true, force: false, errorOnExist: true});
            if (path.basename(destination) === failCopyOf) {throw new Error(`injected copy failure: ${failCopyOf}`);}
        },
        async writeJSON(destination, value) {
            if (failManifest) {throw new Error('injected manifest failure');}
            await writeFile(destination, JSON.stringify(value), {flag: 'wx'});
        }
    };
}

test('failed project creation removes the missing destination and parents it created', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-cleanup-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await writeFile(path.join(temporary, 'keep.txt'), 'sibling work');
    const destination = path.join(temporary, 'parent', 'site');

    await assert.rejects(
        createProject({destination, fileSystem: failingFileSystem({failManifest: true})}),
        /injected manifest failure/
    );
    assert.deepEqual(await readdir(temporary), ['keep.txt']);
    assert.equal(await readFile(path.join(temporary, 'keep.txt'), 'utf8'), 'sibling work');
});

test('failed project creation empties but keeps an existing empty destination, including partial copies', async t => {
    const destination = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-cleanup-empty-'));
    t.after(() => rm(destination, {recursive: true, force: true}));

    await assert.rejects(
        createProject({destination, fileSystem: failingFileSystem({failCopyOf: 'app'})}),
        /injected copy failure: app/
    );
    assert.deepEqual(await readdir(destination), []);
});

test('programmatic project creation propagates destination inspection failures without writing', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-blocked-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await writeFile(path.join(temporary, 'blocker'), 'not a directory');
    let calls = 0;
    const fileSystem = {
        copy() {calls += 1;},
        writeJSON() {calls += 1;}
    };

    await assert.rejects(
        createProject({destination: path.join(temporary, 'blocker', 'site'), fileSystem}),
        error => error instanceof Error && 'code' in error && error.code === 'ENOTDIR'
    );
    assert.equal(calls, 0);
    assert.deepEqual(await readdir(temporary), ['blocker']);
});
