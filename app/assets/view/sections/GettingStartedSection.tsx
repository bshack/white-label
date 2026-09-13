/** Keep the shortest path from generator install to a verified local build visible. */
export default function GettingStartedSection() {
    return (
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
    );
}
