/**
 * Marketing content can stay a plain JSX function.
 *
 * White Label does not require every piece of markup to become a stateful
 * View instance. Use View where lifecycle or observable state is useful;
 * keep static presentation simple.
 */
export default function HeroSection() {
    return (
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
    );
}
