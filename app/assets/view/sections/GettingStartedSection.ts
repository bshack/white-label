import {html} from 'white-label-view/html';
import CodeBlock, {syntax} from '../CodeBlock.js';

/** Keep the shortest path from generator install to a verified local build visible. */
export default function GettingStartedSection() {
    return html`
        <section class="section" id="start" aria-labelledby="start-title">
            <div class="container start-grid">
                <div class="section-intro">
                    <p class="eyebrow">Get started</p>
                    <h2 id="start-title">Create a project with the generator.</h2>
                    <p>The generated project is static-first, TypeScript-first, accessible by default, and ready for application-specific code.</p>
                </div>
                <div>
                    <p class="code-label">Create a project</p>
                    ${CodeBlock({lines: [html`<span class="${syntax.type}">npx</span> generator-white-label`]})}
                    <p class="code-label">Then develop</p>
                    ${CodeBlock({lines: [
                        html`<span class="${syntax.type}">npm</span> ci`,
                        html`<span class="${syntax.type}">npm</span> test`,
                        html`<span class="${syntax.type}">npm</span> run build -- --version=<span class="${syntax.value}">local</span>`
                    ]})}
                    <p><a href="https://github.com/bshack/white-label#readme">Read the complete generator documentation</a></p>
                </div>
            </div>
        </section>
    `;
}
