import mediator from '../mediator/global.js';
import UtilityAjax from '../utility/ajax';

const utilityAjax = new UtilityAjax();

(() => {
    'use strict';
    module.exports = class {
        initialize(url) {
            utilityAjax.getScript('//www.youtube.com/iframe_api');
            window.onYouTubeIframeAPIReady = (e) => {
                mediator.emit('youtube-api-1:state:ready', {
                    event: e
                });
            }
        }
    };
})();
