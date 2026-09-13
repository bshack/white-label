import type { TaskState } from './task-state.js';
/**
 * Render the task example from state only.
 *
 * The same JSX function is used twice: once while generating the initial HTML
 * and again by white-label-view in the browser. Sharing one renderer keeps the
 * static and interactive versions of the example from drifting apart.
 */
export default function TaskExample({ state }: {
    state: TaskState;
}): import("white-label-view/jsx-runtime").JSXMarkup;
