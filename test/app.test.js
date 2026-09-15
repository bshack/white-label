import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

const markup = `<!doctype html><html><body><main><div data-task-example><section data-task-app><form data-task-form><input name="task"></form><nav><a href="/?tasks=all#example" data-task-filter="all" data-pushstate aria-current="page"></a><a href="/?tasks=active#example" data-task-filter="active" data-pushstate aria-current="false"></a><a href="/?tasks=completed#example" data-task-filter="completed" data-pushstate aria-current="false"></a></nav><ul><li><input type="checkbox" data-task-toggle data-task-id="1"></li><li><input type="checkbox" data-task-toggle data-task-id="2"></li></ul></section><p data-task-status role="status" aria-live="polite" aria-atomic="true"></p></div></main></body></html>`;

function install(markupValue = markup, url = 'https://example.com/') {
    const dom = new JSDOM(markupValue, {url, pretendToBeVisual: true});
    Object.assign(globalThis, {window: dom.window, document: dom.window.document, DOMParser: dom.window.DOMParser, Element: dom.window.Element, Node: dom.window.Node});
    return dom;
}

function relativeLuminance(hex) {
    const channels = hex.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16) / 255);
    const [red, green, blue] = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * red + .7152 * green + .0722 * blue;
}

function contrastRatio(foreground, background) {
    const first = relativeLuminance(foreground);
    const second = relativeLuminance(background);
    return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
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
    assert.match(html, /data-task-status/);
});

test('task example integrates model, view, mediator, router, and JSX without losing focus', async () => {
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
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 3 tasks for the all filter/);

    const toggle = dom.window.document.querySelector('[data-task-id="2"]');
    toggle.focus();
    toggle.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    assert.equal(application.model.get().tasks[1].complete, true);
    assert.equal(dom.window.document.activeElement.dataset.taskId, '2');

    const activeFilter = dom.window.document.querySelector('[data-task-filter="active"]');
    activeFilter.focus();
    activeFilter.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    await Promise.resolve();
    assert.equal(application.model.get().filter, 'active');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 1 task for the active filter/);
    assert.equal(dom.window.location.search, '?tasks=active');
    assert.equal(dom.window.document.activeElement.dataset.taskFilter, 'active');

    const disappearingToggle = dom.window.document.querySelector('[data-task-toggle]');
    disappearingToggle.focus();
    disappearingToggle.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 0 tasks for the active filter/);
    assert.equal(dom.window.document.activeElement.dataset.taskFilter, 'active');

    const completedFilter = dom.window.document.querySelector('[data-task-filter="completed"]');
    completedFilter.focus();
    completedFilter.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    await Promise.resolve();
    assert.equal(application.model.get().filter, 'completed');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 3 tasks for the completed filter/);
    assert.equal(dom.window.document.activeElement.dataset.taskFilter, 'completed');

    application.destroy();
    assert.deepEqual(application.model.get(), {});
    application.mediator.dispatchEvent(new CustomEvent('task:add', {detail: 'Ignored after destroy'}));
    assert.deepEqual(application.model.get(), {});
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

test('landing page source styles keep branding grayscale and code text at AA contrast', async () => {
    const styles = await Promise.all(['app/assets/style/global.css', 'app/assets/style/print.css'].map(path => readFile(path, 'utf8')));
    const normalize = value => value.length === 4 ? `#${[...value.slice(1)].map(character => character.repeat(2)).join('')}` : value;
    const colors = new Set(styles.flatMap(style => style.match(/#[0-9a-f]{3,6}\b/gi) ?? []).map(value => normalize(value.toLowerCase())));
    assert.deepEqual([...colors].sort(), [
        '#000000', '#242424', '#5f5f5f', '#626262', '#666666', '#6b6b6b',
        '#767676', '#cecece', '#f4f4f4', '#ffffff'
    ]);

    const codeColors = [...styles[0].matchAll(/\.(?:code-block__number|code-syntax-(?:keyword|type|value|muted))\s*\{[^}]*color:\s*(#[0-9a-f]{6})/gi)]
        .map(match => match[1].toLowerCase());
    assert.equal(codeColors.length, 5);
    for (const color of codeColors) {
        assert.ok(contrastRatio(color, '#f4f4f4') >= 4.5, `${color} must meet 4.5:1 against the code background`);
    }
});

test.after(() => {
    boot.window.close();
    for (const key of ['window', 'document', 'DOMParser', 'Element', 'Node']) delete globalThis[key];
});
