import {html, unsafeHTML} from 'white-label-view/html';
import SiteFooter from './assets/view/layout/SiteFooter.js';
import SiteHeader from './assets/view/layout/SiteHeader.js';
import type {PageData} from './assets/view/page-data.js';
import GettingStartedSection from './assets/view/sections/GettingStartedSection.js';
import HeroSection from './assets/view/sections/HeroSection.js';
import LiveExampleSection from './assets/view/sections/LiveExampleSection.js';
import PackageDocsSection from './assets/view/sections/PackageDocsSection.js';
import SourceGuideSection from './assets/view/sections/SourceGuideSection.js';

function structuredDataScript(value: unknown) {
    const json = JSON.stringify(value).replaceAll('<', '\\u003c');
    return unsafeHTML(`<script type="application/ld+json">${json}</script>`);
}

/** Compose the static page from small tagged-template functions. */
export default function IndexPage(data: Record<string, unknown>) {
    const page = data as unknown as PageData;

    return html`
        <html id="index" lang="en-US" dir="ltr">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${page.title}</title>
                <meta name="description" content="${page.meta.description}">
                <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
                <link rel="canonical" href="${page.siteUrl}/">
                <meta property="og:title" content="${page.title}">
                <meta property="og:description" content="${page.meta.description}">
                <meta property="og:type" content="website">
                <meta property="og:url" content="${page.siteUrl}/">
                <link rel="stylesheet" href="${page.cdn}release/${page.version}/assets/style/global.css" media="all">
                <link rel="stylesheet" href="${page.cdn}release/${page.version}/assets/style/print.css" media="print">
                ${structuredDataScript(page.structuredData)}
            </head>
            <body itemscope itemtype="https://schema.org/WebPage">
                <a class="skip-link" href="#main">Skip to content</a>
                ${SiteHeader()}
                <main id="main" tabindex="-1">
                    ${HeroSection()}
                    ${LiveExampleSection()}
                    ${PackageDocsSection()}
                    ${SourceGuideSection()}
                    ${GettingStartedSection()}
                </main>
                ${SiteFooter()}
                <script src="${page.cdn}release/${page.version}/assets/script/index.compiled.js" defer></script>
            </body>
        </html>
    `;
}
