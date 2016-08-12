import View from 'white-label-view';

(() => {
    'use strict';
    module.exports = class extends View {
        initialize(parentElement) {
            //setup the view
            this.element = this.template();
            this.parentElement = parentElement;
            this.model = {
                foo: 'bar'
            }
            return this;
        }
        destroy() {
            //tear down the view
            return this;
        }
        template() {
            //holds the client side template, currently just stubed out to return main
            return document.querySelector('main');
        }
        render() {
            //render html changes
            return this;
        }
        addListeners() {
            //bind events
            return this;
        }
        removeListeners() {
            //unbind events
            return this;
        }
    };
})();
