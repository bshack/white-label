/** Values injected into page templates and the generated config file. */
export interface BuildConfig {
    cdn: string;
    production: boolean;
    service: string;
    version: string;
    www: string;
}
/**
 * Read deployment flags and reject version strings that contain path separators.
 * @param argumentsList - Command-line arguments excluding the Node executable and script.
 * @returns Deployment configuration with defaults for omitted flags.
 * @throws When input does not satisfy the documented contract.
 */
export declare function parseArguments(argumentsList: string[]): BuildConfig;
/**
 * Replace the project deployment directory with compiled pages, scripts, styles, and static assets.
 * @param config - Validated deployment or database configuration.
 * @param projectRoot - Project containing app sources and installed dependencies.
 * @returns A promise resolving after the deployment directory has been rebuilt.
 */
export declare function build(config?: BuildConfig, projectRoot?: string): Promise<void>;
