export interface ScaffoldFileSystem {
    copy(source: string, destination: string): void | Promise<void>;
    writeJSON(destination: string, value: unknown): void | Promise<void>;
}
export interface CreateProjectOptions {
    destination: string;
    fileSystem?: ScaffoldFileSystem;
}
/** Compatibility name for integrations that still describe the scaffold as a site. */
export type CreateSiteOptions = CreateProjectOptions;
/** Return the package manifest used by generated White Label projects. */
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
 * Create a White Label project.
 *
 * This is the shared implementation behind every creation interface. Adapters
 * translate their environment into these options instead of owning templates or
 * project-generation behavior themselves.
 */
export declare function createProject({ destination, fileSystem }: CreateProjectOptions): Promise<void>;
/** Compatibility alias for the original scaffold API. */
export declare const createSite: typeof createProject;
