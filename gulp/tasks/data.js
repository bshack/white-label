'use strict';

// ## Load Modules

const gulp = require('gulp');
const fs = require('fs');

// ## Environment Config

const config = require('../config');

// ## Data Write Config json Task

gulp.task('data', callback => {

    fs.writeFile(
        config.path.data.globalConfigFile,
        JSON.stringify(config.path.data.globalConfig),
        callback
    );

});
