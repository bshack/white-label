import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import axe from 'axe-core';
import {HtmlValidate} from 'html-validate';
import {JSDOM} from 'jsdom';

const applicationMarkup = `<!doctype html><html><body><main></main><span data-reading-progress></span><div data-filter-status></div><nav><a href="/?era=all#alaska" data-era-filter="all" data-pushstate></a><a href="/?era=gateway#alaska" data-era-filter="gateway" data-pushstate></a></nav><article data-era="southeast"></article><article data-era="gateway"></article></body></html>`;

/** Install one JSDOM window as the browser globals consumed by the packages. */
function installBrowser(markup = applicationMarkup) {
    const dom = new JSDOM(markup, {url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'dangerously'});
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.DOMParser = dom.window.DOMParser;
    globalThis.Element = dom.window.Element;
    globalThis.Node = dom.window.Node;
    let nextFrame = 0;
    const frames = new Map();
    dom.window.requestAnimationFrame = callback => {const id = ++nextFrame; frames.set(id, callback); return id;};
    dom.window.cancelAnimationFrame = id => frames.delete(id);
    dom.flushFrames = () => {const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback();};
    dom.pendingFrames = () => frames.size;
    return dom;
}

const bootDom = installBrowser();
const {initializeGoldRushPage, normalizeEra} = await import('../dist/app/assets/script/index.js');

test('production output is valid, accessible static HTML', async () => {
    const html = await readFile('_deploy/index.html', 'utf8');
    const validator = new HtmlValidate({extends: ['html-validate:recommended']});
    const validation = await validator.validateString(html);
    assert.equal(validation.valid, true, validation.results.flatMap(result => result.messages).map(message => message.message).join('\n'));
    const dom = new JSDOM(html, {runScripts: 'dangerously', url: 'https://example.com/'});
    dom.window.eval(axe.source);
    const results = await dom.window.axe.run(dom.window.document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']}});
    assert.equal(results.violations.length, 0, results.violations.map(violation => violation.id).join(', '));
});

test('production output is crawlable and supplies complete SEO signals', async () => {
    const [html, robots, sitemap] = await Promise.all(['index.html', 'robots.txt', 'sitemap.xml'].map(file => readFile(`_deploy/${file}`, 'utf8')));
    const dom = new JSDOM(html);
    const root = dom.window.document;
    assert.equal(root.querySelector('link[rel="canonical"]').href, 'https://example.com/');
    assert.match(root.querySelector('meta[name="robots"]').content, /^index,follow/);
    assert.ok(root.querySelector('title').textContent.length > 20);
    assert.ok(root.querySelector('meta[name="description"]').content.length > 50);
    assert.equal(JSON.parse(root.querySelector('script[type="application/ld+json"]').textContent)['@type'], 'Article');
    assert.ok([...root.querySelectorAll('a')].every(link => link.hasAttribute('href')));
    assert.match(robots, /User-agent: \*\nAllow: \//);
    assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
    assert.match(sitemap, /<loc>https:\/\/example\.com\/<\/loc>/);
    assert.doesNotMatch(html, /service-endpoint|white-label-service|<%|{{/);
});

test('all client packages cooperate through a crawlable routed filter', () => {
    const dom = installBrowser();
    Object.defineProperty(dom.window.document.documentElement, 'scrollHeight', {value: 2000});
    Object.defineProperty(dom.window, 'innerHeight', {value: 1000});
    Object.defineProperty(dom.window, 'scrollY', {value: 250, writable: true});
    const application = initializeGoldRushPage(dom.window.document);
    assert.equal(application.collection.get().length, 2);
    assert.deepEqual(application.model.get(), {selected: 'all', visible: 2});
    assert.match(dom.window.document.querySelector('[data-filter-status]').textContent, /Showing 2 eras/);
    dom.window.document.querySelector('[data-era-filter="gateway"]').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    assert.deepEqual(application.model.get(), {selected: 'gateway', visible: 1});
    assert.equal(dom.window.document.querySelector('[data-era="southeast"]').hidden, true);
    assert.equal(dom.window.document.querySelector('[data-era-filter="gateway"]').getAttribute('aria-current'), 'page');
    application.mediator.emit('era:selected', 'unsupported');
    assert.deepEqual(application.model.get(), {selected: 'all', visible: 2});
    dom.window.dispatchEvent(new dom.window.Event('scroll'));
        dom.flushFrames();
    assert.equal(dom.window.document.querySelector('[data-reading-progress]').style.transform, 'scaleX(0.25)');
    dom.window.scrollY = -10;
    dom.window.dispatchEvent(new dom.window.Event('scroll'));
        dom.flushFrames();
    assert.equal(dom.window.document.querySelector('[data-reading-progress]').style.transform, 'scaleX(0)');
    dom.window.scrollY = 3000;
    dom.window.dispatchEvent(new dom.window.Event('scroll'));
        dom.flushFrames();
    assert.equal(dom.window.document.querySelector('[data-reading-progress]').style.transform, 'scaleX(1)');
    application.destroy();
    assert.equal(application.collection.get().length, 0);
    assert.equal(application.mediator.listenerCount('era:selected'), 0);
});

test('integration handles progress boundaries and optional output elements', () => {
    const dom = installBrowser('<!doctype html><html><body><main></main><span data-reading-progress></span></body></html>');
    const application = initializeGoldRushPage(dom.window.document);
    assert.equal(dom.window.document.querySelector('[data-reading-progress]').style.transform, 'scaleX(0)');
    application.destroy();
    const noProgress = installBrowser('<!doctype html><html><body><main></main></body></html>');
    initializeGoldRushPage(noProgress.window.document).destroy();
    assert.equal(normalizeEra(undefined), 'all');
    assert.equal(normalizeEra('gateway'), 'gateway');
    const detached = dom.window.document.implementation.createHTMLDocument('detached');
    assert.throws(() => initializeGoldRushPage(detached), /browser document/);
});

test.after(() => {
    bootDom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.DOMParser;
    delete globalThis.Element;
    delete globalThis.Node;
});

test('progress updates coalesce, react to resize and cancel during teardown', () => {
    const dom = installBrowser();
    const app = initializeGoldRushPage(dom.window.document);
    dom.window.dispatchEvent(new dom.window.Event('scroll'));
    dom.window.dispatchEvent(new dom.window.Event('scroll'));
    assert.equal(dom.pendingFrames(), 1);
    dom.flushFrames();
    assert.equal(dom.pendingFrames(), 0);
    dom.window.dispatchEvent(new dom.window.Event('resize'));
    assert.equal(dom.pendingFrames(), 1);
    app.destroy();
    assert.equal(dom.pendingFrames(), 0);
    dom.window.dispatchEvent(new dom.window.Event('scroll'));
    dom.window.dispatchEvent(new dom.window.Event('resize'));
    assert.equal(dom.pendingFrames(), 0);
    dom.window.close();
});
