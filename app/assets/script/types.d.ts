/** Browser SDK callbacks used by the optional sample adapters. */
interface Window {
    onYouTubeIframeAPIReady?: (event?: Event) => void;
    fbAsyncInit?: (event?: Event) => void;
    FB: {init(options: {appId: unknown; autoLogAppEvents: boolean; xfbml: boolean; version: string}): void; AppEvents: {logPageView(): void}};
}
