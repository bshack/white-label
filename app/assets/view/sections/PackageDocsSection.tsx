import CodeBlock, {syntax} from '../CodeBlock.js';

const repositories = {
    mediator: 'https://github.com/bshack/white-label-mediator',
    model: 'https://github.com/bshack/white-label-model',
    router: 'https://github.com/bshack/white-label-router',
    view: 'https://github.com/bshack/white-label-view'
};

/** Package documentation stays close to the example it describes. */
export default function PackageDocsSection() {
    return (
        <section className="section" id="packages" aria-labelledby="packages-title">
            <div className="container">
                <div className="section-intro">
                    <p className="eyebrow">Documentation</p>
                    <h2 id="packages-title">The core flow stays explicit.</h2>
                    <p>Each package has one job, can be used independently, and stays easy to replace or test because application concerns are not hidden behind a framework.</p>
                </div>
                <div className="architecture"><ol>
                    <li><strong>Router</strong><span>turns a URL into application intent</span></li>
                    <li><strong>Mediator</strong><span>coordinates that intent between modules</span></li>
                    <li><strong>Model</strong><span>stores and publishes application state</span></li>
                    <li><strong>View</strong><span>renders the resulting interface</span></li>
                </ol></div>
                <div className="docs-grid">
                    <article>
                        <p className="eyebrow">Model</p><h3>State is observable, not magical.</h3>
                        <CodeBlock lines={[
                            <><span className={syntax.keyword}>const</span> model = <span className={syntax.keyword}>new</span> <span className={syntax.type}>Model</span>({'{'}count: 0{'}'});</>,
                            <>model.on(<span className={syntax.value}>'change'</span>, state =&gt; render(state));</>,
                            <>model.update({'{'}count: 1{'}'});</>
                        ]} />
                        <p><a href={repositories.model}>Model documentation</a></p>
                    </article>
                    <article>
                        <p className="eyebrow">View</p><h3>JSX renders through White Label.</h3>
                        <CodeBlock lines={[
                            <><span className={syntax.keyword}>const</span> view = <span className={syntax.keyword}>new</span> <span className={syntax.type}>View</span>({'{'}</>,
                            <>  model,</>,
                            <>  template: state =&gt; &lt;p&gt;{'{'}state.count{'}'}&lt;/p&gt;</>,
                            <>{'}'}).initialize();</>
                        ]} />
                        <p><a href={repositories.view}>View documentation</a></p>
                    </article>
                    <article>
                        <p className="eyebrow">Mediator</p><h3>Modules communicate through events.</h3>
                        <CodeBlock lines={[
                            <>mediator.on(<span className={syntax.value}>'counter:increment'</span>, increment);</>,
                            <>mediator.emit(<span className={syntax.value}>'counter:increment'</span>);</>
                        ]} />
                        <p><a href={repositories.mediator}>Mediator documentation</a></p>
                    </article>
                    <article>
                        <p className="eyebrow">Router</p><h3>Routes describe intent.</h3>
                        <CodeBlock lines={[
                            <>router.routes = {'{'}</>,
                            <>  <span className={syntax.value}>'/'</span>: (_scope, location) =&gt; {'{'}</>,
                            <>    mediator.emit(<span className={syntax.value}>'filter:set'</span>, location.data.query.filter);</>,
                            <>  {'}'}</>,
                            <>{'}'};</>
                        ]} />
                        <p><a href={repositories.router}>Router documentation</a></p>
                    </article>
                </div>
            </div>
        </section>
    );
}
