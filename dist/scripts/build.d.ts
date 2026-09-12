/** Values injected into page templates and the generated config file. */
export interface BuildConfig {
    cdn: string;
    production: boolean;
    siteUrl: string;
    version: string;
    www: string;
}
/** Read deployment flags and reject unsafe or invalid deployment values. */
export declare function parseArguments(argumentsList: string[]): BuildConfig;
/** Replace the deployment directory with compiled pages, scripts, styles, and static assets. */
export declare function build(config?: BuildConfig, projectRoot?: string): Promise<void>;
