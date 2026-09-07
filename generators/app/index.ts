/** @module generators/app/index */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
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
        this.fs.copy(path.join(root, 'template-test'), this.destinationPath('test'));
        this.fs.copy(path.join(root, 'tsconfig.site.json'), this.destinationPath('tsconfig.json'));
        this.fs.writeJSON(this.destinationPath('package.json'), {
            name: 'white-label-site',
            version: '1.0.0',
            private: true,
            type: 'module',
            engines: {node: '^22.18.0 || >=24.11.0', npm: '>=10.0'},
            scripts: {
                build: 'tsc -p tsconfig.json && node dist/scripts/build.js',
                typecheck: 'tsc -p tsconfig.json --noEmit',
                test: 'npm run typecheck && npm run build -- --version=test --production=true --site-url=https://example.com && node --test --experimental-test-coverage --test-coverage-include=dist/app/assets/script/index.js --test-coverage-lines=100 --test-coverage-functions=100 --test-coverage-branches=100 test/*.test.js',
                audit: 'npm audit --audit-level=low'
            },
            devDependencies: {
                '@types/node': '24.13.3',
                'axe-core': '4.13.0',
                'bootstrap': '5.3.8',
                'esbuild': '0.28.2',
                'html-validate': '11.14.0',
                'jsdom': '30.0.1',
                'sass': '1.104.0',
                'typescript': '7.0.2'
            },
            dependencies: {
                eta: '4.6.0',
                'white-label-mediator': '3.0.0',
                'white-label-model': '3.0.0',
                'white-label-router': '4.0.0',
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
