/** @module app/assets/script/utility/ajax */
'use strict';
    export default class {
        /**
         * Append an asynchronous script element; callers decide when third-party code is needed.
         * @param url - URL or optional adapter argument.
         * @returns No value; the browser loads the appended script asynchronously.
         */
        getScript(url: string) {
            var newScript = document.createElement('script');
            newScript.src = url;
            newScript.async = true;
            document.getElementsByTagName('head')[0].appendChild(newScript);
        }
    };
