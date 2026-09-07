import Generator from 'yeoman-generator';
export default class extends Generator {
    /**
     * Describe the scaffold operation through Yeoman's output adapter.
     * @returns No value.
     */
    prompting(): void;
    /**
     * Copy the site sources and write a strict TypeScript build manifest into the destination.
     * @returns No value; Yeoman stages the generated files.
     */
    writing(): void;
    /**
     * Explain the dependency-install step after Yeoman commits the scaffold.
     * @returns No value.
     */
    end(): void;
}
