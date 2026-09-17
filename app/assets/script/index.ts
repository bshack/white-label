/** @module app/assets/script/index */
import {initializeTaskApplication} from './tasks/TaskApplication.js';

/** Start the feature composition for this document. */
export {initializeTaskApplication} from './tasks/TaskApplication.js';
export {normalizeTaskFilter} from './tasks/TaskRouter.js';

initializeTaskApplication(document);
