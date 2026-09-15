import assert from 'node:assert/strict';
import test from 'node:test';
import {JSDOM} from 'jsdom';
import {initializeTaskApplication} from '../app/assets/script/tasks/TaskApplication.js';
import {normalizeTaskFilter} from '../app/assets/script/tasks/task-state.js';
import {install} from './helpers/dom.js';

const read = (path) => import('node:fs/promises').then(({readFile}) => readFile(new URL(`../${path}`, import.meta.url), 'utf8'));

test('landing page composes focused documentation views around a shared task example', async () => {
    const html = await read('app/index.tsx');
    assert.match(html, /app\/assets\/view\/sections\//);
    assert.match(html, /app\/assets\/view\/examples\/tasks\//);
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
    const css = await read('app/assets/style/global.css');
    assert.doesNotMatch(css, /#[0-9a-f]{6}\b/i);
    assert.match(css, /--color-code-text:\s*rgb\(\s*245\s+245\s+245\s*\)/);
});

test('build arguments retain explicit deployment values', async () => {
    const {parseBuildArguments} = await import('../scripts/build.js');
    const args = parseBuildArguments([
        '--version=release-1',
        '--www=/docs/',
        '--cdn=https://cdn.example.com/',
        '--production=true',
        '--site-url=https://www.example.com'
    ]);
    assert.deepEqual(args, {
        cdn: 'https://cdn.example.com/',
        production: true,
        siteUrl: 'https://www.example.com',
        version: 'release-1',
        www: '/docs/'
    });
});

test('build arguments reject path traversal and non-HTTPS production origins', async () => {
    const {parseBuildArguments} = await import('../scripts/build.js');
    assert.throws(() => parseBuildArguments(['--version=../escape']), /version/);
    assert.throws(() => parseBuildArguments(['--production=true', '--site-url=http://example.com']), /HTTPS/);
});

test('Tailwind executable selection supports Windows and POSIX package-manager bins', async () => {
    const {tailwindExecutable} = await import('../scripts/build.js');
    assert.equal(tailwindExecutable('/project', 'linux'), '/project/node_modules/.bin/tailwindcss');
    assert.equal(tailwindExecutable('C:\\project', 'win32'), 'C:\\project\\node_modules\\.bin\\tailwindcss.cmd');
});

test('starter uses Tailwind and White Label JSX without Bootstrap, Eta, React, Handlebars, or npm-only build commands', async () => {
    const packageJson = JSON.parse(await read('package.json'));
    const dependencies = {...packageJson.dependencies, ...packageJson.devDependencies};
    assert.equal(dependencies.bootstrap, undefined);
    assert.equal(dependencies.eta, undefined);
    assert.equal(dependencies.react, undefined);
    assert.equal(dependencies.handlebars, undefined);

    const tsconfig = JSON.parse(await read('tsconfig.site.json'));
    assert.equal(tsconfig.compilerOptions.jsx, 'react-jsx');
    assert.equal(tsconfig.compilerOptions.jsxImportSource, 'white-label-view');

    const css = await read('app/assets/style/global.css');
    assert.match(css, /@import ['"]tailwindcss['"]/);
    assert.doesNotMatch(css, /bootstrap/i);

    const readme = await read('app/README.md');
    assert.match(readme, /npm, Yarn, and pnpm are supported/);
    assert.match(readme, /yarn install/);
    assert.match(readme, /pnpm install/);
});
