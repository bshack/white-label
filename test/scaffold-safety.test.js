import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createProject} from '../dist/scaffold/index.js';

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
