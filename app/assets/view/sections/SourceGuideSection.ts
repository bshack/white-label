import {html} from 'white-label-view/html';

/** Point learners at the implementation paths that demonstrate each responsibility. */
export default function SourceGuideSection() {
    return html`
        <section class="section" id="source" aria-labelledby="source-title">
            <div class="container start-grid">
                <div class="section-intro">
                    <p class="eyebrow">Read the source</p>
                    <h2 id="source-title">This site is part of the documentation.</h2>
                    <p>The landing page is built with the same White Label packages it teaches. Start at the page composition, then follow the imports into the interactive example.</p>
                </div>
                <div class="source-paths">
                    <dl>
                        <div><dt>Page composition</dt><dd><code>app/index.ts</code></dd></div>
                        <div><dt>Tagged HTML views</dt><dd><code>app/assets/view/</code></dd></div>
                        <div><dt>Task application</dt><dd><code>app/assets/script/tasks/</code></dd></div>
                        <div><dt>Integration tests</dt><dd><code>test/app.test.js</code></dd></div>
                    </dl>
                    <p><a href="https://github.com/bshack/white-label/tree/master/app">Browse the application source</a></p>
                </div>
            </div>
        </section>
    `;
}
