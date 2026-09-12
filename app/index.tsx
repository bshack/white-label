import {raw} from 'white-label-view/jsx-runtime';

interface PageData {
    cdn: string;
    meta: {description: string};
    siteUrl: string;
    structuredData: unknown;
    title: string;
    version: string;
}

export default function IndexPage(data: Record<string, unknown>) {
    const page = data as unknown as PageData;
    const structuredData = JSON.stringify(page.structuredData).replaceAll('<', '\\u003c');

    return (
        <html id="index" lang="en-US" dir="ltr">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{page.title}</title>
                <meta name="description" content={page.meta.description} />
                <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
                <link rel="canonical" href={`${page.siteUrl}/`} />
                <meta property="og:title" content={page.title} />
                <meta property="og:description" content={page.meta.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${page.siteUrl}/`} />
                <link rel="stylesheet" href={`${page.cdn}release/${page.version}/assets/style/global.css`} media="all" />
                <link rel="stylesheet" href={`${page.cdn}release/${page.version}/assets/style/print.css`} media="print" />
                <script type="application/ld+json">{raw(structuredData)}</script>
            </head>
            <body itemscope itemtype="https://schema.org/WebPage">
                <a className="skip-link" href="#main">Skip to the content</a>
                <div className="reading-progress" aria-hidden="true"><span data-reading-progress /></div>
                <header className="site-header">
                    <div className="container site-header__inner">
                        <a className="wordmark" href="#top" aria-label="White Label, home">White Label</a>
                        <nav aria-label="Primary navigation">
                            <a href="#approach">Approach</a>
                            <a href="#features">Features</a>
                            <a href="#stack">Stack</a>
                        </nav>
                    </div>
                </header>
                <main id="main" tabindex="-1">
                    <section className="hero" id="top">
                        <div className="container hero__grid">
                            <div>
                                <p className="eyebrow">TypeScript · static-first · progressively enhanced</p>
                                <h1>A production-minded starter without a framework lock-in.</h1>
                                <p className="hero__lede">White Label generates accessible, crawlable HTML and demonstrates the model, view, mediator, router, JSX runtime, Tailwind, and build tooling working together.</p>
                                <a className="button-primary" href="#features">Explore the stack</a>
                            </div>
                            <aside className="hero__fact" aria-label="At a glance">
                                <span className="hero__number">1 stack</span>
                                <p>for static rendering, typed client behavior, routing, state, and reusable UI primitives.</p>
                                <div className="route" aria-hidden="true"><span>Scaffold</span><i></i><span>Render</span><i></i><span>Enhance</span><i></i><span>Deploy</span></div>
                            </aside>
                        </div>
                    </section>

                    <section className="section" id="approach">
                        <div className="container article-grid">
                            <div className="section-label">01 · Approach</div>
                            <article>
                                <p className="eyebrow">Useful HTML first</p>
                                <h2>Start with a site that works before JavaScript runs.</h2>
                                <p className="standfirst">Pages are rendered to static HTML during the build. Client code enhances navigation and interaction instead of owning the initial document.</p>
                                <p>The starter is intentionally substantial enough to exercise the complete White Label stack while remaining generic enough to replace with real product content. It uses the same public package APIs an application would use, so the example doubles as integration coverage.</p>
                            </article>
                        </div>
                    </section>

                    <section className="section section--dark" id="features">
                        <div className="container">
                            <div className="section-heading">
                                <div><span className="section-label">02 · Features</span><h2>Filter the capabilities in the starter.</h2></div>
                                <p>The links remain crawlable; JavaScript progressively enhances them with routed filtering and live status updates.</p>
                            </div>
                            <nav className="era-controls" aria-label="Filter White Label features">
                                <a href="/?feature=all#features" data-feature-filter="all" data-pushstate aria-current="page">All features</a>
                                <a href="/?feature=core#features" data-feature-filter="core" data-pushstate>Core</a>
                                <a href="/?feature=runtime#features" data-feature-filter="runtime" data-pushstate>Runtime</a>
                                <a href="/?feature=tooling#features" data-feature-filter="tooling" data-pushstate>Tooling</a>
                            </nav>
                            <div className="visually-hidden" aria-live="polite" aria-atomic="true" data-filter-status><p>Showing all features.</p></div>
                            <div className="timeline" data-feature-list>
                                <article className="timeline-card" data-feature="core">
                                    <div className="timeline-card__date">Model</div>
                                    <div><p className="eyebrow">Observable state</p><h3>Keep application state small and explicit.</h3><p>The model package provides observable state for plain objects, arrays, and Maps without requiring an application framework.</p></div>
                                </article>
                                <article className="timeline-card" data-feature="core">
                                    <div className="timeline-card__date">View</div>
                                    <div><p className="eyebrow">JSX rendering</p><h3>Render escaped JSX without React.</h3><p>The view package owns DOM lifecycle and the White Label JSX runtime supports both build-time pages and model-driven client rendering.</p></div>
                                </article>
                                <article className="timeline-card" data-feature="runtime">
                                    <div className="timeline-card__date">Router</div>
                                    <div><p className="eyebrow">Progressive navigation</p><h3>Enhance normal links with History API routing.</h3><p>The router reads crawlable URLs first, then adds client-side navigation while preserving a conventional document model.</p></div>
                                </article>
                                <article className="timeline-card" data-feature="runtime">
                                    <div className="timeline-card__date">Mediator</div>
                                    <div><p className="eyebrow">Decoupled events</p><h3>Coordinate packages without hard wiring them together.</h3><p>The mediator supplies a small EventEmitter-compatible bus that works in browser and server-side JavaScript environments.</p></div>
                                </article>
                                <article className="timeline-card" data-feature="tooling">
                                    <div className="timeline-card__date">Build</div>
                                    <div><p className="eyebrow">Static delivery</p><h3>Compile TypeScript, Tailwind, scripts, SEO files, and pages together.</h3><p>The generator produces a deployable static site with canonical URLs, robots and sitemap output, accessibility-oriented tests, and no browser-side template compiler.</p></div>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section className="section" id="stack">
                        <div className="container article-grid">
                            <div className="section-label">03 · Stack</div>
                            <article>
                                <h2>Small packages, one coherent example.</h2>
                                <div className="impact-grid">
                                    <section><h3>Typed</h3><p>TypeScript sources and generated declarations make package contracts reviewable by editors, tests, and consumers.</p></section>
                                    <section><h3>Accessible</h3><p>Static content, semantic landmarks, keyboard-friendly links, live status updates, and automated WCAG-oriented checks are part of the starter.</p></section>
                                    <section><h3>Portable</h3><p>The packages avoid tying application code to Express, React, or another server or UI framework.</p></section>
                                    <section><h3>Replaceable</h3><p>The example content is intentionally generic. Replace it while retaining the tested architecture, build path, and package integrations.</p></section>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>
                <footer className="site-footer"><div className="container"><p>White Label is a modular TypeScript web stack and starter generator.</p><a href="#top">Back to top ↑</a></div></footer>
                <script src={`${page.cdn}release/${page.version}/assets/script/index.compiled.js`} defer />
            </body>
        </html>
    );
}
