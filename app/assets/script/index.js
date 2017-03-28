import 'babel-polyfill';
import modernizr from 'modernizr';
import modelGlobal from './model/singletons/global';
import ViewDefault from './view/default';
import React from 'react';
import ReactDOM from 'react-dom';

const viewDefault = new ViewDefault();

(function() {
    'use strict';
    viewDefault.render(document.querySelector('h1'));
})();
