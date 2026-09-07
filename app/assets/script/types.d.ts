/** Legacy published packages have no declarations; this describes the subset used by this generator. */
declare module 'white-label-model' {
    import {EventEmitter} from 'events';
    class Model extends EventEmitter {constructor(data?: object); get(): Record<string, unknown>}
    class Collection extends EventEmitter {constructor(data?: unknown[]); get(): unknown[]}
    const api: {Model: typeof Model; Collection: typeof Collection};
    export default api;
}
declare module 'white-label-view' {
    export default class View {parentElement?: Element; initialize(): unknown; addListeners(): unknown}
}
    interface Window {
        onYouTubeIframeAPIReady?: (event?: Event) => void;
        fbAsyncInit?: (event?: Event) => void;
        FB: {init(options: {appId: unknown; autoLogAppEvents: boolean; xfbml: boolean; version: string}): void; AppEvents: {logPageView(): void}};
    }
