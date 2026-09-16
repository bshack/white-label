import Router from 'white-label-router';
import type {TaskFilter} from '../../view/examples/tasks/task-state.js';
import type {TaskMediator} from './TaskMediator.js';

const taskFilters = new Set<TaskFilter>(['all', 'active', 'completed']);

/** Normalize URL input at the routing boundary before it reaches domain state. */
export function normalizeTaskFilter(value: string | undefined): TaskFilter {
    return value && taskFilters.has(value as TaskFilter) ? value as TaskFilter : 'all';
}

/**
 * Router translates URL state into an application event.
 *
 * It does not update the Model or DOM directly. That separation keeps routing
 * usable in different applications and makes browser navigation easy to test.
 */
export function createTaskRouter(documentRoot: Document, mediator: TaskMediator): Router {
    const router = new Router();
    router.scope = documentRoot.querySelector('main');
    router.mediator = mediator;
    const route = (_scope: Element | null, location: {data: {query: Record<string, string>}}): void => {
        const filter = normalizeTaskFilter(location.data.query.tasks);
        const restoreFocus = documentRoot.activeElement?.hasAttribute('data-task-filter') === true;
        mediator.dispatchEvent(new CustomEvent('task:filter', {detail: filter}));
        if (restoreFocus) {documentRoot.querySelector<HTMLAnchorElement>(`[data-task-filter="${filter}"]`)!.focus();}
    };
    router.routes = {'/': route, defaultRoute: route};
    return router.initialize();
}
