import Mediator from 'white-label-mediator';
import type {TaskFilter} from '../../view/examples/tasks/task-state.js';

/** Event names the task modules exchange, mapped to each event's `detail` type. */
export type TaskEvents = {
    'task:add': string;
    'task:filter': TaskFilter;
    'task:toggle': number;
};

/** A Mediator typed to {@link TaskEvents}. */
export type TaskMediator = Mediator<TaskEvents>;

/** Create and initialize the Mediator that carries task events between modules. */
export function createTaskMediator(): TaskMediator {
    return new Mediator<TaskEvents>().initialize();
}
