/** Shared state shape used by build-time JSX and the browser application. */
export type TaskFilter = 'all' | 'active' | 'completed';

export interface TaskItem {
    complete: boolean;
    id: number;
    title: string;
}

export interface TaskState {
    filter: TaskFilter;
    tasks: TaskItem[];
}

/**
 * Return fresh demo data for each application instance.
 *
 * A factory avoids sharing mutable state between tests, pages, or future
 * server-side renders while keeping the initial HTML deterministic.
 */
export function createInitialTaskState(): TaskState {
    return {
        filter: 'all',
        tasks: [
            {complete: true, id: 1, title: 'Read the architecture'},
            {complete: false, id: 2, title: 'Build something with White Label'}
        ]
    };
}
