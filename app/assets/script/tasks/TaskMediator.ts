import Mediator from 'white-label-mediator';
import type {TaskFilter} from '../../view/examples/tasks/task-state.js';

/**
 * Document the event protocol in one place even though the currently installed
 * Mediator exposes the EventEmitter-compatible runtime without a generic map.
 * Keeping names and payloads explicit still gives learners one clear contract
 * to follow when tracing the example.
 */
export type TaskEvents = {
    'task:add': [title: string];
    'task:filter': [filter: TaskFilter];
    'task:toggle': [id: number];
};

export type TaskMediator = Mediator;

export function createTaskMediator(): TaskMediator {
    return new Mediator().initialize();
}
