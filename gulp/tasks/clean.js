'use strict';

// ## Load Modules

const gulp = require('gulp');
const rimraf = require('gulp-rimraf');
const plumber = require('gulp-plumber');

// ## Environment Config

const config = require('../config');

// ## cleanDeploy Task

gulp.task('cleanDeploy', () => {
    return gulp.src(config.path.build, {read: false})
        //support for better error handling
        .pipe(plumber())
        // delete the build directory
        .pipe(rimraf());
});
