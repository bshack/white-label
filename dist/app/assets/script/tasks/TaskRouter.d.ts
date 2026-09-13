import Router from 'white-label-router';
import type { TaskFilter } from '../../view/examples/tasks/task-state.js';
import type { TaskMediator } from './TaskMediator.js';
/** Normalize URL input at the routing boundary before it reaches domain state. */
export declare function normalizeTaskFilter(value: string | undefined): TaskFilter;
/**
 * Router translates URL state into an application event.
 *
 * It does not update the Model or DOM directly. That separation keeps routing
 * usable in different applications and makes browser navigation easy to test.
 */
export declare function createTaskRouter(documentRoot: Document, mediator: TaskMediator): Router;
