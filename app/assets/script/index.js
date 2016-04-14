import 'babel-polyfill';
import 'modernizr';
import React from 'react';
import ReactDOM from 'react-dom';
import HelloMessage from './template/hello';

(function() {
    'use strict';
    window.console.log(HelloMessage, React, ReactDOM, HelloMessage);
    ReactDOM.render(<HelloMessage name="John" />, document.body);
})();
