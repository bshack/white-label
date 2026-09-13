import TaskExample from '../examples/tasks/TaskExample.js';
import {createInitialTaskState} from '../examples/tasks/task-state.js';

/**
 * The initial task UI is rendered at build time with the same JSX used later
 * by white-label-view in the browser. JavaScript adds behavior; it does not
 * need to invent the initial document.
 */
export default function LiveExampleSection() {
    return (
        <section className="section" id="example" aria-labelledby="example-title">
            <div className="container">
                <div className="section-intro">
                    <p className="eyebrow">Live example</p>
                    <h2 id="example-title">Four packages. One small application.</h2>
                    <p>Add a task, toggle its state, or change the filter. Router translates the URL into intent, Mediator coordinates actions, Model owns state, and View keeps the interface in sync.</p>
                </div>
                <div className="demo" data-task-example>
                    <TaskExample state={createInitialTaskState()} />
                </div>
            </div>
        </section>
    );
}
