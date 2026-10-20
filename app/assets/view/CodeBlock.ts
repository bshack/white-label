import {html, type HTMLMarkup} from 'white-label-view/html';

/** CSS classes for highlighting parts of a code line. */
export const syntax = {
    keyword: 'code-syntax-keyword',
    type: 'code-syntax-type',
    value: 'code-syntax-value',
    muted: 'code-syntax-muted'
};

/** Render a code example with line numbers. Each line is tagged HTML, so callers can wrap tokens in `syntax` spans. */
export default function CodeBlock({lines}: {lines: HTMLMarkup[]}) {
    return html`<pre class="code-block"><code>${lines.map((line, index) => html`<span class="code-block__line">
                <span aria-hidden="true" class="code-block__number">${index + 1}</span><span>${line}</span>
            </span>`)}</code></pre>`;
}
