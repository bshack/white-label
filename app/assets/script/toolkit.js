import APIYoutube from './api/youtube';

(function() {
    'use strict';
    // Avoid downloading the third-party API on toolkit pages that have no player.
    if (document.querySelector('.youtube-player-1')) {
        new APIYoutube().initialize();
    }
})();
