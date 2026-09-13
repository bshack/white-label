import type {TaskFilter, TaskItem, TaskState} from './task-state.js';

const filters: TaskFilter[] = ['all', 'active', 'completed'];
const taskPredicates: Record<TaskFilter, (task: TaskItem) => boolean> = {
    active: task => !task.complete,
    all: () => true,
    completed: task => task.complete
};

function escapeHtml(value: unknown): string {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/** Render the task example with plain TypeScript and HTML strings. */
export default function TaskExample({state}: {state: TaskState}): string {
    const visibleTasks = state.tasks.filter(taskPredicates[state.filter]);
    const completed = state.tasks.filter(task => task.complete).length;
    const filterLinks = filters.map(filter => `
        <a href="/?tasks=${filter}#example" data-task-filter="${filter}" data-pushstate aria-current="${state.filter === filter ? 'page' : 'false'}">${filter.charAt(0).toUpperCase()}${filter.slice(1)}</a>
    `).join('');
    const tasks = visibleTasks.map(task => `
        <li><label><input type="checkbox" ${task.complete ? 'checked ' : ''}data-task-toggle data-task-id="${task.id}"><span>${escapeHtml(task.title)}</span></label></li>
    `).join('');

    return `<section class="task-app" data-task-app aria-label="Interactive task example">
        <form class="task-form" data-task-form action="#example" method="get">
            <label for="task-title">New task</label>
            <div class="task-form__controls"><input id="task-title" name="task" type="text" autocomplete="off" required><button type="submit">Add task</button></div>
        </form>
        <nav class="task-filters" aria-label="Filter tasks">${filterLinks}</nav>
        <p class="visually-hidden" aria-live="polite" aria-atomic="true" data-task-status>Showing ${visibleTasks.length} tasks for the ${state.filter} filter.</p>
        <ul class="task-list">${tasks}</ul>
        <dl class="demo__trace" aria-label="White Label application flow">
            <div><dt>Router</dt><dd>/?tasks=${state.filter}</dd></div>
            <div><dt>Mediator</dt><dd>task:* application events</dd></div>
            <div><dt>Model</dt><dd>${state.tasks.length} tasks · ${completed} complete</dd></div>
            <div><dt>View</dt><dd>${visibleTasks.length} tasks rendered</dd></div>
        </dl>
    </section>`;
}
