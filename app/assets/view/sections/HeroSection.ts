import {html} from 'white-label-view/html';

/** Hero banner. Static content is a plain function; a View is only needed for state or event handling. */
export default function HeroSection() {
    return html`<section class="hero" id="top" aria-labelledby="hero-title">
            <div class="container hero__inner">
                <h1 id="hero-title">Small pieces.<br>Complete applications.</h1>
                <p class="hero__lede">Framework-independent TypeScript packages for state, rendering, coordination, routing, and project generation.</p>
                <div class="hero__links">
                    <a class="primary-link" href="#example">See the example</a>
                    <a href="#start">Install the generator</a>
                </div>
            </div>
        </section>`;
}
