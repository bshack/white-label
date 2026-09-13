/**
 * Marketing content can stay a plain JSX function.
 *
 * White Label does not require every piece of markup to become a stateful
 * View instance. Use View where lifecycle or observable state is useful;
 * keep static presentation simple.
 */
export default function HeroSection(): import("white-label-view/jsx-runtime").JSXMarkup;