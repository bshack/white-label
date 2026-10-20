// Task state types and helpers, shared by the build-time HTML and the browser application.

/** Which tasks to show. */
export type TaskFilter = 'all' | 'active' | 'completed';

/** One task. */
export interface TaskItem {
    complete: boolean;
    id: number;
    title: string;
}

/** Everything the task example renders from. */
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

/** Text for the live status region, announced by screen readers when the list changes. */
export function describeTaskStatus(state: TaskState): string {
    const visible = getVisibleTasks(state).length;
    return `Showing ${visible} ${visible === 1 ? 'task' : 'tasks'} for the ${state.filter} filter.`;
}

/**
 * Return a new copy of the demo tasks. A function rather than a shared constant, so one page, test, or server render
 * cannot change another's state, while the initial HTML stays the same every time.
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
