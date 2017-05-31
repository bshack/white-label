import 'babel-polyfill';
import modernizr from 'modernizr';
import mediator from './mediator/global';
import APIYoutube from './api/youtube';
import ViewYoutubePlayer1 from './view/toolkit/youtube-player-1';

const apiYoutube = new APIYoutube();

(function() {
    'use strict';
    apiYoutube.initialize();
})();
