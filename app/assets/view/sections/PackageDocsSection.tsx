const repositories = {
    mediator: 'https://github.com/bshack/white-label-mediator',
    model: 'https://github.com/bshack/white-label-model',
    router: 'https://github.com/bshack/white-label-router',
    view: 'https://github.com/bshack/white-label-view'
};

/**
 * Package documentation stays close to the example it describes.
 *
 * Each snippet intentionally shows the smallest useful public API rather than
 * introducing a project-specific abstraction developers would have to unlearn.
 */
export default function PackageDocsSection() {
    return (
        <section className="section" id="packages" aria-labelledby="packages-title">
            <div className="container">
                <div className="section-intro">
                    <p className="eyebrow">Documentation</p>
                    <h2 id="packages-title">The core flow stays explicit.</h2>
                    <p>Each package has one job, can be used independently, and stays easy to replace or test because application concerns are not hidden behind a framework.</p>
                </div>

                <div className="architecture">
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
                        <pre><code>{`const model = new Model({count: 0});\nmodel.on('change', state => render(state));\nmodel.update({count: 1});`}</code></pre>
                        <p><a href={repositories.model}>Model documentation</a></p>
                    </article>
                    <article>
                        <p className="eyebrow">View</p>
                        <h3>JSX renders through White Label.</h3>
                        <pre><code>{`const view = new View({\n  model,\n  template: state => <p>{state.count}</p>\n}).initialize();`}</code></pre>
                        <p><a href={repositories.view}>View documentation</a></p>
                    </article>
                    <article>
                        <p className="eyebrow">Mediator</p>
                        <h3>Modules communicate through events.</h3>
                        <pre><code>{`mediator.on('counter:increment', increment);\nmediator.emit('counter:increment');`}</code></pre>
                        <p><a href={repositories.mediator}>Mediator documentation</a></p>
                    </article>
                    <article>
                        <p className="eyebrow">Router</p>
                        <h3>Routes describe intent.</h3>
                        <pre><code>{`router.routes = {\n  '/': (_scope, location) => {\n    mediator.emit('filter:set', location.data.query.filter);\n  }\n};`}</code></pre>
                        <p><a href={repositories.router}>Router documentation</a></p>
                    </article>
                </div>
            </div>
        </section>
    );
}
