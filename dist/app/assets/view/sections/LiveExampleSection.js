import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
import TaskExample from '../examples/tasks/TaskExample.js';
import { createInitialTaskState } from '../examples/tasks/task-state.js';
/**
 * The initial task UI is rendered at build time with the same JSX used later
 * by white-label-view in the browser. JavaScript adds behavior; it does not
 * need to invent the initial document.
 */
export default function LiveExampleSection() {
    return (_jsx("section", { className: "section", id: "example", "aria-labelledby": "example-title", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-intro", children: [_jsx("p", { className: "eyebrow", children: "Live example" }), _jsx("h2", { id: "example-title", children: "Four packages. One small application." }), _jsx("p", { children: "Add a task, toggle its state, or change the filter. Router translates the URL into intent, Mediator coordinates actions, Model owns state, and View keeps the interface in sync." })] }), _jsx("div", { className: "demo", "data-task-example": true, children: _jsx(TaskExample, { state: createInitialTaskState() }) })] }) }));
}
//# sourceMappingURL=LiveExampleSection.js.map