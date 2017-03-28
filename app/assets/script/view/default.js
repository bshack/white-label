import React from 'react';
import ReactDOM from 'react-dom';

(() => {
    'use strict';
    module.exports = class HelloMessage extends React.Component {
        render() {
            return <div>Hello {this.props.name}</div>;
        }
    };
})();
