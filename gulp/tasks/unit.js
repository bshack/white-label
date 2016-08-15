'use strict';

// ## Load Modules

const gulp = require('gulp');
const KarmaServer = require('karma').Server;

// ## Environment Config

const config = require('../config');

// ## Unit Task

gulp.task('unit', (done) => {

    //run unit tests and write out coverage
    return new KarmaServer.start({
        configFile: config.path.script.karma,
        singleRun: true
    }, function() {
        done();
    });

});

// ## Unit Watch Task

gulp.task('unitWatch', (done) => {

    //run unit tests and write out coverage
    return new KarmaServer.start({
        configFile: config.path.script.karma,
        autoWatch: true
    }, function() {
        done();
    });
    
});
