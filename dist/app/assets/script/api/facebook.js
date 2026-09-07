/** @module app/assets/script/api/facebook */
import mediator from '../mediator/global.js';
import modelGlobal from '../model/singletons/global.js';
'use strict';
export default class {
    /**
     * Load the optional SDK and emit a mediator notification from its readiness callback.
     * @param url - URL or optional adapter argument.
     * @returns No value.
     */
    initialize(url) {
        window.fbAsyncInit = function (e) {
            window.FB.init({
                appId: modelGlobal.get().appId || null,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v2.9'
            });
            window.FB.AppEvents.logPageView();
            mediator.emit('facebook-api-1:state:ready', {
                event: e
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.src = '//connect.facebook.net/en_US/sdk.js';
            if (fjs?.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
            }
            else {
                d.head.appendChild(js);
            }
        }(document, 'script', 'facebook-jssdk'));
    }
}
;
//# sourceMappingURL=facebook.js.map