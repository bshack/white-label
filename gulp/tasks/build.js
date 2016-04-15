'use strict';

// ## Load Modules

const gulp = require('gulp');
const runSequence = require('run-sequence');

// ## Build Task

gulp.task('build', callback => {
    //runSequence support is only for gulp 3.x, 4.x natively support this functionalty
    return runSequence(
        ['sprite', 'data'],
        ['markup', 'style', 'script', 'documentation'],
        ['accessibility'],
        callback
    );
});
