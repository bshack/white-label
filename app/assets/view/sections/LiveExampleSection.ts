import {html} from 'white-label-view/html';
import TaskExample from '../examples/tasks/TaskExample.js';
import {createInitialTaskState, describeTaskStatus} from '../examples/tasks/task-state.js';

/** Render useful initial HTML with the same tagged template reused by Browser View. */
export default function LiveExampleSection() {
    const state = createInitialTaskState();

    return html`<section class="section" id="example" aria-labelledby="example-title">
            <div class="container">
                <div class="section-intro">
                    <p class="eyebrow">Live example</p>
                    <h2 id="example-title">Four packages. One small application.</h2>
                    <p>Add a task, toggle its state, or change the filter. Router translates the URL into intent, Mediator coordinates actions, Model owns state, and View keeps the interface in sync.</p>
                </div>
                <div class="demo" data-task-example>
                    ${TaskExample({state})}
                    <p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-task-status>
                        ${describeTaskStatus(state)}
                    </p>
                </div>
            </div>
        </section>`;
}
