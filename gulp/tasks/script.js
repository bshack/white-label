'use strict';

// ## Load Modules

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const browserify = require('browserify');
const notify = require('gulp-notify');
const modernizr = require('modernizr');
const fs = require('fs');
const glob = require('glob');

// ## Environment Config

const config = require('../config');

// ## Script Lint Task
// make sure the code is all tidy

gulp.task('scriptLint', () => {

    return gulp.src(config.path.script.all)
        //support for better error handling
        .pipe(plumber())
        //lint logic and code style
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on('error', notify.onError('scriptLint: <%= error.message %>'));

});

// ## Script Task
// complile the modules together, first lint .js files, then build modernizr and compile clientside templates

gulp.task('script', ['scriptLint', 'markupTemplate', 'scriptModernizr'], callback => {

    const entries = [];
    const entriesDestination = [];
    const bundleFs = fs.createWriteStream(config.path.script.entriesGlobal);

    glob(config.path.script.entries, {}, (err, files) => {

        let i;
        for (i = 0; i < files.length; i++) {
            if (files[i].search('.compiled.js') === -1) {
                entries.push(files[i]);
                entriesDestination.push(files[i].replace('.js', '.compiled.js'));
            }
        }

        browserify({
            transform: [
                'babelify'
            ],
            entries: entries,
            debug: (config.path.isProduction ? false : true),
            plugin: [['factor-bundle', {
                outputs: entriesDestination
            }]]
        })
        .bundle()
        .pipe(bundleFs)
        .on('error', notify.onError('script: <%= error.message %>'));

        // all done
        bundleFs.on('finish', function() {
            return callback();
        });

    });

});

// ## Script Modernizr Task
// build modernizr for this project.
// config example: https://github.com/Modernizr/Modernizr/blob/master/lib/config-all.json

gulp.task('scriptModernizr', callback => {

    modernizr.build({
        'feature-detects': [
            'touchevents'
        ]
    }, file => {
        fs.writeFile(config.path.script.modernizr, file, callback);
    });

});
