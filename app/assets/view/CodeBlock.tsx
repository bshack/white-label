import type {JSX} from 'white-label-view/jsx-runtime';

const codeStyle = {
    background: '#f4f4f1',
    borderColor: '#cecec8',
    color: '#242424',
    padding: '.9rem 0'
};
const lineStyle = {
    display: 'grid',
    gridTemplateColumns: '2.75rem minmax(max-content, 1fr)',
    paddingRight: '1rem'
};
const numberStyle = {color: '#8a8d91', paddingRight: '.85rem', textAlign: 'right', userSelect: 'none'};

export const syntax = {
    keyword: {color: '#6e6878'},
    type: {color: '#5d6f78'},
    value: {color: '#68756a'},
    muted: {color: '#858585'}
};

/** Render a readable code example with stable line numbers and caller-supplied syntax spans. */
export default function CodeBlock({lines}: {lines: JSX.Element[]}) {
    return (
        <pre style={codeStyle}><code>{lines.map((line, index) => (
            <span style={lineStyle}><span aria-hidden="true" style={numberStyle}>{index + 1}</span><span>{line}</span></span>
        ))}</code></pre>
    );
}
