import View from 'white-label-view';
import type TaskModel from './TaskModel.js';
/**
 * View owns rendering, but not application decisions.
 *
 * Passing the already-rendered task root lets View adopt useful static HTML
 * instead of replacing the document merely because JavaScript has started.
 */
export declare function createTaskView(parentElement: HTMLElement, model: TaskModel): View;
