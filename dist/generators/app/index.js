/** @module generators/app/index */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
export default class extends Generator {
    /**
     * Describe the scaffold operation through Yeoman's output adapter.
     * @returns No value.
     */
    prompting() {
        this.log(yosay(`Setting up the ${chalk.red('white-label')} project.`));
    }
    /**
     * Copy the site sources and write a strict TypeScript build manifest into the destination.
     * @returns No value; Yeoman stages the generated files.
     */
    writing() {
        this.fs.copy(path.join(root, 'app'), this.destinationPath('app'));
        this.fs.copy(path.join(root, 'app/README.md'), this.destinationPath('README.md'));
        this.fs.copy(path.join(root, 'scripts'), this.destinationPath('scripts'));
        this.fs.copy(path.join(root, 'tsconfig.site.json'), this.destinationPath('tsconfig.json'));
        this.fs.writeJSON(this.destinationPath('package.json'), {
            name: 'white-label-site',
            version: '1.0.0',
            private: true,
            type: 'module',
            engines: { node: '^22.18.0 || >=24.11.0', npm: '>=10.0' },
            scripts: {
                build: 'tsc -p tsconfig.json && node dist/scripts/build.js',
                typecheck: 'tsc -p tsconfig.json --noEmit',
                test: 'npm run build',
                audit: 'npm audit --audit-level=low'
            },
            devDependencies: { typescript: '7.0.2', '@types/node': '24.13.3', '@types/react': '19.2.18' },
            dependencies: {
                esbuild: '0.28.2',
                events: '3.3.0',
                'bootstrap': '5.3.8',
                handlebars: '4.7.9',
                react: '19.2.8',
                'react-dom': '19.2.8',
                sass: '1.104.0',
                'white-label-model': '3.0.0',
                'white-label-view': '4.0.0'
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