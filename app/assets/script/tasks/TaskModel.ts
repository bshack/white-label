import {Model} from 'white-label-model';
import type {TaskFilter, TaskState} from '../../view/examples/tasks/task-state.js';

/**
 * Domain state belongs in Model, not in the DOM or router.
 *
 * Extending Model with small domain methods gives application code meaningful
 * operations while preserving White Label's observable state contract.
 */
export default class TaskModel extends Model<TaskState> {
    add(title: string): boolean {
        const trimmed = title.trim();
        if (!trimmed) {return false;}
        const state = this.get();
        const nextId = Math.max(0, ...state.tasks.map(task => task.id)) + 1;
        return this.update({tasks: [...state.tasks, {complete: false, id: nextId, title: trimmed}]});
    }

    toggle(id: number): boolean {
        const state = this.get();
        const index = state.tasks.findIndex(task => task.id === id);
        if (index < 0) {return false;}
        const tasks = [...state.tasks];
        const task = tasks[index];
        if (!task) {return false;}
        tasks[index] = {...task, complete: !task.complete};
        return this.update({tasks});
    }

    setFilter(filter: TaskFilter): boolean {
        return this.update({filter});
    }
}
