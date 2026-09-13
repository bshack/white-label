/** @module generators/app/index */
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import {createProject} from '../../scaffold/index.js';

export {createProject, createSiteManifest} from '../../scaffold/index.js';
export type {CreateProjectOptions, ScaffoldFileSystem} from '../../scaffold/index.js';

export default class extends Generator {
    /**
     * Describe the scaffold operation through Yeoman's output adapter.
     * @returns No value.
     */
    prompting() {
        this.log(yosay(`Setting up the ${chalk.red('white-label')} project.`));
    }

    /**
     * Adapt Yeoman's staged filesystem to the shared project-creation API.
     * @returns A promise that resolves after the scaffold has been staged.
     */
    async writing() {
        await createProject({
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
