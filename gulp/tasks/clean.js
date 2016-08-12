'use strict';

// ## Load Modules

const gulp = require('gulp');
const rimraf = require('rimraf');

// ## Environment Config

const config = require('../config');

// ## cleanDeploy Task

gulp.task('cleanDeploy', (done) => {
    rimraf(config.path.build, done);
});

// ## cleanTemplate Task

gulp.task('cleanTemplate', (done) => {
    'use strict';
    rimraf(config.path.markup.partials.destination, done);
});
