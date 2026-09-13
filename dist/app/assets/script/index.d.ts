/**
 * Browser entry points should stay small.
 *
 * The task application owns its own composition and lifecycle, so the entry
 * module has one obvious responsibility: start the feature for this document.
 */
export { initializeTaskApplication } from './tasks/TaskApplication.js';
export { normalizeTaskFilter } from './tasks/TaskRouter.js';
