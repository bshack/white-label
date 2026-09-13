import type Router from 'white-label-router';
import type View from 'white-label-view';
import { type TaskMediator } from './TaskMediator.js';
import TaskModel from './TaskModel.js';
/** Public handles make the example straightforward to test and tear down. */
export interface TaskApplication {
    mediator: TaskMediator;
    model: TaskModel;
    router: Router;
    view: View;
    destroy(): void;
}
/**
 * Compose the application at one explicit boundary.
 *
 * This is the only module that knows every moving part. Model, View, Router,
 * and Mediator stay independently understandable, while this file documents
 * the small amount of wiring needed to make them cooperate in a real feature.
 */
export declare function initializeTaskApplication(documentRoot: Document): TaskApplication;
