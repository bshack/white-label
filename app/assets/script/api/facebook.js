import mediator from '../mediator/global.js';
import modelGlobal from '../model/singletons/global';
import UtilityAjax from '../utility/ajax';

const utilityAjax = new UtilityAjax();

(() => {
    'use strict';
    module.exports = class {
        initialize(url) {
            window.fbAsyncInit = function(e) {
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
            (function(d, s, id) {
                var js,
                    fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = '//connect.facebook.net/en_US/sdk.js';
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    };
})();
