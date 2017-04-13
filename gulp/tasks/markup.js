// ## Load Modules

const gulp = require('gulp');
const htmllint = require('gulp-htmllint');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

// ## Environment Config

const config = require('../config');

// ## Markup Task
// create .html files written to app root

gulp.task('markup', () => {
    'use strict';
    //task
    return gulp.src(config.path.markup.destination)
        //support for better error handling
        .pipe(plumber())
        //validate markup
        .pipe(htmllint({
            config: config.path.markup.htmlLint
        }))
        .on('error', notify.onError('markup: <%= error.message %>'));
});
