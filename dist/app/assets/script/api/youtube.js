/** @module app/assets/script/api/youtube */
import mediator from '../mediator/global.js';
import UtilityAjax from '../utility/ajax.js';
const utilityAjax = new UtilityAjax();
'use strict';
export default class {
    /**
     * Load the optional SDK and emit a mediator notification from its readiness callback.
     * @param url - URL or optional adapter argument.
     * @returns No value.
     */
    initialize(url) {
        utilityAjax.getScript('//www.youtube.com/iframe_api');
        window.onYouTubeIframeAPIReady = (e) => {
            mediator.emit('youtube-api-1:state:ready', {
                event: e
            });
        };
    }
}
;
//# sourceMappingURL=youtube.js.map