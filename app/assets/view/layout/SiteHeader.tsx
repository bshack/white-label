/**
 * Static navigation is ordinary HTML first.
 *
 * White Label's router enhances only links that opt in with data-pushstate,
 * so global navigation stays conventional, crawlable, and usable without
 * client-side JavaScript.
 */
export default function SiteHeader() {
    return (
        <header className="site-header">
            <div className="container site-header__inner">
                <a className="wordmark" href="#top" aria-label="White Label home">White Label</a>
                <nav aria-label="Primary navigation">
                    <a href="#example">Example</a>
                    <a href="#packages">Packages</a>
                    <a href="#source">Source</a>
                    <a href="#start">Get started</a>
                    <a href="https://github.com/bshack/white-label">GitHub</a>
                </nav>
            </div>
        </header>
    );
}
