import moment from 'moment';
import numeraljs from 'numeraljs';

const parser = new DOMParser();

(() => {

    'use strict';

    module.exports = class {

        //turn a string of html tags into a dom object
        toElement(string) {
            return parser
                .parseFromString(string, 'text/html')
                .body
                .firstChild
                .cloneNode(true);
        }

        //qet data from url query string
        getQueryStringParamater(name, url) {
            name = name.replace(/[\[\]]/g, '\\$&');
            let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
            let results = regex.exec(url);
            if (!results) {
                return null;
            }
            if (!results[2]) {
                return '';
            }
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }

        // 2014-11-10
        formatDate(unformattedDate) {
            return moment(unformattedDate).format('YYYY-MM-DD');
        }

        //format the api accepts back
        formatDateAPI(unformattedDate) {
            return moment(unformattedDate, 'YYYY-MM-DD').format('YYYY-MM-DDThh:mm');
        }

        formatNumber(unformattedNumber) {
            return numeraljs(unformattedNumber).format('0,0');
        }

        unformatNumber(formattedNumber) {
            return parseInt(formattedNumber, 10);
        }

        formatCurrency(unformattedCurrency) {
            return numeraljs(unformattedCurrency).format('$0,0.00');
        }

        unformatCurrency(formattedCurrency) {
            return numeraljs(formattedCurrency).format('00.00');
        }

        formatPhoneLink(unformattedPhoneNumber) {
            return 'tel:' + unformattedPhoneNumber.replace(/\D/g,'');
        }

        formatEmailLink(unformattedEmailAddress) {
            return 'mailto:' + unformattedEmailAddress;
        }

    };
})();
