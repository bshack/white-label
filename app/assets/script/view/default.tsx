/** @module app/assets/script/view/default */
import React from 'react';


'use strict';
    export default class HelloMessage extends React.Component<{name: string}> {
        /**
         * Render the greeting from the component name prop.
         * @returns The greeting React element.
         */
        render() {
            return <div>Hello {this.props.name}</div>;
        }
    };
