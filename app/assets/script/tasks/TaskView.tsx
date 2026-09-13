import View from 'white-label-view';
import TaskExample from '../../view/examples/tasks/TaskExample.js';
import type {TaskState} from '../../view/examples/tasks/task-state.js';
import type TaskModel from './TaskModel.js';

/**
 * View owns rendering, but not application decisions.
 *
 * Passing the already-rendered task root lets View adopt useful static HTML
 * instead of replacing the document merely because JavaScript has started.
 */
export function createTaskView(parentElement: HTMLElement, model: TaskModel): View {
    const element = parentElement.querySelector<HTMLElement>('[data-task-app]');
    if (!element) {throw new TypeError('Task example requires its static task-app root');}

    return new View({
        element,
        model,
        parentElement,
        template(data) {
            return <TaskExample state={data as TaskState} />;
        }
    }).initialize();
}
