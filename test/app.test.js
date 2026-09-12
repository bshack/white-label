import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const markup = `<!doctype html><html><body><main></main><span data-reading-progress></span><div data-filter-status></div><nav><a href="/?era=all#alaska" data-era-filter="all" data-pushstate></a><a href="/?era=gateway#alaska" data-era-filter="gateway" data-pushstate></a></nav><article data-era="southeast"></article><article data-era="gateway"></article></body></html>`;
function install(markupValue = markup) {
    const dom = new JSDOM(markupValue, {url: 'https://example.com/', pretendToBeVisual: true});
    Object.assign(globalThis, {window: dom.window, document: dom.window.document, DOMParser: dom.window.DOMParser, Element: dom.window.Element, Node: dom.window.Node});
    let nextFrame = 0;
    const frames = new Map();
    dom.window.requestAnimationFrame = callback => {const id = ++nextFrame; frames.set(id, callback); return id;};
    dom.window.cancelAnimationFrame = id => frames.delete(id);
    dom.flushFrames = () => {const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback();};
    dom.pendingFrames = () => frames.size;
    return dom;
}
const boot = install();
const {initializeGoldRushPage, normalizeEra} = await import('../dist/app/assets/script/index.js');

test('generated example integrates model, view, mediator, router, and Eta', () => {
    const dom = install();
    Object.defineProperty(dom.window.document.documentElement, 'scrollHeight', {value: 2000});
    Object.defineProperty(dom.window, 'innerHeight', {value: 1000});
    Object.defineProperty(dom.window, 'scrollY', {value: 250, writable: true});
    const application = initializeGoldRushPage(dom.window.document);
    assert.equal(application.eraIndex.get().length, 2);
    dom.window.document.querySelector('[data-era-filter="gateway"]').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    assert.deepEqual(application.model.get(), {selected: 'gateway', visible: 1});
    application.mediator.emit('era:selected', 'unsupported');
    assert.deepEqual(application.model.get(), {selected: 'all', visible: 2});
    for (const scrollY of [-10, 3000]) {
        dom.window.scrollY = scrollY;
        dom.window.dispatchEvent(new dom.window.Event('scroll'));
        dom.flushFrames();
    }
    application.destroy();
    assert.equal(application.eraIndex.get().length, 0);
});

test('generated example covers optional and invalid environments', () => {
    const dom = install('<!doctype html><html><body><main></main><span data-reading-progress></span></body></html>');
    initializeGoldRushPage(dom.window.document).destroy();
    install('<!doctype html><html><body><main></main></body></html>');
    initializeGoldRushPage(document).destroy();
    assert.equal(normalizeEra(undefined), 'all');
    assert.equal(normalizeEra('gateway'), 'gateway');
    assert.throws(() => initializeGoldRushPage(dom.window.document.implementation.createHTMLDocument('detached')), /browser document/);
});

test.after(() => {
    boot.window.close();
    for (const key of ['window', 'document', 'DOMParser', 'Element', 'Node']) delete globalThis[key];
});

test('progress updates coalesce, react to resize and cancel during teardown', () => {
    const dom = install();
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
