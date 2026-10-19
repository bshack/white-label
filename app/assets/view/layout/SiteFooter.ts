import {html} from 'white-label-view/html';

/** Site footer. Static markup like this needs only a function that returns `html`, not a View. */
export default function SiteFooter() {
    return html`<footer class="site-footer">
            <div class="container site-footer__inner">
                <p>White Label. Framework-independent TypeScript building blocks.</p>
                <a href="#top">Back to top</a>
            </div>
        </footer>`;
}
