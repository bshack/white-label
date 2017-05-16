'use strict';

// ## Load Modules

const gulp = require('gulp');
const jsdoc = require('gulp-jsdoc3');

// ## Environment Config

const config = require('../config');
const jsdocConfig = require('../../jsdoc');

// ## jsdoc Task
// runs jsdoc
gulp.task('jsdoc', (callback) => {
    gulp.src(config.path.script.all, {read: false})
        .pipe(jsdoc(jsdocConfig, callback));
});

// ## Documenation Task
// documentation task runs unit testing coverage and also js documentation
gulp.task('documentation', [
    'jsdoc',
    'unit'
]);
