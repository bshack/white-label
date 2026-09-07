/** @module app/assets/script/view/toolkit/youtube-player-1 */
import View from 'white-label-view';
export default class extends View {
    /**
     * Create an instance with its own state and listener references.
     */
    constructor();
    /**
     * Extension hook for initializing a concrete YouTube player implementation.
     * @returns This view instance for lifecycle chaining.
     */
    initialize(): this;
    /**
     * Lifecycle hook for attaching listeners owned by a subclass.
     * @returns This view instance for lifecycle chaining.
     */
    addListeners(): this;
    /**
     * Legacy misspelled extension hook retained for compatibility with existing sample subclasses.
     * @returns No value.
     */
    removeListners(): void;
}
