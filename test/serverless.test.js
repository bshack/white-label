import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createProject} from '../dist/scaffold/index.js';

test('generated project includes the provider-neutral serverless example', async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-serverless-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const destination = path.join(temporary, 'site');
    await createProject({destination});

    const [handler, tsconfig, readme] = await Promise.all([
        readFile(path.join(destination, 'server/handler.ts'), 'utf8'),
        readFile(path.join(destination, 'tsconfig.json'), 'utf8'),
        readFile(path.join(destination, 'README.md'), 'utf8')
    ]);

    assert.match(handler, /handleRequest\(request: Request\): Promise<Response>/);
    assert.match(handler, /white-label-view\/server/);
    assert.match(handler, /white-label-view\/html/);
    assert.match(handler, /new Model/);
    assert.match(handler, /new Router/);
    assert.match(handler, /new Mediator/);
    assert.match(tsconfig, /server\/\*\*\/\*\.ts/);
    assert.match(readme, /Serverless \/ function runtimes/);
    assert.match(readme, /request-scoped/i);
});
