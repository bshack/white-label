import type {JSX} from 'white-label-view/jsx-runtime';

export const syntax = {
    keyword: 'code-syntax-keyword',
    type: 'code-syntax-type',
    value: 'code-syntax-value',
    muted: 'code-syntax-muted'
};

/** Render a readable code example with stable line numbers and caller-supplied syntax spans. */
export default function CodeBlock({lines}: {lines: JSX.Element[]}) {
    return (
        <pre className="code-block"><code>{lines.map((line, index) => (
            <span className="code-block__line"><span aria-hidden="true" className="code-block__number">{index + 1}</span><span>{line}</span></span>
        ))}</code></pre>
    );
}
