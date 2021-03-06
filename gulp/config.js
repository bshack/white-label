(() => {

    'use strict';

    // ## Load Modules

    const yargs = require('yargs').argv;

    // ## Environment Config

    let isProduction;
    if (yargs.production) {
        isProduction = yargs.production;
    } else {
        isProduction = false;
    }

    // setting the build version
    let version;
    if (yargs.version) {
        version = yargs.version;
    } else {
        //by default set the version to a timestamp
        version = Math.floor(new Date() / 1000);
    }

    //setting a www domain for build
    let www;
    //test if www is defined
    if (yargs.www) {
        www = yargs.www + '/';
    } else {
        www = '/';
    }

    //setting a cdn domain for build
    let cdn;
    //test if cdn is defined
    if (yargs.cdn) {
        cdn = yargs.cdn + '/release/' + version + '/';
    } else {
        cdn = '/';
    }

    //setting a service domain for build
    let service;
    //test if www is defined
    if (yargs.service) {
        service = yargs.service + '/';
    } else {
        service = '/service-endpoint/';
    }

    // ## paths
    module.exports = {
        // ## Path Variables
        path: {
            // ### build
            // where to save deployable files
            build: '_deploy',
            root: 'app/',
            version: version,
            www: www,
            cdn: cdn,
            service: service,
            proxy: {
                target: 'http://127.0.0.1:8000/service-endpoint',
                rewrite: {
                    '/service-endpoint': '/'
                }
            },
            // is this a production build?
            isProduction: isProduction,
            // ### image
            image: {
                // glob of all image files and directories
                source: [
                    'app/assets/image/**'
                ],
                // location to save processed images by tasks
                destination: 'assets/image'
            },
            // ### markup
            markup: {
                // htmllint config file
                htmlLint: '.htmllintrc',
                // glob of handlebars templates
                source: [
                    'app/**/*.hbs',
                    'app/**/*.handlebars',
                    '!app/assets/**',
                    '!app/report/**',
                    '!app/service/**'
                ],
                // glob of generated html files
                destination: [
                    'app/**/*.html',
                    '!app/assets/**',
                    '!app/report/**',
                    '!app/service/**'
                ],
                partials: {
                    //glob of handlebars partials
                    source: [
                        'app/assets/markup'
                    ],
                    // glob of handlebars partials, needed for watch task
                    watch: 'app/assets/markup/**',
                    // where to save generated js templates
                    destination: 'app/assets/script/template'
                }
            },
            // ### font
            font: {
                // glob of fonts
                source: 'app/assets/font/**',
                // where to save fonts
                destination: 'assets/font'
            },
            // ### script
            script: {
                // karma test runner conig file
                karma: __dirname + '/../karma.conf.js',
                // where to save out the modernizr built file
                modernizr: 'node_modules/modernizr/modernizr.js',
                // glob of all js files including gulp and application
                all: [
                    '*.js',
                    'gulp/tasks/*.js',
                    'gulp/*.js',
                    'app/assets/script/**',
                    'app/assets/test/spec/*.js',
                    'app/assets/test/*.js',
                    '!app/assets/script/template/**',
                    '!app/assets/script/*.compiled.js'
                ],
                // glob of only gulp js files for documentation task
                gulp: [
                    '*.js',
                    'gulp/tasks/*.js',
                    'gulp/*.js'
                ],
                // glob of only application files for documentation task
                source: [
                    'app/assets/script/*.js',
                    'app/assets/script/**',
                    '!app/assets/script/template/**',
                    '!app/assets/script/*.compiled.js'
                ],
                // glob js files to be delployed duirng release
                release: 'app/assets/script/*.compiled.js',
                // file to be compliled by browserify
                compile: {
                    source: 'app/assets/script/global.js',
                    destination: 'app/assets/script',
                    filename: 'global.compiled.js'
                },
                // where to save script files in release task
                destination: 'assets/script',
                // common libraries found when browserify builds entries
                entriesGlobal: 'app/assets/script/global.compiled.js',
                // browserify entries
                entries: 'app/assets/script/*.js'
            },
            // ### style
            style: {
                // scsslint config file
                scssLint: '.scss-lint.yml',
                source: {
                    // glob of all scss files
                    scss: [
                        'app/assets/style/*.scss',
                        'app/assets/style/**/*.scss'
                    ],
                    // glob of all css files
                    css: [
                        'app/assets/style/*.css'
                    ]
                },
                // where to save style files
                destination: {
                    watch: 'app/assets/style',
                    release: 'assets/style'
                }
            },
            // ### font
            data: {
                // where to save data returns glob
                sourceGlob: 'app/assets/data/**',
                // where to save data
                source: 'app/assets/data',
                // where to save data
                destination: 'assets/data',
                // global config data
                globalConfig: {
                    'www': www,
                    'cdn': cdn,
                    'service': service,
                    'version': version
                },
                // global config file name
                globalConfigFile: 'app/assets/data/config.json',
                pageDirectory: 'view/',
                pageDefaultData: 'global.json'
            },
            // ### release
            release: {
                destination: '/release/',
                copy: [
                    'app/sitemap.xml',
                    'app/robots.txt',
                    'app/favicon.ico'
                ]
            },
            // ### report
            report: {
                // where to save code complexity report
                source: 'app/report/**',
                destination: 'report'
            }
        }
    };

})();
