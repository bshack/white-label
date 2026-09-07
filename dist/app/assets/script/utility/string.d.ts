export default class {
    /**
     * Parse trusted HTML and clone its first root node; reject empty markup.
     * @param string - Trusted HTML containing at least one root node.
     * @returns A clone of the first parsed root node.
     * @throws When input does not satisfy the documented contract.
     */
    toElement(string: string): Node;
    /**
     * Read and decode a query value, returning null when absent and an empty string when valueless.
     * @param name - Resource, field, or parameter name.
     * @param url - URL or optional adapter argument.
     * @returns The decoded value, an empty string, or null when absent.
     */
    getQueryStringParamater(name: string, url: string): string | null;
    /**
     * Format a local calendar date as YYYY-MM-DD or return Invalid date.
     * @param unformattedDate - Date input to format.
     * @returns A local YYYY-MM-DD string or Invalid date.
     */
    formatDate(unformattedDate: string | number | Date): string;
    /**
     * Format a calendar date using the legacy API noon timestamp convention.
     * @param unformattedDate - Date input to format.
     * @returns A YYYY-MM-DDT12:00 string or Invalid date.
     */
    formatDateAPI(unformattedDate: string): string;
    /**
     * Format a rounded number using en-US grouping.
     * @param unformattedNumber - Numeric input to format.
     * @returns The grouped and rounded number string.
     */
    formatNumber(unformattedNumber: number | string): string;
    /**
     * Parse a base-ten integer using the existing parseInt behavior.
     * @param formattedNumber - Integer text to parse.
     * @returns The parsed integer, or NaN when no integer can be read.
     */
    unformatNumber(formattedNumber: string): number;
    /**
     * Format a numeric value as US dollars with two decimal places.
     * @param unformattedCurrency - Numeric currency input.
     * @returns The value formatted as US dollars.
     */
    formatCurrency(unformattedCurrency: number | string): string;
    /**
     * Remove currency decoration and return two decimal places, falling back to 0.00 for invalid input.
     * @param formattedCurrency - Decorated currency text or number.
     * @returns An undecorated decimal string with two places.
     */
    unformatCurrency(formattedCurrency: number | string): string;
    /**
     * Create a telephone link using only the supplied digits.
     * @param unformattedPhoneNumber - Phone number containing optional formatting.
     * @returns A tel link containing only digits.
     */
    formatPhoneLink(unformattedPhoneNumber: string): string;
    /**
     * Create a mailto link from the supplied email address.
     * @param unformattedEmailAddress - Email address to place in the link.
     * @returns A mailto link.
     */
    formatEmailLink(unformattedEmailAddress: string): string;
}
