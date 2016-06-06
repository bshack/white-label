import 'babel-polyfill';
import modernizr from 'modernizr';
import modelGlobal from './model/global';

(function() {
    'use strict';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            if(xmlhttp.status == 200){
                window.console.log(JSON.parse(xmlhttp.responseText));
            } else if(xmlhttp.status == 400) {
                window.console.log('400 error');
            } else {
                window.console.log('error');
            }
        }
    };
    xmlhttp.open('GET', modelGlobal.get().www + 'assets/data/config.json', true);
    xmlhttp.send();
})();
