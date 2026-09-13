import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

const markup = `<!doctype html><html><body><main><div data-task-example><section data-task-app><form data-task-form><input name="task"></form><nav><a href="/?tasks=all#example" data-task-filter="all" data-pushstate></a><a href="/?tasks=active#example" data-task-filter="active" data-pushstate></a><a href="/?tasks=completed#example" data-task-filter="completed" data-pushstate></a></nav><p data-task-status></p><ul><li><input type="checkbox" data-task-toggle data-task-id="1"></li><li><input type="checkbox" data-task-toggle data-task-id="2"></li></ul></section></div></main></body></html>`;

function install(markupValue = markup, url = 'https://example.com/') {
    const dom = new JSDOM(markupValue, {url, pretendToBeVisual: true});
    Object.assign(globalThis, {window: dom.window, document: dom.window.document, DOMParser: dom.window.DOMParser, Element: dom.window.Element, Node: dom.window.Node});
    return dom;
}

const boot = install();
const {initializeTaskApplication, normalizeTaskFilter} = await import('../dist/app/assets/script/index.js');
const {default: renderIndexPage} = await import('../dist/app/index.js');

test('landing page composes focused documentation views around a shared task example', () => {
    const html = String(renderIndexPage({
        cdn: '/',
        meta: {description: 'A sufficiently descriptive White Label landing page description for the generated site.'},
        siteUrl: 'https://example.com',
        structuredData: {'@type': 'WebPage'},
        title: 'White Label Generator Documentation',
        version: 'test'
    }));
    assert.match(html, /Four packages\. One small application\./);
    assert.match(html, /app\/assets\/script\/tasks\//);
    assert.match(html, /Read the source/);
    assert.match(html, /data-task-example/);
});

test('task example integrates model, view, mediator, router, and JSX', () => {
    const dom = install();
    const application = initializeTaskApplication(dom.window.document);
    assert.equal(application.model.get().tasks.length, 2);
    assert.equal(application.model.get().filter, 'all');

    const input = dom.window.document.querySelector('[name="task"]');
    input.value = 'Ship the example';
    dom.window.document.querySelector('[data-task-form]').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
    assert.equal(application.model.get().tasks.length, 3);
    assert.equal(application.model.get().tasks[2].title, 'Ship the example');
    assert.equal(dom.window.document.activeElement.getAttribute('name'), 'task');

    dom.window.document.querySelector('[data-task-id="2"]').dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    assert.equal(application.model.get().tasks[1].complete, true);

    dom.window.document.querySelector('[data-task-filter="active"]').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    assert.equal(application.model.get().filter, 'active');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 1 tasks for the active filter/);
    assert.equal(dom.window.location.search, '?tasks=active');

    dom.window.document.querySelector('[data-task-filter="completed"]').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    assert.equal(application.model.get().filter, 'completed');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 2 tasks for the completed filter/);

    application.destroy();
    assert.equal(application.mediator.listenerCount('task:add'), 0);
});

test('task modules reject invalid domain and markup input cleanly', () => {
    const dom = install();
    const application = initializeTaskApplication(dom.window.document);
    assert.equal(application.model.add('   '), false);
    assert.equal(application.model.toggle(999), false);
    assert.equal(normalizeTaskFilter(undefined), 'all');
    assert.equal(normalizeTaskFilter('unsupported'), 'all');
    assert.equal(normalizeTaskFilter('active'), 'active');
    application.destroy();

    const noApplication = install('<!doctype html><html><body><main></main></body></html>');
    assert.throws(() => initializeTaskApplication(noApplication.window.document), /data-task-example/);
    const noViewRoot = install('<!doctype html><html><body><main><div data-task-example></div></main></body></html>');
    assert.throws(() => initializeTaskApplication(noViewRoot.window.document), /static task-app root/);
});

test('landing page source styles use only white, black, and accessible grey', async () => {
    const styles = await Promise.all(['app/assets/style/global.css', 'app/assets/style/print.css'].map(path => readFile(path, 'utf8')));
    const normalize = value => value.length === 4 ? `#${[...value.slice(1)].map(character => character.repeat(2)).join('')}` : value;
    const colors = new Set(styles.flatMap(style => style.match(/#[0-9a-f]{3,6}\b/gi) ?? []).map(value => normalize(value.toLowerCase())));
    assert.deepEqual([...colors].sort(), ['#000000', '#767676', '#ffffff']);
});

test.after(() => {
    boot.window.close();
    for (const key of ['window', 'document', 'DOMParser', 'Element', 'Node']) delete globalThis[key];
});
