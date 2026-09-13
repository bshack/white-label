/** @module app/assets/script/index */
import {initializeTaskApplication} from './tasks/TaskApplication.js';

export {initializeTaskApplication} from './tasks/TaskApplication.js';
export {normalizeTaskFilter} from './tasks/TaskRouter.js';

initializeTaskApplication(document);
