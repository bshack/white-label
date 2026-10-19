import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {lstat, mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
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
});
