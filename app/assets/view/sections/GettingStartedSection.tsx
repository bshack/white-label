import CodeBlock, {syntax} from '../CodeBlock.js';

/** Keep the shortest path from generator install to a verified local build visible. */
export default function GettingStartedSection() {
    return (
        <section className="section" id="start" aria-labelledby="start-title">
            <div className="container start-grid">
                <div className="section-intro">
                    <p className="eyebrow">Get started</p>
                    <h2 id="start-title">Create a project with the generator.</h2>
                    <p>The generated project is static-first, TypeScript-first, accessible by default, and ready for application-specific code.</p>
                </div>
                <div>
                    <p className="code-label">Create a project</p>
                    <CodeBlock lines={[<><span style={syntax.type}>npx</span> generator-white-label</>]} />
                    <p className="code-label">Then develop</p>
                    <CodeBlock lines={[
                        <><span style={syntax.type}>npm</span> ci</>,
                        <><span style={syntax.type}>npm</span> test</>,
                        <><span style={syntax.type}>npm</span> run build -- --version=<span style={syntax.value}>local</span></>
                    ]} />
                    <p><a href="https://github.com/bshack/white-label#readme">Read the complete generator documentation</a></p>
                </div>
            </div>
        </section>
    );
}
