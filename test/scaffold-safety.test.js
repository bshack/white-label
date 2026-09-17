import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {lstat, mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createProject} from '../dist/scaffold/index.js';

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

test('programmatic project creation refuses a non-empty destination before copying', async () => {
    const destination = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-existing-'));
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

test('programmatic project creation accepts an existing empty destination', async () => {
    const destination = await mkdtemp(path.join(tmpdir(), 'white-label-scaffold-empty-'));
    let copies = 0;
    let manifests = 0;
    const fileSystem = {
        copy() {copies += 1;},
        writeJSON() {manifests += 1;}
    };

    await createProject({destination, fileSystem});
    assert.ok(copies > 0);
    assert.equal(manifests, 1);
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
