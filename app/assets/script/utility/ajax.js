(() => {
    'use strict';
    module.exports = class {
        getScript(url) {
            var newScript = document.createElement('script');
            newScript.src = url;
            newScript.async = true;
            document.getElementsByTagName('head')[0].appendChild(newScript);
        }
    };
})();
