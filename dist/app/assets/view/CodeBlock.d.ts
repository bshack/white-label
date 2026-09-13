import type { JSX } from 'white-label-view/jsx-runtime';
export declare const syntax: {
    keyword: {
        color: string;
    };
    type: {
        color: string;
    };
    value: {
        color: string;
    };
    muted: {
        color: string;
    };
};
/** Render a readable code example with stable line numbers and caller-supplied syntax spans. */
export default function CodeBlock({ lines }: {
    lines: JSX.Element[];
}): import("white-label-view/jsx-runtime").JSXMarkup;
