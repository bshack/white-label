/** @module generators/app/index */
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import { createSite } from '../../scaffold/index.js';
export default class extends Generator {
    /**
     * Describe the scaffold operation through Yeoman's output adapter.
     * @returns No value.
     */
    prompting() {
        this.log(yosay(`Setting up the ${chalk.red('white-label')} project.`));
    }
    /**
     * Delegate site creation to the shared scaffold API while preserving Yeoman's staged filesystem.
     * @returns A promise that resolves after the scaffold has been staged.
     */
    async writing() {
        await createSite({
            destination: this.destinationRoot(),
            fileSystem: {
                copy: (source, destination) => {
                    this.fs.copy(source, destination);
                },
                writeJSON: (destination, value) => {
                    this.fs.writeJSON(destination, value);
                }
            }
        });
    }
    /**
     * Explain the dependency-install step after Yeoman commits the scaffold.
     * @returns No value.
     */
    end() {
        this.log('Project created. Review package.json, then run npm install.');
    }
}
//# sourceMappingURL=index.js.map