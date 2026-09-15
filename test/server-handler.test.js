import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from '../dist/server/handler.js';

test('server handler renders the health route', async () => {
    const response = await handleRequest(new Request('https://example.com/health'));

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(await response.text(), '<!doctype html><main><h1>Healthy</h1><p>Serverless request handled.</p></main>');
});

test('server handler renders and escapes a named hello route', async () => {
    const response = await handleRequest(new Request('https://example.com/hello?name=%3CAda%20%26%20%22Grace%22%3E'));

    assert.equal(response.status, 200);
    assert.equal(await response.text(), '<!doctype html><main><h1>Hello</h1><p>Hello &lt;Ada &amp; &quot;Grace&quot;&gt;.</p></main>');
});

test('server handler uses the default hello name when none is supplied', async () => {
    const response = await handleRequest(new Request('https://example.com/hello'));

    assert.equal(response.status, 200);
    assert.match(await response.text(), /Hello world\./);
});

test('server handler preserves the not-found state for unmatched routes', async () => {
    const response = await handleRequest(new Request('https://example.com/missing'));

    assert.equal(response.status, 404);
    assert.equal(await response.text(), '<!doctype html><main><h1>Not found</h1><p>No route for /missing.</p></main>');
});
