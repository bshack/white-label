import React from 'react';
import ReactDOM from 'react-dom';

(() => {
    'use strict';
    module.exports = class Greeting extends React.Component {
        constructor(props) {
            super(props);
            this.props = {
                color: 'blue'
            };
        }
        render() {
            return <h1>Hello, {this.props.color}</h1>;
        }
    };
})();
