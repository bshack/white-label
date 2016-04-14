'use strict';

// ## Load Modules

const gulp = require('gulp');
const htmllint = require('gulp-htmllint');
const plumber = require('gulp-plumber');
// const data = require('gulp-data');
const notify = require('gulp-notify');
// const _ = require('lodash-node');


// ## Environment Config

const config = require('../config');

// ## Markup Task
// create .html files written to app root

gulp.task('markup', () => {
    //task
    return gulp.src(config.path.markup.source)
        //support for better error handling
        .pipe(plumber())
        // .pipe(data(function(file) {
        //     let dataFile;
        //     // page specific json files are optional
        //     try {
        //         dataFile = file.path.split(config.path.root).pop().replace('.handlebars', '.json');
        //         dataFile = require('../../' + config.path.data.directory + '/' +
        //             config.path.data.pageDirectory + dataFile);
        //     } catch(err) {
        //         dataFile = {};
        //     }
        //     //return the data
        //     return _.extend(
        //         {},
        //         require('../../' + config.path.data.directory + '/' + config.path.data.pageDirectory + '/' +
        //             config.path.data.pageDefaultData),
        //         dataFile,
        //         {
        //             cdn: config.path.cdn,
        //             www: config.path.www,
        //             service: config.path.service,
        //             version: config.path.version,
        //             isProduction: config.path.isProduction
        //         }
        //     );
        // }))
        //validate markup
        .pipe(htmllint({
            config: config.path.markup.htmlLint
        }))
        .pipe(gulp.dest(config.path.root))
        .on('error', notify.onError('markup: <%= error.message %>'));
});
