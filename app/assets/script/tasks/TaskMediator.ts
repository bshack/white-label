import Mediator from 'white-label-mediator';
import type {TaskFilter} from '../../view/examples/tasks/task-state.js';

/** Application event vocabulary shared by the generated task modules. */
export type TaskEvents = {
    'task:add': string;
    'task:filter': TaskFilter;
    'task:toggle': number;
};

export type TaskMediator = Mediator<TaskEvents>;

export function createTaskMediator(): TaskMediator {
    return new Mediator<TaskEvents>().initialize();
}
