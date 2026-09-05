import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';

export default class extends Generator {
    prompting() {
        this.log(yosay(`Setting up the ${chalk.red('white-label')} project.`));
    }

    writing() {
        this.fs.copy(this.templatePath('../../../app'), this.destinationPath('app'));
        this.fs.copy(this.templatePath('../../../scripts'), this.destinationPath('scripts'));
        this.fs.writeJSON(this.destinationPath('package.json'), {
            name: 'white-label-site',
            version: '1.0.0',
            private: true,
            type: 'module',
            engines: {node: '>=20.0', npm: '>=10.0'},
            scripts: {
                build: 'node scripts/build.js',
                test: 'npm run build',
                audit: 'npm audit --audit-level=low'
            },
            dependencies: {
                esbuild: '0.28.2',
                events: '3.3.0',
                'foundation-sites': '6.9.0',
                handlebars: '4.7.9',
                lodash: '4.18.1',
                moment: '2.30.1',
                numeral: '2.0.6',
                react: '19.2.8',
                'react-dom': '19.2.8',
                sass: '1.104.0',
                'white-label-model': '1.0.37',
                'white-label-view': '2.0.3'
            }
        });
    }

    end() {
        this.log('Project created. Review package.json, then run npm install.');
    }
}
