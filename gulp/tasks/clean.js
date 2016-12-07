'use strict';

// ## Load Modules

const gulp = require('gulp');
const rimraf = require('gulp-rimraf');

// ## Environment Config

const config = require('../config');

// ## cleanDeploy Task

gulp.task('cleanDeploy', (done) => {
    'use strict';
    return gulp.src(config.path.build, {read: false})
        .pipe(rimraf());
});

// ## cleanTemplate Task

gulp.task('cleanTemplate', (done) => {
    'use strict';
    return gulp.src(config.path.markup.partials.destination, {read: false})
       .pipe(rimraf());
});

// ## cleanHTML Task

gulp.task('cleanHTML', (done) => {
    'use strict';
    return gulp.src(config.path.markup.destination, {read: false})
       .pipe(rimraf());
});
