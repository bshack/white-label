import TaskExample from './assets/view/examples/tasks/TaskExample.js';
import {createInitialTaskState, describeTaskStatus} from './assets/view/examples/tasks/task-state.js';

interface PageData {
    cdn: string;
    meta: {description: string};
    siteUrl: string;
    structuredData: Record<string, unknown>;
    title: string;
    version: string;
}

function escapeHtml(value: unknown): string {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/** Render the generated starter using plain TypeScript and HTML strings. */
export default function IndexPage(data: Record<string, unknown>): string {
    const page = data as unknown as PageData;
    const taskState = createInitialTaskState();
    const taskExample = TaskExample({state: taskState});
    const taskStatus = describeTaskStatus(taskState);
    const structuredData = JSON.stringify(page.structuredData).replaceAll('<', '\\u003c');

    return `<html id="index" lang="en-US" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.meta.description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(page.siteUrl)}/">
<meta property="og:title" content="${escapeHtml(page.title)}">
<meta property="og:description" content="${escapeHtml(page.meta.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(page.siteUrl)}/">
<link rel="stylesheet" href="${escapeHtml(page.cdn)}release/${escapeHtml(page.version)}/assets/style/global.css" media="all">
<link rel="stylesheet" href="${escapeHtml(page.cdn)}release/${escapeHtml(page.version)}/assets/style/print.css" media="print">
<script type="application/ld+json">${structuredData}</script>
</head>
<body itemscope itemtype="https://schema.org/WebPage">
<a class="skip-link" href="#main">Skip to content</a>
<header><nav aria-label="Primary"><a href="/">White Label</a></nav></header>
<main id="main" tabindex="-1">
<section class="hero"><p class="eyebrow">White Label starter</p><h1>Composable web primitives without a framework lock-in.</h1><p>State, rendering, routing, and application events stay small, explicit, and independently understandable.</p></section>
<section id="example" data-task-example><h2>Interactive task example</h2>${taskExample}<p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-task-status>${escapeHtml(taskStatus)}</p></section>
<section><h2>Plain TypeScript templates</h2><p>This project was generated without JSX. Pages and views return HTML strings from ordinary TypeScript functions.</p></section>
</main>
<footer><p>Built with White Label.</p></footer>
<script src="${escapeHtml(page.cdn)}release/${escapeHtml(page.version)}/assets/script/index.compiled.js" defer></script>
</body>
</html>`;
}
