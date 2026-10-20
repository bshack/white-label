/**
 * Browser entry point, bundled to `index.compiled.js`. It starts the task example on the current page. The exports
 * exist so tests can reach the same modules the bundle uses.
 *
 * @module app/assets/script/index
 */
import {initializeTaskApplication} from './tasks/TaskApplication.js';

export {initializeTaskApplication} from './tasks/TaskApplication.js';
export {normalizeTaskFilter} from './tasks/TaskRouter.js';

initializeTaskApplication(document);
