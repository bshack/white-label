const istanbul = require('browserify-istanbul');

module.exports = (karma) => {
    'use strict';
    karma.set({
        basePath: '',
        frameworks: [
            'jasmine',
            'browserify'
        ],
        files: [{
            pattern: 'app/assets/script/utility/*.js'
        },
        {
            pattern: 'app/assets/test/spec/*Spec.js'
        }],
        reporters: [
            'progress',
            'coverage'
        ],
        preprocessors: {
            'app/assets/script/utility/*.js': [
                'browserify'
            ],
            'app/assets/test/spec/*Spec.js': [
                'browserify'
            ]
        },
        browsers: [
            //'Chrome',
            //'Firefox',
            //'Safari',
            'PhantomJS'
        ],
        singleRun: false,
        autoWatch: false,
        browserify: {
            debug: true,
            transform: [
                'browserify-shim',
                'babelify',
                istanbul({
                    instrumenterConfig: {
                        embedSource: true
                    },
                    ignore: ['**/node_modules/**']
                })
            ]
        },
        coverageReporter: {
            type: 'html',
            dir: 'app/report/istanbul/',
            subdir: '.'
        },
        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000
    });
};
