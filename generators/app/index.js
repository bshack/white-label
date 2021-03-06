'use strict';

// ## Load Modules
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

// ## Setup
module.exports = class extends Generator {
    prompting() {
        this.log(yosay(
            'Setting up ' + chalk.red('generator-shackstack') + ' generator.'
        ));
    }
    writing() {
        //copy over the site files
        this.fs.copy(
            this.templatePath('../../../app/**'),
            this.destinationPath('./app')
        );
        //copy over the tasks
        this.fs.copy(
            this.templatePath('../../../gulp/**'),
            this.destinationPath('./gulp')
        );
        //copy over the root files
        this.fs.copy(
            this.templatePath('../../../*.*'),
            this.destinationPath('./')
        );
        //copy over hidden files
        this.fs.copy(
            this.templatePath('../../../.*'),
            this.destinationPath('./')
        );
    }
    install() {
        this.installDependencies({
            bower: false,
            npm: true
        });
    }
};
