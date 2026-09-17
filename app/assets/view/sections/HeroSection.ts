import {html} from 'white-label-view/html';

/** Static presentation stays a plain tagged-template function; View is only needed for lifecycle/state. */
export default function HeroSection() {
    return html`
        <section class="hero" id="top" aria-labelledby="hero-title">
            <div class="container hero__inner">
                <h1 id="hero-title">Small pieces.<br>Complete applications.</h1>
                <p class="hero__lede">Framework-independent TypeScript packages for state, rendering, coordination, routing, and project generation.</p>
                <div class="hero__links">
                    <a class="primary-link" href="#example">See the example</a>
                    <a href="#start">Install the generator</a>
                </div>
            </div>
        </section>
    `;
}
