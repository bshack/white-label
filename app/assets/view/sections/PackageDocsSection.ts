import {html} from 'white-label-view/html';
import CodeBlock, {syntax} from '../CodeBlock.js';

const repositories = {
    mediator: 'https://github.com/bshack/white-label-mediator',
    model: 'https://github.com/bshack/white-label-model',
    router: 'https://github.com/bshack/white-label-router',
    view: 'https://github.com/bshack/white-label-view'
};

/** Package documentation stays close to the example it describes. */
export default function PackageDocsSection() {
    return html`
        <section class="section" id="packages" aria-labelledby="packages-title">
            <div class="container">
                <div class="section-intro">
                    <p class="eyebrow">Documentation</p>
                    <h2 id="packages-title">The core flow stays explicit.</h2>
                    <p>Each package has one job, can be used independently, and stays easy to replace or test because application concerns are not hidden behind a framework.</p>
                </div>
                <div class="architecture"><ol>
                    <li><strong>Router</strong><span>turns a URL into application intent</span></li>
                    <li><strong>Mediator</strong><span>coordinates that intent between modules</span></li>
                    <li><strong>Model</strong><span>stores and publishes application state</span></li>
                    <li><strong>View</strong><span>renders the resulting interface</span></li>
                </ol></div>
                <div class="docs-grid">
                    <article>
                        <p class="eyebrow">Model</p><h3>State is observable, not magical.</h3>
                        ${CodeBlock({lines: [
                            html`<span class="${syntax.keyword}">const</span> model = <span class="${syntax.keyword}">new</span> <span class="${syntax.type}">Model</span>({count: 0});`,
                            html`model.addEventListener(<span class="${syntax.value}">'change'</span>, event =&gt; render(event.detail));`,
                            html`model.update({count: 1});`
                        ]})}
                        <p><a href="${repositories.model}">Model documentation</a></p>
                    </article>
                    <article>
                        <p class="eyebrow">View</p><h3>Tagged HTML is the first-party template syntax.</h3>
                        ${CodeBlock({lines: [
                            html`<span class="${syntax.keyword}">import</span> {html} from <span class="${syntax.value}">'white-label-view/html'</span>;`,
                            html`<span class="${syntax.keyword}">const</span> view = <span class="${syntax.keyword}">new</span> <span class="${syntax.type}">View</span>({`,
                            html`  model,`,
                            html`  template: state =&gt; html\`${'<p>'}\${state.count}${'</p>'}\``,
                            html`}).initialize();`
                        ]})}
                        <p><a href="${repositories.view}">View documentation</a></p>
                    </article>
                    <article>
                        <p class="eyebrow">Mediator</p><h3>Modules communicate through events.</h3>
                        ${CodeBlock({lines: [
                            html`mediator.addEventListener(<span class="${syntax.value}">'counter:increment'</span>, increment);`,
                            html`mediator.dispatchEvent(<span class="${syntax.keyword}">new</span> <span class="${syntax.type}">CustomEvent</span>(<span class="${syntax.value}">'counter:increment'</span>));`
                        ]})}
                        <p><a href="${repositories.mediator}">Mediator documentation</a></p>
                    </article>
                    <article>
                        <p class="eyebrow">Router</p><h3>Routes describe intent.</h3>
                        ${CodeBlock({lines: [
                            html`router.routes = {`,
                            html`  <span class="${syntax.value}">'/'</span>: (_scope, location) =&gt; {`,
                            html`    mediator.dispatchEvent(<span class="${syntax.keyword}">new</span> <span class="${syntax.type}">CustomEvent</span>(<span class="${syntax.value}">'filter:set'</span>, {detail: location.data.query.filter}));`,
                            html`  }`,
                            html`};`
                        ]})}
                        <p><a href="${repositories.router}">Router documentation</a></p>
                    </article>
                </div>
            </div>
        </section>
    `;
}
