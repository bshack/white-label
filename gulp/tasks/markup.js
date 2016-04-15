'use strict';

// ## Load Modules

const gulp = require('gulp');
const htmllint = require('gulp-htmllint');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

// ## Environment Config

const config = require('../config');

// ## Markup Task
// lint html

gulp.task('markup', () => {
    //task
    return gulp.src(config.path.markup.source)
        //support for better error handling
        .pipe(plumber())
        //validate markup
        .pipe(htmllint({
            config: config.path.markup.htmlLint
        }))
        .pipe(gulp.dest(config.path.root))
        .on('error', notify.onError('markup: <%= error.message %>'));
});
