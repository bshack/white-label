/** @module generators/app/index */
import Generator from 'yeoman-generator';
export { createProject, createSite, createSiteManifest } from '../../scaffold/index.js';
export type { CreateProjectOptions, CreateSiteOptions, ScaffoldFileSystem } from '../../scaffold/index.js';
export default class extends Generator {
    /**
     * Describe the scaffold operation through Yeoman's output adapter.
     * @returns No value.
     */
    prompting(): void;
    /**
     * Adapt Yeoman's staged filesystem to the shared project-creation API.
     * @returns A promise that resolves after the scaffold has been staged.
     */
    writing(): Promise<void>;
    /**
     * Explain the dependency-install step after Yeoman commits the scaffold.
     * @returns No value.
     */
    end(): void;
}
