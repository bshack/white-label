'use strict';

// ## Load Modules

const gulp = require('gulp');
const sassLint = require('gulp-sass-lint');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');

// ## Environment Config

const config = require('../config');

// ## Style Task Complilation Logic

const styleCompile = () => {

    return gulp.src(config.path.style.source.scss)
        //support for better error handling
        .pipe(plumber())
        //validate scss
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
        //compile sass into css
        .pipe(sass({
            indentWidth: 4,
            sourceComments: true
        }).on('error', sass.logError))
        //add browser prefixes
        .pipe(autoprefixer({
            browsers: ['last 3 versions']
        }))
        .pipe(gulp.dest(config.path.style.destination.watch))
        .on('error', notify.onError('style: <%= error.message %>'));
};

// ## Style Task

gulp.task('style', styleCompile);
