import { jsx as _jsx } from "white-label-view/jsx-runtime";
import View from 'white-label-view';
import TaskExample from '../../view/examples/tasks/TaskExample.js';
/**
 * View owns rendering, but not application decisions.
 *
 * Passing the already-rendered task root lets View adopt useful static HTML
 * instead of replacing the document merely because JavaScript has started.
 */
export function createTaskView(parentElement, model) {
    const element = parentElement.querySelector('[data-task-app]');
    if (!element) {
        throw new TypeError('Task example requires its static task-app root');
    }
    return new View({
        element,
        model,
        parentElement,
        template(data) {
            return _jsx(TaskExample, { state: data });
        }
    }).initialize();
}
//# sourceMappingURL=TaskView.js.map