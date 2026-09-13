import Mediator from 'white-label-mediator';
import type {TaskFilter} from '../../view/examples/tasks/task-state.js';

/**
 * Typed application events are the public language between independent pieces.
 *
 * The View can publish user intent without importing the Model, and Router can
 * publish navigation intent without knowing how state is stored or rendered.
 */
export type TaskEvents = {
    'task:add': [title: string];
    'task:filter': [filter: TaskFilter];
    'task:toggle': [id: number];
};

export type TaskMediator = Mediator<TaskEvents>;

export function createTaskMediator(): TaskMediator {
    return new Mediator<TaskEvents>().initialize();
}
