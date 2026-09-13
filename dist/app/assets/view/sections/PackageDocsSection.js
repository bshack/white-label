import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
import CodeBlock, { syntax } from '../CodeBlock.js';
const repositories = {
    mediator: 'https://github.com/bshack/white-label-mediator',
    model: 'https://github.com/bshack/white-label-model',
    router: 'https://github.com/bshack/white-label-router',
    view: 'https://github.com/bshack/white-label-view'
};
/** Package documentation stays close to the example it describes. */
export default function PackageDocsSection() {
    return (_jsx("section", { className: "section", id: "packages", "aria-labelledby": "packages-title", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-intro", children: [_jsx("p", { className: "eyebrow", children: "Documentation" }), _jsx("h2", { id: "packages-title", children: "The core flow stays explicit." }), _jsx("p", { children: "Each package has one job, can be used independently, and stays easy to replace or test because application concerns are not hidden behind a framework." })] }), _jsx("div", { className: "architecture", children: _jsxs("ol", { children: [_jsxs("li", { children: [_jsx("strong", { children: "Router" }), _jsx("span", { children: "turns a URL into application intent" })] }), _jsxs("li", { children: [_jsx("strong", { children: "Mediator" }), _jsx("span", { children: "coordinates that intent between modules" })] }), _jsxs("li", { children: [_jsx("strong", { children: "Model" }), _jsx("span", { children: "stores and publishes application state" })] }), _jsxs("li", { children: [_jsx("strong", { children: "View" }), _jsx("span", { children: "renders the resulting interface" })] })] }) }), _jsxs("div", { className: "docs-grid", children: [_jsxs("article", { children: [_jsx("p", { className: "eyebrow", children: "Model" }), _jsx("h3", { children: "State is observable, not magical." }), _jsx(CodeBlock, { lines: [
                                        _jsxs(_Fragment, { children: [_jsx("span", { style: syntax.keyword, children: "const" }), " model = ", _jsx("span", { style: syntax.keyword, children: "new" }), " ", _jsx("span", { style: syntax.type, children: "Model" }), "(", '{', "count: 0", '}', ");"] }),
                                        _jsxs(_Fragment, { children: ["model.on(", _jsx("span", { style: syntax.value, children: "'change'" }), ", state => render(state));"] }),
                                        _jsxs(_Fragment, { children: ["model.update(", '{', "count: 1", '}', ");"] })
                                    ] }), _jsx("p", { children: _jsx("a", { href: repositories.model, children: "Model documentation" }) })] }), _jsxs("article", { children: [_jsx("p", { className: "eyebrow", children: "View" }), _jsx("h3", { children: "JSX renders through White Label." }), _jsx(CodeBlock, { lines: [
                                        _jsxs(_Fragment, { children: [_jsx("span", { style: syntax.keyword, children: "const" }), " view = ", _jsx("span", { style: syntax.keyword, children: "new" }), " ", _jsx("span", { style: syntax.type, children: "View" }), "(", '{'] }),
                                        _jsx(_Fragment, { children: "  model," }),
                                        _jsxs(_Fragment, { children: ["  template: state => <p>", '{', "state.count", '}', "</p>"] }),
                                        _jsxs(_Fragment, { children: ['}', ").initialize();"] })
                                    ] }), _jsx("p", { children: _jsx("a", { href: repositories.view, children: "View documentation" }) })] }), _jsxs("article", { children: [_jsx("p", { className: "eyebrow", children: "Mediator" }), _jsx("h3", { children: "Modules communicate through events." }), _jsx(CodeBlock, { lines: [
                                        _jsxs(_Fragment, { children: ["mediator.on(", _jsx("span", { style: syntax.value, children: "'counter:increment'" }), ", increment);"] }),
                                        _jsxs(_Fragment, { children: ["mediator.emit(", _jsx("span", { style: syntax.value, children: "'counter:increment'" }), ");"] })
                                    ] }), _jsx("p", { children: _jsx("a", { href: repositories.mediator, children: "Mediator documentation" }) })] }), _jsxs("article", { children: [_jsx("p", { className: "eyebrow", children: "Router" }), _jsx("h3", { children: "Routes describe intent." }), _jsx(CodeBlock, { lines: [
                                        _jsxs(_Fragment, { children: ["router.routes = ", '{'] }),
                                        _jsxs(_Fragment, { children: ["  ", _jsx("span", { style: syntax.value, children: "'/'" }), ": (_scope, location) => ", '{'] }),
                                        _jsxs(_Fragment, { children: ["    mediator.emit(", _jsx("span", { style: syntax.value, children: "'filter:set'" }), ", location.data.query.filter);"] }),
                                        _jsxs(_Fragment, { children: ["  ", '}'] }),
                                        _jsxs(_Fragment, { children: ['}', ";"] })
                                    ] }), _jsx("p", { children: _jsx("a", { href: repositories.router, children: "Router documentation" }) })] })] })] }) }));
}
//# sourceMappingURL=PackageDocsSection.js.map