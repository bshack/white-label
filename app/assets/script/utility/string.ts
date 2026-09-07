/** @module app/assets/script/utility/string */
const parser = new DOMParser();

const integerFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
});
const currencyFormatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits: 2,
    style: 'currency'
});

/**
 * Format a numeric date component with at least two digits.
 * @param number - Numeric value to inspect or format.
 * @returns A string containing at least two digits.
 */
function pad(number: number) {
    return String(number).padStart(2, '0');
}

/**
 * Format a valid date using local calendar components, or return null for invalid input.
 * @param value - Value to find or format.
 * @returns YYYY-MM-DD in local time, or null for invalid input.
 */
function dateParts(value: string | number | Date) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

'use strict';

    export default class {

        //turn a string of html tags into a dom object
        /**
         * Parse trusted HTML and clone its first root node; reject empty markup.
         * @param string - Trusted HTML containing at least one root node.
         * @returns A clone of the first parsed root node.
         * @throws When input does not satisfy the documented contract.
         */
        toElement(string: string) {
            const element = parser.parseFromString(string, 'text/html').body.firstChild;
            if (!element) throw new TypeError('HTML must contain a root node');
            return element.cloneNode(true);
        }

        //qet data from url query string
        /**
         * Read and decode a query value, returning null when absent and an empty string when valueless.
         * @param name - Resource, field, or parameter name.
         * @param url - URL or optional adapter argument.
         * @returns The decoded value, an empty string, or null when absent.
         */
        getQueryStringParamater(name: string, url: string) {
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
        /**
         * Format a local calendar date as YYYY-MM-DD or return Invalid date.
         * @param unformattedDate - Date input to format.
         * @returns A local YYYY-MM-DD string or Invalid date.
         */
        formatDate(unformattedDate: string | number | Date) {
            return dateParts(unformattedDate) || 'Invalid date';
        }

        //format the api accepts back
        /**
         * Format a calendar date using the legacy API noon timestamp convention.
         * @param unformattedDate - Date input to format.
         * @returns A YYYY-MM-DDT12:00 string or Invalid date.
         */
        formatDateAPI(unformattedDate: string) {
            const formattedDate = dateParts(`${unformattedDate}T00:00:00`);
            return formattedDate ? `${formattedDate}T12:00` : 'Invalid date';
        }

        /**
         * Format a rounded number using en-US grouping.
         * @param unformattedNumber - Numeric input to format.
         * @returns The grouped and rounded number string.
         */
        formatNumber(unformattedNumber: number | string) {
            return integerFormatter.format(Number(unformattedNumber));
        }

        /**
         * Parse a base-ten integer using the existing parseInt behavior.
         * @param formattedNumber - Integer text to parse.
         * @returns The parsed integer, or NaN when no integer can be read.
         */
        unformatNumber(formattedNumber: string) {
            return parseInt(formattedNumber, 10);
        }

        /**
         * Format a numeric value as US dollars with two decimal places.
         * @param unformattedCurrency - Numeric currency input.
         * @returns The value formatted as US dollars.
         */
        formatCurrency(unformattedCurrency: number | string) {
            return currencyFormatter.format(Number(unformattedCurrency));
        }

        /**
         * Remove currency decoration and return two decimal places, falling back to 0.00 for invalid input.
         * @param formattedCurrency - Decorated currency text or number.
         * @returns An undecorated decimal string with two places.
         */
        unformatCurrency(formattedCurrency: number | string) {
            const number = Number(String(formattedCurrency).replace(/[^0-9.-]/g, ''));
            return Number.isFinite(number) ? number.toFixed(2) : '0.00';
        }

        /**
         * Create a telephone link using only the supplied digits.
         * @param unformattedPhoneNumber - Phone number containing optional formatting.
         * @returns A tel link containing only digits.
         */
        formatPhoneLink(unformattedPhoneNumber: string) {
            return 'tel:' + unformattedPhoneNumber.replace(/\D/g,'');
        }

        /**
         * Create a mailto link from the supplied email address.
         * @param unformattedEmailAddress - Email address to place in the link.
         * @returns A mailto link.
         */
        formatEmailLink(unformattedEmailAddress: string) {
            return 'mailto:' + unformattedEmailAddress;
        }

    };
