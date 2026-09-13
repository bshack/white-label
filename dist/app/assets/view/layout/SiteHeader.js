import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
/**
 * Static navigation is ordinary HTML first.
 *
 * White Label's router enhances only links that opt in with data-pushstate,
 * so global navigation stays conventional, crawlable, and usable without
 * client-side JavaScript.
 */
export default function SiteHeader() {
    return (_jsx("header", { className: "site-header", children: _jsxs("div", { className: "container site-header__inner", children: [_jsx("a", { className: "wordmark", href: "#top", "aria-label": "White Label home", children: "White Label" }), _jsxs("nav", { "aria-label": "Primary navigation", children: [_jsx("a", { href: "#example", children: "Example" }), _jsx("a", { href: "#packages", children: "Packages" }), _jsx("a", { href: "#source", children: "Source" }), _jsx("a", { href: "#start", children: "Get started" }), _jsx("a", { href: "https://github.com/bshack/white-label", children: "GitHub" })] })] }) }));
}
//# sourceMappingURL=SiteHeader.js.map