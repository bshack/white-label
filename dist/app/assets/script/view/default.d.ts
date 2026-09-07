/** @module app/assets/script/view/default */
import React from 'react';
export default class HelloMessage extends React.Component<{
    name: string;
}> {
    /**
     * Render the greeting from the component name prop.
     * @returns The greeting React element.
     */
    render(): React.JSX.Element;
}
