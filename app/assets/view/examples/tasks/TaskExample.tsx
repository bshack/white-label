import type {TaskFilter, TaskItem, TaskState} from './task-state.js';

const filters: TaskFilter[] = ['all', 'active', 'completed'];
const taskPredicates: Record<TaskFilter, (task: TaskItem) => boolean> = {
    active: task => !task.complete,
    all: () => true,
    completed: task => task.complete
};

/**
 * Render the task example from state only.
 *
 * The same JSX function is used twice: once while generating the initial HTML
 * and again by white-label-view in the browser. Sharing one renderer keeps the
 * static and interactive versions of the example from drifting apart.
 */
export default function TaskExample({state}: {state: TaskState}) {
    const visibleTasks = state.tasks.filter(taskPredicates[state.filter]);
    const completed = state.tasks.filter(task => task.complete).length;

    return (
        <section className="task-app" data-task-app aria-label="Interactive task example">
            <form className="task-form" data-task-form action="#example" method="get">
                <label htmlFor="task-title">New task</label>
                <div className="task-form__controls">
                    <input id="task-title" name="task" type="text" autocomplete="off" required />
                    <button type="submit">Add task</button>
                </div>
            </form>

            <nav className="task-filters" aria-label="Filter tasks">
                {filters.map(filter => (
                    <a
                        href={`/?tasks=${filter}#example`}
                        data-task-filter={filter}
                        data-pushstate
                        aria-current={state.filter === filter ? 'page' : 'false'}
                    >
                        {filter.charAt(0).toUpperCase()}{filter.slice(1)}
                    </a>
                ))}
            </nav>

            <p className="visually-hidden" aria-live="polite" aria-atomic="true" data-task-status>
                Showing {visibleTasks.length} tasks for the {state.filter} filter.
            </p>

            <ul className="task-list">
                {visibleTasks.map(task => (
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={task.complete}
                                data-task-toggle
                                data-task-id={task.id}
                            />
                            <span>{task.title}</span>
                        </label>
                    </li>
                ))}
            </ul>

            <dl className="demo__trace" aria-label="White Label application flow">
                <div><dt>Router</dt><dd>/?tasks={state.filter}</dd></div>
                <div><dt>Mediator</dt><dd>task:* application events</dd></div>
                <div><dt>Model</dt><dd>{state.tasks.length} tasks · {completed} complete</dd></div>
                <div><dt>View</dt><dd>{visibleTasks.length} tasks rendered</dd></div>
            </dl>
        </section>
    );
}
