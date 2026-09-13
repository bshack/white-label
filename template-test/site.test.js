import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import axe from 'axe-core';
import {HtmlValidate} from 'html-validate';
import {JSDOM} from 'jsdom';

const applicationMarkup = `<!doctype html><html><body><main><div data-task-example><section data-task-app><form data-task-form><input name="task"></form><nav><a href="/?tasks=all#example" data-task-filter="all" data-pushstate></a><a href="/?tasks=active#example" data-task-filter="active" data-pushstate></a><a href="/?tasks=completed#example" data-task-filter="completed" data-pushstate></a></nav><p data-task-status></p><ul><li><input type="checkbox" data-task-toggle data-task-id="1"></li><li><input type="checkbox" data-task-toggle data-task-id="2"></li></ul></section></div></main></body></html>`;

/** Install one JSDOM window as the browser globals consumed by the packages. */
function installBrowser(markup = applicationMarkup) {
    const dom = new JSDOM(markup, {url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'dangerously'});
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.DOMParser = dom.window.DOMParser;
    globalThis.Element = dom.window.Element;
    globalThis.Node = dom.window.Node;
    return dom;
}

const bootDom = installBrowser();
const {initializeTaskApplication, normalizeTaskFilter} = await import('../dist/app/assets/script/index.js');

test('production output is valid, accessible static HTML', async () => {
    const html = await readFile('_deploy/index.html', 'utf8');
    const validator = new HtmlValidate({extends: ['html-validate:recommended']});
    const validation = await validator.validateString(html);
    assert.equal(validation.valid, true, validation.results.flatMap(result => result.messages).map(message => message.message).join('\n'));
    const dom = new JSDOM(html, {runScripts: 'dangerously', url: 'https://example.com/'});
    dom.window.eval(axe.source);
    const results = await dom.window.axe.run(dom.window.document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']}});
    assert.equal(results.violations.length, 0, results.violations.map(violation => violation.id).join(', '));

    const root = dom.window.document;
    assert.equal(root.querySelector('.skip-link').getAttribute('href'), '#main');
    assert.equal(root.querySelector('main#main').getAttribute('tabindex'), '-1');
    assert.equal(root.querySelector('[data-task-status]').getAttribute('aria-live'), 'polite');
    assert.equal(root.querySelector('[data-task-status]').getAttribute('aria-atomic'), 'true');
    assert.equal(root.querySelector('[data-task-filter][aria-current="page"]').dataset.taskFilter, 'all');
    assert.ok([...root.querySelectorAll('[data-task-filter]')].every(link => link instanceof dom.window.HTMLAnchorElement && link.hasAttribute('href')));
    assert.ok(root.querySelector('[data-task-form] label[for="task-title"]'));
});

test('production output is crawlable and supplies complete SEO signals', async () => {
    const [html, robots, sitemap] = await Promise.all(['index.html', 'robots.txt', 'sitemap.xml'].map(file => readFile(`_deploy/${file}`, 'utf8')));
    const dom = new JSDOM(html);
    const root = dom.window.document;
    assert.equal(root.querySelector('link[rel="canonical"]').href, 'https://example.com/');
    assert.match(root.querySelector('meta[name="robots"]').content, /^index,follow/);
    assert.ok(root.querySelector('title').textContent.length > 20);
    assert.ok(root.querySelector('meta[name="description"]').content.length > 50);
    assert.equal(JSON.parse(root.querySelector('script[type="application/ld+json"]').textContent)['@type'], 'WebPage');
    assert.ok([...root.querySelectorAll('a')].every(link => link.hasAttribute('href')));
    assert.match(robots, /User-agent: \*\nAllow: \//);
    assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
    assert.match(sitemap, /<loc>https:\/\/example\.com\/<\/loc>/);
    assert.doesNotMatch(html, /service-endpoint|white-label-service|<%|{{/);
});

test('all client packages cooperate through the task application', () => {
    const dom = installBrowser();
    const application = initializeTaskApplication(dom.window.document);
    const input = dom.window.document.querySelector('[name="task"]');
    input.value = 'Verify generated app';
    dom.window.document.querySelector('[data-task-form]').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
    assert.equal(application.model.get().tasks.length, 3);

    dom.window.document.querySelector('[data-task-id="2"]').dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    assert.equal(application.model.get().tasks[1].complete, true);

    dom.window.document.querySelector('[data-task-filter="active"]').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    assert.equal(application.model.get().filter, 'active');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 1 tasks/);
    assert.equal(dom.window.location.search, '?tasks=active');

    dom.window.document.querySelector('[data-task-filter="completed"]').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    assert.equal(application.model.get().filter, 'completed');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 2 tasks/);

    assert.equal(normalizeTaskFilter('nope'), 'all');
    application.destroy();
    assert.equal(application.mediator.listenerCount('task:add'), 0);
});

test.after(() => {
    bootDom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.DOMParser;
    delete globalThis.Element;
    delete globalThis.Node;
});
