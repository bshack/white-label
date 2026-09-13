import Router from 'white-label-router';
const taskFilters = new Set(['all', 'active', 'completed']);
/** Normalize URL input at the routing boundary before it reaches domain state. */
export function normalizeTaskFilter(value) {
    return value && taskFilters.has(value) ? value : 'all';
}
/**
 * Router translates URL state into an application event.
 *
 * It does not update the Model or DOM directly. That separation keeps routing
 * usable in different applications and makes browser navigation easy to test.
 */
export function createTaskRouter(documentRoot, mediator) {
    const router = new Router();
    router.scope = documentRoot.querySelector('main');
    router.mediator = mediator;
    const route = (_scope, location) => {
        mediator.emit('task:filter', normalizeTaskFilter(location.data.query.tasks));
    };
    router.routes = { '/': route, defaultRoute: route };
    return router.initialize();
}
//# sourceMappingURL=TaskRouter.js.map