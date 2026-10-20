import Router from 'white-label-router';
import type {TaskFilter} from '../../view/examples/tasks/task-state.js';
import type {TaskMediator} from './TaskMediator.js';

const taskFilters = new Set<TaskFilter>(['all', 'active', 'completed']);

/** Turn the `?tasks=` query value into a known filter. Anything unexpected becomes `'all'`. */
export function normalizeTaskFilter(value: string | undefined): TaskFilter {
    return value && taskFilters.has(value as TaskFilter) ? value as TaskFilter : 'all';
}

/**
 * Create the Router that turns the URL into a `task:filter` event.
 *
 * It never updates the Model or renders anything; it only announces intent (and keeps focus on the filter link). That keeps routing reusable and
 * easy to test. The filter links are ordinary links that work without JavaScript; their `data-pushstate` attribute
 * lets the Router handle them with the History API instead of a full page load.
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
