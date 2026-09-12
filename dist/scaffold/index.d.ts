export interface ScaffoldFileSystem {
    copy(source: string, destination: string): void | Promise<void>;
    writeJSON(destination: string, value: unknown): void | Promise<void>;
}
export interface CreateSiteOptions {
    destination: string;
    fileSystem?: ScaffoldFileSystem;
}
/** Return the package manifest used by generated White Label sites. */
export declare function createSiteManifest(): {
    name: string;
    version: string;
    private: boolean;
    type: string;
    engines: {
        node: string;
        npm: string;
    };
    scripts: {
        build: string;
        typecheck: string;
        test: string;
        audit: string;
    };
    devDependencies: {
        '@tailwindcss/cli': string;
        '@types/node': string;
        'axe-core': string;
        esbuild: string;
        'html-validate': string;
        jsdom: string;
        tailwindcss: string;
        typescript: string;
    };
    dependencies: {
        'white-label-mediator': string;
        'white-label-model': string;
        'white-label-router': string;
        'white-label-view': string;
    };
};
/**
 * Create a White Label site without requiring Yeoman.
 *
 * A custom filesystem adapter may be supplied by integrations that stage writes,
 * such as the Yeoman wrapper. Direct callers use Node's filesystem by default.
 */
export declare function createSite({ destination, fileSystem }: CreateSiteOptions): Promise<void>;
