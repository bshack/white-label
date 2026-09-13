/**
 * Return fresh demo data for each application instance.
 *
 * A factory avoids sharing mutable state between tests, pages, or future
 * server-side renders while keeping the initial HTML deterministic.
 */
export function createInitialTaskState() {
    return {
        filter: 'all',
        tasks: [
            { complete: true, id: 1, title: 'Read the architecture' },
            { complete: false, id: 2, title: 'Build something with White Label' }
        ]
    };
}
//# sourceMappingURL=task-state.js.map