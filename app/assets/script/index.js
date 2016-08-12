import 'babel-polyfill';
import modernizr from 'modernizr';
import modelGlobal from './model/singletons/global';
import template from './template/element/a';

(function() {
    'use strict';
    window.console.log(template({
        title: 'foo'
    }));
})();
