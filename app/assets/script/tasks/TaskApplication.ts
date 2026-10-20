import type Router from 'white-label-router';
import type View from 'white-label-view';
import {createInitialTaskState, describeTaskStatus} from '../../view/examples/tasks/task-state.js';
import {createTaskMediator, type TaskMediator} from './TaskMediator.js';
import TaskModel from './TaskModel.js';
import {createTaskRouter} from './TaskRouter.js';
import {createTaskView} from './TaskView.js';

/** The running task example. Its parts are exposed so tests can inspect them, and `destroy()` tears it all down. */
export interface TaskApplication {
    mediator: TaskMediator;
    model: TaskModel;
    router: Router;
    view: View;
    destroy(): void;
}

/**
 * Wire the task example together: the Router turns the URL into a `task:filter` event, form and checkbox events
 * become `task:add` and `task:toggle`, Mediator listeners apply them to the Model, and the View re-renders.
 *
 * This is the only module that knows about every part, so Model, View, Router, and Mediator can each be read on
 * their own.
 *
 * @param documentRoot - The document containing the server-rendered `[data-task-example]` markup.
 * @throws {TypeError} If the page has no `[data-task-example]` container.
 */
export function initializeTaskApplication(documentRoot: Document): TaskApplication {
    const parentElement = documentRoot.querySelector<HTMLElement>('[data-task-example]');
    if (!parentElement) {throw new TypeError('White Label task example requires a data-task-example container');}

    const mediator = createTaskMediator();
    const model = new TaskModel(createInitialTaskState());
    const view = createTaskView(parentElement, model);
    const status = parentElement.querySelector<HTMLElement>('[data-task-status]')!;
    const updateStatus = (): void => {status.textContent = describeTaskStatus(model.get());};

    const addTask = (event: CustomEvent<string>): void => {model.add(event.detail); updateStatus();};
    const toggleTask = (event: CustomEvent<number>): void => {model.toggle(event.detail); updateStatus();};
    const setFilter = (event: CustomEvent<'all' | 'active' | 'completed'>): void => {model.setFilter(event.detail); updateStatus();};
    mediator.addEventListener('task:add', addTask);
    mediator.addEventListener('task:toggle', toggleTask);
    mediator.addEventListener('task:filter', setFilter);

    // Listen on the container, which outlives re-renders, rather than on elements the View replaces.
    const delegated = view.delegate(parentElement);
    delegated.on('submit', '[data-task-form]', (event: Event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const input = form.querySelector<HTMLInputElement>('[name="task"]')!;
        mediator.dispatchEvent(new CustomEvent('task:add', {detail: input.value}));
        parentElement.querySelector<HTMLInputElement>('[name="task"]')!.focus();
    });
    delegated.on('change', '[data-task-toggle]', (event: Event) => {
        const input = event.target as HTMLInputElement;
        const id = Number(input.dataset.taskId);
        mediator.dispatchEvent(new CustomEvent('task:toggle', {detail: id}));
        // After the re-render, focus the toggled task's checkbox, or the current filter link if the filter now hides it.
        const focusTarget = parentElement.querySelector<HTMLInputElement>(`[data-task-id="${id}"]`)
            ?? parentElement.querySelector<HTMLAnchorElement>('[data-task-filter][aria-current="page"]')!;
        focusTarget.focus();
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
            mediator.removeEventListener('task:add', addTask);
            mediator.removeEventListener('task:toggle', toggleTask);
            mediator.removeEventListener('task:filter', setFilter);
            view.destroy();
            model.destroy();
            mediator.destroy();
        }
    };
}
