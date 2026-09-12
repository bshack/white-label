/** @module generators/app/index */
import Generator from 'yeoman-generator';
export default class extends Generator {
    /**
     * Describe the scaffold operation through Yeoman's output adapter.
     * @returns No value.
     */
    prompting(): void;
    /**
     * Delegate site creation to the shared scaffold API while preserving Yeoman's staged filesystem.
     * @returns A promise that resolves after the scaffold has been staged.
     */
    writing(): Promise<void>;
    /**
     * Explain the dependency-install step after Yeoman commits the scaffold.
     * @returns No value.
     */
    end(): void;
}
