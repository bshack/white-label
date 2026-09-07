/** @module app/assets/script/toolkit */
import APIYoutube from './api/youtube.js';



    // Avoid downloading the third-party API on toolkit pages that have no player.
    if (document.querySelector('.youtube-player-1')) {
        new APIYoutube().initialize();
    }

export {};
