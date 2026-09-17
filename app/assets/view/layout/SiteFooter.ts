import {html} from 'white-label-view/html';

/** Keep reusable static page chrome as a small tagged-template function. */
export default function SiteFooter() {
    return html`<footer class="site-footer">
            <div class="container site-footer__inner">
                <p>White Label. Framework-independent TypeScript building blocks.</p>
                <a href="#top">Back to top</a>
            </div>
        </footer>`;
}
