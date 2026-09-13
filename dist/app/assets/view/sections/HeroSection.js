import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
/**
 * Marketing content can stay a plain JSX function.
 *
 * White Label does not require every piece of markup to become a stateful
 * View instance. Use View where lifecycle or observable state is useful;
 * keep static presentation simple.
 */
export default function HeroSection() {
    return (_jsx("section", { className: "hero", id: "top", "aria-labelledby": "hero-title", children: _jsxs("div", { className: "container hero__inner", children: [_jsx("p", { className: "eyebrow", children: "Generator White Label" }), _jsxs("h1", { id: "hero-title", children: ["Small pieces.", _jsx("br", {}), "Complete applications."] }), _jsx("p", { className: "hero__lede", children: "A framework-independent TypeScript generator built around focused packages for state, rendering, coordination, and routing." }), _jsxs("div", { className: "hero__links", children: [_jsx("a", { className: "primary-link", href: "#example", children: "See it working" }), _jsx("a", { href: "#start", children: "Install the generator" })] })] }) }));
}
//# sourceMappingURL=HeroSection.js.map