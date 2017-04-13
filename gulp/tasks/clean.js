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
