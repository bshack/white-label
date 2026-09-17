/** Shared state shape used by build-time tagged HTML and the browser application. */
export type TaskFilter = 'all' | 'active' | 'completed';

export interface TaskItem {
    complete: boolean;
    id: number;
    title: string;
}

export interface TaskState extends Record<PropertyKey, unknown> {
    filter: TaskFilter;
    tasks: TaskItem[];
}

const taskPredicates: Record<TaskFilter, (task: TaskItem) => boolean> = {
    active: task => !task.complete,
    all: () => true,
    completed: task => task.complete
};

/** Return the tasks visible for the current filter. */
export function getVisibleTasks(state: TaskState): TaskItem[] {
    return state.tasks.filter(taskPredicates[state.filter]);
}

/** Describe the currently rendered task result for assistive technology. */
export function describeTaskStatus(state: TaskState): string {
    const visible = getVisibleTasks(state).length;
    return `Showing ${visible} ${visible === 1 ? 'task' : 'tasks'} for the ${state.filter} filter.`;
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
