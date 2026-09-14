import TaskExample from '../examples/tasks/TaskExample.js';
import {createInitialTaskState, describeTaskStatus} from '../examples/tasks/task-state.js';

/**
 * The initial task UI is rendered at build time with the same JSX used later
 * by white-label-view in the browser. JavaScript adds behavior; it does not
 * need to invent the initial document.
 */
export default function LiveExampleSection() {
    const state = createInitialTaskState();

    return (
        <section className="section" id="example" aria-labelledby="example-title">
            <div className="container">
                <div className="section-intro">
                    <p className="eyebrow">Live example</p>
                    <h2 id="example-title">Four packages. One small application.</h2>
                    <p>Add a task, toggle its state, or change the filter. Router translates the URL into intent, Mediator coordinates actions, Model owns state, and View keeps the interface in sync.</p>
                </div>
                <div className="demo" data-task-example>
                    <TaskExample state={state} />
                    <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-task-status>
                        {describeTaskStatus(state)}
                    </p>
                </div>
            </div>
        </section>
    );
}
