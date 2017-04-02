import React from 'react';
import ReactDOM from 'react-dom';
//import ViewDefault from './assets/script/view/default'

(() => {
    'use strict';
    module.exports = class HelloMessage extends React.Component {
        render() {
            return <html><body><p>Hello, world!!</p></body></html>;
        }
    };
})();
