// ## Load Modules

const gulp = require('gulp');
const prettify = require('gulp-prettify');
const handlebars = require('handlebars');
const handlebarsToHTML = require('gulp-compile-handlebars');
const handlebarsToJS = require('gulp-handlebars');
const htmllint = require('gulp-htmllint');
const rename = require('gulp-rename');
const wrapper = require('gulp-wrapper');
const plumber = require('gulp-plumber');
const data = require('gulp-data');
const notify = require('gulp-notify');
const _ = require('lodash');

// ## Environment Config

const config = require('../config');

// ## Markup Task
// create .html files written to app root

gulp.task('markup', ['cleanHTML'], () => {
    'use strict';
    //task
    return gulp.src(config.path.markup.source)
        //support for better error handling
        .pipe(plumber())
        .pipe(data((file) => {

            let configDataPath = '../../' + config.path.data.globalConfigFile;
            let globalDataPath = '../../' + config.path.data.source + '/' + config.path.data.pageDirectory +
                config.path.data.pageDefaultData;
            let pageData;

            // page specific json files are optional
            try {

                pageData = '../../app/' +
                    config.path.data.destination + '/' + config.path.data.pageDirectory +
                    file.path.split(config.path.root).pop().replace('.hbs', '.json');

                // prevent node from giving you back cached data, make it go to the disk.
                delete require.cache[require.resolve(pageData)];

                pageData = require(pageData);

            } catch(err) {
                pageData = {};
            }

            delete require.cache[require.resolve(configDataPath)];
            delete require.cache[require.resolve(globalDataPath)];

            //return the data
            return _.extend(
                {},
                require(configDataPath),
                require(globalDataPath),
                pageData
            );

        }))
        //compile the handlebars templates to html
        .pipe(handlebarsToHTML({}, {
            batch: config.path.markup.partials.source
        }))
        //validate markup
        .pipe(htmllint({
            config: config.path.markup.htmlLint
        }))
        //switch the file extension from .hbs to .html
        .pipe(rename((path) => {
            path.extname = '.html';
        }))
        //validate markup
        .pipe(prettify())
        .pipe(gulp.dest(config.path.root))
        .on('error', notify.onError('markup: <%= error.message %>'));
});

// ## markupTemplate Task
// create precomiled .js templates that return DOM objects

gulp.task('markupTemplate', () => {
    'use strict';
    return gulp.src(config.path.markup.partials.watch)
        //support for better error handling
        .pipe(plumber())
        //compile the template to javascript
        .pipe(handlebarsToJS({
            // Pass local handlebars version to keep everything on the same version
            handlebars: handlebars
        }))
        //wrap in define module and register all templates as partials
        .pipe(wrapper({
            getTemplateName: function(file) {
                return file.path.split('markup/').pop().replace('.js', '');
            },
            header: function(file){
                let templateName = this.getTemplateName(file);
                return '(function() {' +
                    'var Handlebars = require("handlebars");' +
                    'if (typeof Handlebars.templates === \'undefined\') {' +
                        'Handlebars.templates = {};'+
                    '}' +
                    'Handlebars.templates[\'' + templateName + '\'] = Handlebars.template(';
            },
            footer: function(file){
                let templateName = this.getTemplateName(file);
                return ');' +
                'Handlebars.registerPartial(\'' + templateName + '\', Handlebars.templates[\'' + templateName +'\']);' +
                'module.exports = function(data) {' +
                    'return new DOMParser().parseFromString(Handlebars.templates[\'' +
                        templateName + '\'](data).trim(), "text/html").body.firstChild.cloneNode(true);' +
                    '};' +
                '})();';
            }
        }))
        .pipe(gulp.dest(config.path.markup.partials.destination));
});

const babel = require('gulp-babel');
const renderReact = require('gulp-render-react');
const JSXLocation = 'app/*.jsx';
const compliedJSXLocation = 'app/';
const compiledJSXGlob = 'app/*.js';
const compliedHTMLLocation = 'app/';

gulp.task('compileJSX', () => {
    return gulp.src(JSXLocation)
        .pipe(babel())
        .pipe(gulp.dest(compliedJSXLocation));
});

gulp.task('markupTemplateJSX', ['compileJSX'], () => {
    return gulp.src(compiledJSXGlob, {read: false})
        .pipe(renderReact({
            type: 'markup'
        }))
        .pipe(gulp.dest(compliedHTMLLocation));
});
