import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import axe from 'axe-core';
import {build as buildBundle} from 'esbuild';
import {HtmlValidate} from 'html-validate';
import {JSDOM} from 'jsdom';

const applicationMarkup = `<!doctype html><html><body><main><div data-task-example><section data-task-app><form data-task-form><input name="task"></form><nav><a href="/?tasks=all#example" data-task-filter="all" data-pushstate aria-current="page"></a><a href="/?tasks=active#example" data-task-filter="active" data-pushstate aria-current="false"></a><a href="/?tasks=completed#example" data-task-filter="completed" data-pushstate aria-current="false"></a></nav><ul><li><input type="checkbox" data-task-toggle data-task-id="1"></li><li><input type="checkbox" data-task-toggle data-task-id="2"></li></ul></section><p data-task-status role="status" aria-live="polite" aria-atomic="true"></p></div></main></body></html>`;

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

async function withoutBrowserGlobals(callback) {
    const previous = {
        window: globalThis.window,
        document: globalThis.document,
        DOMParser: globalThis.DOMParser,
        Element: globalThis.Element,
        Node: globalThis.Node
    };
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.DOMParser;
    delete globalThis.Element;
    delete globalThis.Node;
    try {
        return await callback();
    } finally {
        Object.assign(globalThis, previous);
    }
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

async function assertAccessible(name, html) {
    const validator = new HtmlValidate({extends: ['html-validate:recommended']});
    const validation = await validator.validateString(html);
    assert.equal(validation.valid, true, `${name}: ${validation.results.flatMap(result => result.messages).map(message => message.message).join('\n')}`);
    const dom = new JSDOM(html, {runScripts: 'dangerously', url: 'https://example.com/'});
    dom.window.eval(axe.source);
    const results = await dom.window.axe.run(dom.window.document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']}});
    dom.window.close();
    assert.equal(results.violations.length, 0, `${name}: ${results.violations.map(violation => violation.id).join(', ')}`);
}

const bootDom = installBrowser();
const {initializeTaskApplication, normalizeTaskFilter} = await import('../dist/app/assets/script/index.js');

test('production output is valid, accessible static HTML', async () => {
    const [html, notFound] = await Promise.all(['index.html', '404.html'].map(file => readFile(`_deploy/${file}`, 'utf8')));
    await assertAccessible('index', html);
    await assertAccessible('404', notFound);

    const dom = new JSDOM(html);
    const root = dom.window.document;
    assert.equal(root.querySelector('.skip-link').getAttribute('href'), '#main');
    assert.equal(root.querySelector('main#main').getAttribute('tabindex'), '-1');
    assert.equal(root.querySelector('[data-task-status]').getAttribute('role'), 'status');
    assert.equal(root.querySelector('[data-task-status]').getAttribute('aria-live'), 'polite');
    assert.equal(root.querySelector('[data-task-status]').getAttribute('aria-atomic'), 'true');
    assert.equal(root.querySelector('[data-task-app] [data-task-status]'), null);
    assert.equal(root.querySelector('[data-task-filter][aria-current="page"]').dataset.taskFilter, 'all');
    assert.ok([...root.querySelectorAll('[data-task-filter]')].every(link => link instanceof dom.window.HTMLAnchorElement && link.hasAttribute('href')));
    assert.ok(root.querySelector('[data-task-form] label[for="task-title"]'));

    const codeBlocks = [...root.querySelectorAll('pre > code')];
    assert.ok(codeBlocks.length > 0);
    assert.ok(codeBlocks.every(code => code.firstChild === code.firstElementChild && code.lastChild === code.lastElementChild));
    dom.window.close();
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
    dom.window.close();
});

test('all client packages cooperate through the task application without losing focus', async () => {
    const dom = installBrowser();
    const application = initializeTaskApplication(dom.window.document);
    const input = dom.window.document.querySelector('[name="task"]');
    input.value = 'Verify generated app';
    dom.window.document.querySelector('[data-task-form]').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
    assert.equal(application.model.get().tasks.length, 3);
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
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 1 task/);
    assert.equal(dom.window.location.search, '?tasks=active');
    assert.equal(dom.window.document.activeElement.dataset.taskFilter, 'active');

    const completedFilter = dom.window.document.querySelector('[data-task-filter="completed"]');
    completedFilter.focus();
    completedFilter.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, button: 0}));
    await Promise.resolve();
    assert.equal(application.model.get().filter, 'completed');
    assert.match(dom.window.document.querySelector('[data-task-status]').textContent, /Showing 2 tasks/);
    assert.equal(dom.window.document.activeElement.dataset.taskFilter, 'completed');

    assert.equal(normalizeTaskFilter('nope'), 'all');
    application.destroy();
    assert.equal(application.mediator.listenerCount('task:add'), 0);
});

test('serverless handler keeps warm and concurrent requests isolated', async () => {
    await withoutBrowserGlobals(async () => {
        const {handleRequest} = await import('../dist/server/handler.js');
        const first = await handleRequest(new Request('https://example.com/hello?name=Ada'));
        const second = await handleRequest(new Request('https://example.com/hello?name=Grace'));
        assert.equal(first.status, 200);
        assert.equal(second.status, 200);
        assert.match(await first.text(), /Hello Ada\./);
        assert.match(await second.text(), /Hello Grace\./);

        const [alan, katherine] = await Promise.all([
            handleRequest(new Request('https://example.com/hello?name=Alan')),
            handleRequest(new Request('https://example.com/hello?name=Katherine'))
        ]);
        const [alanHtml, katherineHtml] = await Promise.all([alan.text(), katherine.text()]);
        assert.match(alanHtml, /Hello Alan\./);
        assert.doesNotMatch(alanHtml, /Katherine/);
        assert.match(katherineHtml, /Hello Katherine\./);
        assert.doesNotMatch(katherineHtml, /Alan/);

        const escaped = await handleRequest(new Request('https://example.com/hello?name=%3Cstrong%3EAda%3C%2Fstrong%3E'));
        assert.match(await escaped.text(), /Hello &lt;strong&gt;Ada&lt;\/strong&gt;\./);
        const missing = await handleRequest(new Request('https://example.com/missing'));
        assert.equal(missing.status, 404);
    });
});

test('serverless composition bundles for Web-standard runtimes within the size budget', async () => {
    const result = await buildBundle({
        stdin: {
            contents: `
                import Mediator from 'white-label-mediator';
                import {Model} from 'white-label-model';
                import Router from 'white-label-router';
                import View from 'white-label-view/server';
                const mediator = new Mediator();
                const model = new Model({ok: true});
                const router = new Router();
                const view = new View({model, template: data => '<p>' + String(data.ok) + '</p>'});
                router.mediator = mediator;
                export {mediator, model, router, view};
            `,
            loader: 'ts',
            resolveDir: process.cwd(),
            sourcefile: 'serverless-portability-smoke.ts'
        },
        bundle: true,
        format: 'esm',
        logLevel: 'silent',
        minify: true,
        platform: 'browser',
        target: 'es2022',
        treeShaking: true,
        write: false
    });
    const bundle = result.outputFiles[0].text;
    const bytes = Buffer.byteLength(bundle);
    assert.ok(bytes <= 100_000, `serverless runtime bundle grew to ${bytes} bytes (100000 byte budget)`);
    assert.doesNotMatch(bundle, /(?:from|require\()["']node:/);
});

test('fresh serverless handler import stays within the cold-start budget', () => {
    const script = "const start=performance.now(); await import('./dist/server/handler.js'); console.log(performance.now()-start);";
    const elapsed = Number(execFileSync(process.execPath, ['--input-type=module', '-e', script], {encoding: 'utf8'}).trim());
    assert.ok(Number.isFinite(elapsed));
    assert.ok(elapsed <= 750, `serverless handler import took ${elapsed.toFixed(1)}ms (750ms budget)`);
});

test('starter code syntax colors remain grayscale and meet AA contrast', async () => {
    const styles = await readFile('app/assets/style/global.css', 'utf8');
    const codeColors = [...styles.matchAll(/\.(?:code-block__number|code-syntax-(?:keyword|type|value|muted))\s*\{[^}]*color:\s*(#[0-9a-f]{6})/gi)]
        .map(match => match[1].toLowerCase());
    assert.equal(codeColors.length, 5);
    for (const color of codeColors) {
        assert.match(color, /^#([0-9a-f]{2})\1\1$/i);
        assert.ok(contrastRatio(color, '#f4f4f4') >= 4.5, `${color} must meet 4.5:1 against the code background`);
    }
});

test.after(() => {
    bootDom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.DOMParser;
    delete globalThis.Element;
    delete globalThis.Node;
});
