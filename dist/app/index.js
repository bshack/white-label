import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
import { raw } from 'white-label-view/jsx-runtime';
import SiteFooter from './assets/view/layout/SiteFooter.js';
import SiteHeader from './assets/view/layout/SiteHeader.js';
import GettingStartedSection from './assets/view/sections/GettingStartedSection.js';
import HeroSection from './assets/view/sections/HeroSection.js';
import LiveExampleSection from './assets/view/sections/LiveExampleSection.js';
import PackageDocsSection from './assets/view/sections/PackageDocsSection.js';
import SourceGuideSection from './assets/view/sections/SourceGuideSection.js';
/**
 * The page template is intentionally thin.
 *
 * Developers learning White Label can start here to see the complete page at
 * a glance, then follow each import into a focused example. Build-time data is
 * kept at this boundary while individual views stay reusable and easy to read.
 */
export default function IndexPage(data) {
    const page = data;
    const structuredData = JSON.stringify(page.structuredData).replaceAll('<', '\\u003c');
    return (_jsxs("html", { id: "index", lang: "en-US", dir: "ltr", children: [_jsxs("head", { children: [_jsx("meta", { charset: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), _jsx("title", { children: page.title }), _jsx("meta", { name: "description", content: page.meta.description }), _jsx("meta", { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" }), _jsx("link", { rel: "canonical", href: `${page.siteUrl}/` }), _jsx("meta", { property: "og:title", content: page.title }), _jsx("meta", { property: "og:description", content: page.meta.description }), _jsx("meta", { property: "og:type", content: "website" }), _jsx("meta", { property: "og:url", content: `${page.siteUrl}/` }), _jsx("link", { rel: "stylesheet", href: `${page.cdn}release/${page.version}/assets/style/global.css`, media: "all" }), _jsx("link", { rel: "stylesheet", href: `${page.cdn}release/${page.version}/assets/style/print.css`, media: "print" }), _jsx("script", { type: "application/ld+json", children: raw(structuredData) })] }), _jsxs("body", { itemscope: true, itemtype: "https://schema.org/WebPage", children: [_jsx("a", { className: "skip-link", href: "#main", children: "Skip to content" }), _jsx(SiteHeader, {}), _jsxs("main", { id: "main", tabindex: "-1", children: [_jsx(HeroSection, {}), _jsx(LiveExampleSection, {}), _jsx(PackageDocsSection, {}), _jsx(SourceGuideSection, {}), _jsx(GettingStartedSection, {})] }), _jsx(SiteFooter, {}), _jsx("script", { src: `${page.cdn}release/${page.version}/assets/script/index.compiled.js`, defer: true })] })] }));
}
//# sourceMappingURL=index.js.map