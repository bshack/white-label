import {raw} from 'white-label-view/jsx-runtime';

interface PageData {
    cdn: string;
    meta: {description: string};
    siteUrl: string;
    structuredData: unknown;
    title: string;
    version: string;
}

const repositories = {
    mediator: 'https://github.com/bshack/white-label-mediator',
    model: 'https://github.com/bshack/white-label-model',
    router: 'https://github.com/bshack/white-label-router',
    view: 'https://github.com/bshack/white-label-view'
};

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
                <a className="skip-link" href="#main">Skip to content</a>
                <header className="site-header">
                    <div className="container site-header__inner">
                        <a className="wordmark" href="#top" aria-label="White Label home">White Label</a>
                        <nav aria-label="Primary navigation">
                            <a href="#example">Example</a>
                            <a href="#packages">Packages</a>
                            <a href="#start">Get started</a>
                            <a href="https://github.com/bshack/white-label">GitHub</a>
                        </nav>
                    </div>
                </header>

                <main id="main" tabindex="-1">
                    <section className="hero" id="top" aria-labelledby="hero-title">
                        <div className="container hero__inner">
                            <p className="eyebrow">Generator White Label</p>
                            <h1 id="hero-title">Small pieces.<br />Complete applications.</h1>
                            <p className="hero__lede">A framework-independent TypeScript generator built around focused packages for state, rendering, coordination, and routing.</p>
                            <div className="hero__links">
                                <a className="primary-link" href="#example">See it working</a>
                                <a href="#start">Install the generator</a>
                            </div>
                        </div>
                    </section>

                    <section className="section" id="example" aria-labelledby="example-title">
                        <div className="container">
                            <div className="section-intro">
                                <p className="eyebrow">Live example</p>
                                <h2 id="example-title">Four packages. One interaction.</h2>
                                <p>Choose a feature group below. The URL is routed, the mediator coordinates the change, the model stores the current state, and the view renders the result. These controls are ordinary links first, then progressively enhanced in the browser.</p>
                            </div>

                            <div className="demo" aria-label="Interactive White Label architecture example">
                                <div className="demo__controls">
                                    <p className="demo__label">Filter the documentation</p>
                                    <nav className="feature-controls" aria-label="Filter package documentation">
                                        <a href="/?feature=all#example" data-feature-filter="all" data-pushstate aria-current="page">All</a>
                                        <a href="/?feature=core#example" data-feature-filter="core" data-pushstate>Core</a>
                                        <a href="/?feature=runtime#example" data-feature-filter="runtime" data-pushstate>Runtime</a>
                                        <a href="/?feature=tooling#example" data-feature-filter="tooling" data-pushstate>Tooling</a>
                                    </nav>
                                </div>

                                <div className="demo__trace" aria-live="polite" aria-atomic="true" data-filter-status>
                                    <dl>
                                        <div><dt>Router</dt><dd>/?feature=all</dd></div>
                                        <div><dt>Mediator</dt><dd>feature:selected → all</dd></div>
                                        <div><dt>Model</dt><dd>selected: all</dd></div>
                                        <div><dt>View</dt><dd>5 features rendered</dd></div>
                                    </dl>
                                </div>

                                <div className="feature-list" data-feature-list>
                                    <article className="feature-row" data-feature="core">
                                        <div className="feature-row__name">Model</div>
                                        <div><h3>Observable application state.</h3><p>Store plain objects, arrays, or Maps and react to focused changes without adopting an application framework.</p><a href={repositories.model}>Model repository</a></div>
                                    </article>
                                    <article className="feature-row" data-feature="core">
                                        <div className="feature-row__name">View</div>
                                        <div><h3>Escaped JSX without React.</h3><p>Render build-time pages and model-driven browser output through the same small JSX runtime and view lifecycle.</p><a href={repositories.view}>View repository</a></div>
                                    </article>
                                    <article className="feature-row" data-feature="runtime">
                                        <div className="feature-row__name">Mediator</div>
                                        <div><h3>Coordination without coupling.</h3><p>Connect application behavior through a small event bus instead of hard-wiring packages to each other.</p><a href={repositories.mediator}>Mediator repository</a></div>
                                    </article>
                                    <article className="feature-row" data-feature="runtime">
                                        <div className="feature-row__name">Router</div>
                                        <div><h3>Navigation that begins with links.</h3><p>Use conventional URLs and progressively enhance them with History API navigation in the browser.</p><a href={repositories.router}>Router repository</a></div>
                                    </article>
                                    <article className="feature-row" data-feature="tooling">
                                        <div className="feature-row__name">Generator</div>
                                        <div><h3>A tested application starting point.</h3><p>Compile TypeScript, JSX, Tailwind CSS, SEO output, browser code, and static pages into a deployable site.</p><a href="https://github.com/bshack/white-label">Generator repository</a></div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="section" id="packages" aria-labelledby="packages-title">
                        <div className="container">
                            <div className="section-intro">
                                <p className="eyebrow">Documentation</p>
                                <h2 id="packages-title">The core flow stays explicit.</h2>
                                <p>White Label does not hide application structure behind a framework. Each package has one job and can be used independently.</p>
                            </div>

                            <div className="architecture" aria-label="White Label application flow">
                                <ol>
                                    <li><strong>Router</strong><span>turns a URL into application intent</span></li>
                                    <li><strong>Mediator</strong><span>coordinates that intent between modules</span></li>
                                    <li><strong>Model</strong><span>stores and publishes application state</span></li>
                                    <li><strong>View</strong><span>renders the resulting interface</span></li>
                                </ol>
                            </div>

                            <div className="docs-grid">
                                <article>
                                    <p className="eyebrow">Model</p>
                                    <h3>State is observable, not magical.</h3>
                                    <pre><code>{`const model = new Model({count: 0});\nmodel.on('change', state => render(state));\nmodel.set({count: 1});`}</code></pre>
                                </article>
                                <article>
                                    <p className="eyebrow">View</p>
                                    <h3>JSX renders through White Label.</h3>
                                    <pre><code>{`const view = new View({\n  model,\n  template: state => <p>{state.count}</p>\n}).initialize();`}</code></pre>
                                </article>
                                <article>
                                    <p className="eyebrow">Mediator</p>
                                    <h3>Modules communicate through events.</h3>
                                    <pre><code>{`mediator.on('counter:increment', increment);\nmediator.emit('counter:increment');`}</code></pre>
                                </article>
                                <article>
                                    <p className="eyebrow">Router</p>
                                    <h3>Routes stay framework-independent.</h3>
                                    <pre><code>{`router.routes = {\n  '/docs': showDocs,\n  defaultRoute: showHome\n};`}</code></pre>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section className="section" id="start" aria-labelledby="start-title">
                        <div className="container start-grid">
                            <div className="section-intro">
                                <p className="eyebrow">Get started</p>
                                <h2 id="start-title">Generate the boring parts.</h2>
                                <p>The generated project is static-first, TypeScript-first, accessible by default, and ready to replace with your own product code.</p>
                            </div>
                            <div>
                                <p className="code-label">Create a project</p>
                                <pre><code>npx generator-white-label</code></pre>
                                <p className="code-label">Then develop</p>
                                <pre><code>{`npm ci\nnpm test\nnpm run build -- --version=local`}</code></pre>
                                <p><a href="https://github.com/bshack/white-label#readme">Read the complete generator documentation</a></p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="site-footer">
                    <div className="container site-footer__inner">
                        <p>White Label. Framework-independent TypeScript building blocks.</p>
                        <a href="#top">Back to top</a>
                    </div>
                </footer>

                <script src={`${page.cdn}release/${page.version}/assets/script/index.compiled.js`} defer />
            </body>
        </html>
    );
}
