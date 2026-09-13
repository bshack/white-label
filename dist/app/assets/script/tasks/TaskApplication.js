import { createInitialTaskState } from '../../view/examples/tasks/task-state.js';
import { createTaskMediator } from './TaskMediator.js';
import TaskModel from './TaskModel.js';
import { createTaskRouter } from './TaskRouter.js';
import { createTaskView } from './TaskView.js';
/**
 * Compose the application at one explicit boundary.
 *
 * This is the only module that knows every moving part. Model, View, Router,
 * and Mediator stay independently understandable, while this file documents
 * the small amount of wiring needed to make them cooperate in a real feature.
 */
export function initializeTaskApplication(documentRoot) {
    const parentElement = documentRoot.querySelector('[data-task-example]');
    if (!parentElement) {
        throw new TypeError('White Label task example requires a data-task-example container');
    }
    const mediator = createTaskMediator();
    const model = new TaskModel(createInitialTaskState());
    const view = createTaskView(parentElement, model);
    const addTask = (title) => { model.add(title); };
    const toggleTask = (id) => { model.toggle(id); };
    const setFilter = (filter) => { model.setFilter(filter); };
    mediator.on('task:add', addTask);
    mediator.on('task:toggle', toggleTask);
    mediator.on('task:filter', setFilter);
    const delegated = view.delegate(parentElement);
    delegated.on('submit', '[data-task-form]', (event) => {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('[name="task"]');
        mediator.emit('task:add', input.value);
        parentElement.querySelector('[name="task"]').focus();
    });
    delegated.on('change', '[data-task-toggle]', (event) => {
        const input = event.target;
        mediator.emit('task:toggle', Number(input.dataset.taskId));
    });
    const router = createTaskRouter(documentRoot, mediator);
    return {
        mediator,
        model,
        router,
        view,
        destroy() {
            delegated.clear();
            router.destroy();
            mediator.removeListener('task:add', addTask);
            mediator.removeListener('task:toggle', toggleTask);
            mediator.removeListener('task:filter', setFilter);
            view.destroy();
            model.destroy();
            mediator.destroy();
        }
    };
}
//# sourceMappingURL=TaskApplication.js.map