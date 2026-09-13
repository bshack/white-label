import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
const filters = ['all', 'active', 'completed'];
const taskPredicates = {
    active: task => !task.complete,
    all: () => true,
    completed: task => task.complete
};
/**
 * Render the task example from state only.
 *
 * The same JSX function is used twice: once while generating the initial HTML
 * and again by white-label-view in the browser. Sharing one renderer keeps the
 * static and interactive versions of the example from drifting apart.
 */
export default function TaskExample({ state }) {
    const visibleTasks = state.tasks.filter(taskPredicates[state.filter]);
    const completed = state.tasks.filter(task => task.complete).length;
    return (_jsxs("section", { className: "task-app", "data-task-app": true, "aria-label": "Interactive task example", children: [_jsxs("form", { className: "task-form", "data-task-form": true, action: "#example", method: "get", children: [_jsx("label", { htmlFor: "task-title", children: "New task" }), _jsxs("div", { className: "task-form__controls", children: [_jsx("input", { id: "task-title", name: "task", type: "text", autocomplete: "off", required: true }), _jsx("button", { type: "submit", children: "Add task" })] })] }), _jsx("nav", { className: "task-filters", "aria-label": "Filter tasks", children: filters.map(filter => (_jsxs("a", { href: `/?tasks=${filter}#example`, "data-task-filter": filter, "data-pushstate": true, "aria-current": state.filter === filter ? 'page' : 'false', children: [filter.charAt(0).toUpperCase(), filter.slice(1)] }))) }), _jsxs("p", { className: "visually-hidden", "aria-live": "polite", "aria-atomic": "true", "data-task-status": true, children: ["Showing ", visibleTasks.length, " tasks for the ", state.filter, " filter."] }), _jsx("ul", { className: "task-list", children: visibleTasks.map(task => (_jsx("li", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: task.complete, "data-task-toggle": true, "data-task-id": task.id }), _jsx("span", { children: task.title })] }) }))) }), _jsxs("dl", { className: "demo__trace", "aria-label": "White Label application flow", children: [_jsxs("div", { children: [_jsx("dt", { children: "Router" }), _jsxs("dd", { children: ["/?tasks=", state.filter] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Mediator" }), _jsx("dd", { children: "task:* application events" })] }), _jsxs("div", { children: [_jsx("dt", { children: "Model" }), _jsxs("dd", { children: [state.tasks.length, " tasks \u00B7 ", completed, " complete"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "View" }), _jsxs("dd", { children: [visibleTasks.length, " tasks rendered"] })] })] })] }));
}
//# sourceMappingURL=TaskExample.js.map