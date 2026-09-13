import { Model } from 'white-label-model';
import type { TaskFilter, TaskState } from '../../view/examples/tasks/task-state.js';
/**
 * Domain state belongs in Model, not in the DOM or router.
 *
 * Extending Model with small domain methods gives application code meaningful
 * operations while preserving White Label's observable state contract.
 */
export default class TaskModel extends Model<TaskState> {
    add(title: string): boolean;
    toggle(id: number): boolean;
    setFilter(filter: TaskFilter): boolean;
}
