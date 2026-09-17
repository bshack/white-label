import {attributes, html} from 'white-label-view/html';
import {getVisibleTasks, type TaskFilter, type TaskState} from './task-state.js';

const filters: TaskFilter[] = ['all', 'active', 'completed'];

/** Render the task example from state for both build-time HTML and browser updates. */
export default function TaskExample({state}: {state: TaskState}) {
    const visibleTasks = getVisibleTasks(state);
    const completed = state.tasks.filter(task => task.complete).length;

    return html`
        <section class="task-app" data-task-app aria-label="Interactive task example">
            <form class="task-form" data-task-form action="#example" method="get">
                <label for="task-title">New task</label>
                <div class="task-form__controls">
                    <input id="task-title" name="task" type="text" autocomplete="off" required>
                    <button type="submit">Add task</button>
                </div>
            </form>

            <nav class="task-filters" aria-label="Filter tasks">
                ${filters.map(filter => html`
                    <a ${attributes({
                        href: `/?tasks=${filter}#example`,
                        'data-task-filter': filter,
                        'data-pushstate': true,
                        'aria-current': state.filter === filter ? 'page' : 'false'
                    })}>${filter.charAt(0).toUpperCase()}${filter.slice(1)}</a>
                `)}
            </nav>

            <ul class="task-list">
                ${visibleTasks.map(task => html`
                    <li>
                        <label>
                            <input ${attributes({
                                type: 'checkbox',
                                checked: task.complete,
                                'data-task-toggle': true,
                                'data-task-id': task.id
                            })}>
                            <span>${task.title}</span>
                        </label>
                    </li>
                `)}
            </ul>

            <dl class="demo__trace">
                <div><dt>Router</dt><dd>/?tasks=${state.filter}</dd></div>
                <div><dt>Mediator</dt><dd>task:* application events</dd></div>
                <div><dt>Model</dt><dd>${state.tasks.length} tasks · ${completed} complete</dd></div>
                <div><dt>View</dt><dd>${visibleTasks.length} tasks rendered</dd></div>
            </dl>
        </section>
    `;
}
