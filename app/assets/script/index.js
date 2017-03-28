import 'babel-polyfill';
import modernizr from 'modernizr';
import modelGlobal from './model/singletons/global';
import Default from './view/default';
import React from 'react';
import ReactDOM from 'react-dom';

(function() {
    'use strict';
    ReactDOM.render(<Default name="Dave" />, document.querySelector('h1'));
})();
