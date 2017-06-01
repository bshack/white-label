import View from 'white-label-view';
// import myTemplate from '../template/element/a';

(() => {
    'use strict';
    module.exports = class extends View {
        constructor() {
            super();
            this.parentElement = document.querySelector('body');
        }
        initialize() {
        }
        addListeners() {
        }
        removeListners() {
        }
    };
})();
