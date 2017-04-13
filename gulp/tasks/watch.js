'use strict';

// ## Load Modules

const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const proxy = require('http-proxy-middleware');

// ## Environment Config

const config = require('../config');

// ## Reload

const reload = () => {
    return browsersync.reload();
};

// ## Watch Task

// these workaround for browsersync and gulp 3.x, when 4.x is released this should be revisted
gulp.task('markup-watch', ['markup'], reload);
gulp.task('style-watch', ['style'], reload);
gulp.task('script-watch', ['script'], reload);
gulp.task('image-watch', reload);
gulp.task('data-watch', ['script'], reload);

// ### Starup the Browsersync server

gulp.task('watch', ['build'], () => {

    //start up Browsersync
    browsersync.init({
        //proxy: 'localhost'
        server: {
            baseDir: config.path.root,
            middleware: [
                proxy(config.path.service, {
                    target: config.path.proxy.target,
                    pathRewrite: config.path.proxy.rewrite,
                    changeOrigin: true
                })
            ]
        }
    });

    //watch scss
    gulp.watch(
        config.path.style.source.scss,
        ['style-watch']
    );

    //watch js
    gulp.watch(
        config.path.script.all,
        ['script-watch']
    );

    // watch handlebars templates
    gulp.watch(
        config.path.markup.destination,
        ['markup-watch']
    );

    //watch images
    gulp.watch(
        config.path.image.source,
        ['image-watch']
    );

    //watch data
    gulp.watch(
        config.path.data.sourceGlob,
        ['data-watch']
    );

});
