import {html} from 'white-label-view/html';

/** Static navigation remains ordinary crawlable HTML; JavaScript enhances only opted-in links. */
export default function SiteHeader() {
    return html`
        <header class="site-header">
            <div class="container site-header__inner">
                <a class="wordmark" href="#top">White Label</a>
                <nav aria-label="Primary navigation">
                    <a href="#example">Example</a>
                    <a href="#packages">Packages</a>
                    <a href="#source">Source</a>
                    <a href="#start">Get started</a>
                    <a href="https://github.com/bshack/white-label">GitHub</a>
                </nav>
            </div>
        </header>
    `;
}
