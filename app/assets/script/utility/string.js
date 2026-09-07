const parser = new DOMParser();

const integerFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
});
const currencyFormatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits: 2,
    style: 'currency'
});

function pad(number) {
    return String(number).padStart(2, '0');
}

function dateParts(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

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
            name = name.replace(/[[\]]/g, '\\$&');
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
            return dateParts(unformattedDate) || 'Invalid date';
        }

        //format the api accepts back
        formatDateAPI(unformattedDate) {
            const formattedDate = dateParts(`${unformattedDate}T00:00:00`);
            return formattedDate ? `${formattedDate}T12:00` : 'Invalid date';
        }

        formatNumber(unformattedNumber) {
            return integerFormatter.format(Number(unformattedNumber));
        }

        unformatNumber(formattedNumber) {
            return parseInt(formattedNumber, 10);
        }

        formatCurrency(unformattedCurrency) {
            return currencyFormatter.format(Number(unformattedCurrency));
        }

        unformatCurrency(formattedCurrency) {
            const number = Number(String(formattedCurrency).replace(/[^0-9.-]/g, ''));
            return Number.isFinite(number) ? number.toFixed(2) : '0.00';
        }

        formatPhoneLink(unformattedPhoneNumber) {
            return 'tel:' + unformattedPhoneNumber.replace(/\D/g,'');
        }

        formatEmailLink(unformattedEmailAddress) {
            return 'mailto:' + unformattedEmailAddress;
        }

    };
})();
