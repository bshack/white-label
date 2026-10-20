import {Model} from 'white-label-model';
import type {TaskFilter, TaskState} from '../../view/examples/tasks/task-state.js';

/**
 * Task state lives in a Model, not in the DOM or the Router.
 *
 * The small methods below give the rest of the app meaningful operations. Each one calls `update()`, so listeners
 * (here, the View) are notified as with any other Model change. Each returns `false` when nothing changed.
 */
export default class TaskModel extends Model<TaskState> {
    /** Add an incomplete task. Blank titles are ignored. */
    add(title: string): boolean {
        const trimmed = title.trim();
        if (!trimmed) {return false;}
        const state = this.get();
        const nextId = Math.max(0, ...state.tasks.map(task => task.id)) + 1;
        return this.update({tasks: [...state.tasks, {complete: false, id: nextId, title: trimmed}]});
    }

    /** Flip a task between complete and incomplete. Unknown ids are ignored. */
    toggle(id: number): boolean {
        const state = this.get();
        const index = state.tasks.findIndex(task => task.id === id);
        if (index < 0) {return false;}
        const tasks = [...state.tasks];
        const task = tasks[index]!;
        tasks[index] = {...task, complete: !task.complete};
        return this.update({tasks});
    }

    /** Choose which tasks are visible. */
    setFilter(filter: TaskFilter): boolean {
        return this.update({filter});
    }
}
