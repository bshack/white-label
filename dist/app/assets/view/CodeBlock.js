import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
const codeStyle = {
    background: '#f2f2ef',
    borderColor: '#d4d4d0',
    color: '#242424',
    padding: '1rem 0'
};
const lineStyle = { display: 'grid', gridTemplateColumns: '3rem minmax(max-content, 1fr)', paddingRight: '1rem' };
const numberStyle = { color: '#8a8d91', paddingRight: '.9rem', textAlign: 'right', userSelect: 'none' };
export const syntax = {
    keyword: { color: '#76629a' },
    type: { color: '#486f8a' },
    value: { color: '#5f7f68' },
    muted: { color: '#858585' }
};
/** Render a readable code example with stable line numbers and caller-supplied syntax spans. */
export default function CodeBlock({ lines }) {
    return (_jsx("pre", { style: codeStyle, children: _jsx("code", { children: lines.map((line, index) => (_jsxs("span", { style: lineStyle, children: [_jsx("span", { "aria-hidden": "true", style: numberStyle, children: index + 1 }), _jsx("span", { children: line })] }))) }) }));
}
//# sourceMappingURL=CodeBlock.js.map