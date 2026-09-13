import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
/**
 * Point learners at the implementation itself.
 *
 * The landing page is intentionally organized so each path answers a different
 * question: composition, rendering, state, coordination, routing, or testing.
 */
export default function SourceGuideSection() {
    return (_jsx("section", { className: "section", id: "source", "aria-labelledby": "source-title", children: _jsxs("div", { className: "container start-grid", children: [_jsxs("div", { className: "section-intro", children: [_jsx("p", { className: "eyebrow", children: "Read the source" }), _jsx("h2", { id: "source-title", children: "This site is part of the documentation." }), _jsx("p", { children: "The landing page is built with the same White Label packages it teaches. Start at the page composition, then follow the imports into the interactive example." })] }), _jsxs("div", { className: "source-paths", children: [_jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "Page composition" }), _jsx("dd", { children: _jsx("code", { children: "app/index.tsx" }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Static JSX views" }), _jsx("dd", { children: _jsx("code", { children: "app/assets/view/" }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Task application" }), _jsx("dd", { children: _jsx("code", { children: "app/assets/script/tasks/" }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Integration tests" }), _jsx("dd", { children: _jsx("code", { children: "test/app.test.js" }) })] })] }), _jsx("p", { children: _jsx("a", { href: "https://github.com/bshack/white-label/tree/master/app", children: "Browse the application source" }) })] })] }) }));
}
//# sourceMappingURL=SourceGuideSection.js.map