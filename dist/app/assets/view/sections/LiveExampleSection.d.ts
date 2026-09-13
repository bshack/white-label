/**
 * The initial task UI is rendered at build time with the same JSX used later
 * by white-label-view in the browser. JavaScript adds behavior; it does not
 * need to invent the initial document.
 */
export default function LiveExampleSection(): import("white-label-view/jsx-runtime").JSXMarkup;
