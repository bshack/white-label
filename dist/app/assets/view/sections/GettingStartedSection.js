import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
import CodeBlock, { syntax } from '../CodeBlock.js';
/** Keep the shortest path from generator install to a verified local build visible. */
export default function GettingStartedSection() {
    return (_jsx("section", { className: "section", id: "start", "aria-labelledby": "start-title", children: _jsxs("div", { className: "container start-grid", children: [_jsxs("div", { className: "section-intro", children: [_jsx("p", { className: "eyebrow", children: "Get started" }), _jsx("h2", { id: "start-title", children: "Create a project with the generator." }), _jsx("p", { children: "The generated project is static-first, TypeScript-first, accessible by default, and ready for application-specific code." })] }), _jsxs("div", { children: [_jsx("p", { className: "code-label", children: "Create a project" }), _jsx(CodeBlock, { lines: [_jsxs(_Fragment, { children: [_jsx("span", { style: syntax.type, children: "npx" }), " generator-white-label"] })] }), _jsx("p", { className: "code-label", children: "Then develop" }), _jsx(CodeBlock, { lines: [
                                _jsxs(_Fragment, { children: [_jsx("span", { style: syntax.type, children: "npm" }), " ci"] }),
                                _jsxs(_Fragment, { children: [_jsx("span", { style: syntax.type, children: "npm" }), " test"] }),
                                _jsxs(_Fragment, { children: [_jsx("span", { style: syntax.type, children: "npm" }), " run build -- --version=", _jsx("span", { style: syntax.value, children: "local" })] })
                            ] }), _jsx("p", { children: _jsx("a", { href: "https://github.com/bshack/white-label#readme", children: "Read the complete generator documentation" }) })] })] }) }));
}
//# sourceMappingURL=GettingStartedSection.js.map