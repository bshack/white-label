/** Select option data used by the generated form examples. */
interface Option {
    value: string | number;
    selected?: boolean;
    name?: string;
}
interface Metadata {
    key: string;
    keyID?: string;
    keyTitle?: string;
    valueID?: string;
    valueTitle?: string;
}
interface OptionInput {
    id: string | number;
    first_name?: string;
    last_name?: string;
    name?: string;
}
export default class {
    /**
     * Return the values of selected options in document order.
     * @param element - Select element to inspect.
     * @returns Selected option values in document order.
     */
    multiselectGetSelectedValues(element: HTMLSelectElement): string[];
    /**
     * Mutate option selection flags so only the matching value remains selected.
     * @param data - Data supplied by the caller; validation follows the method contract.
     * @param value - Value to find or format.
     * @returns The same option array with updated selection flags.
     */
    selectMenuSelectOption(data: Option[], value: string | number): Option[];
    /**
     * Return the last option matching a value, or false when none matches.
     * @param data - Data supplied by the caller; validation follows the method contract.
     * @param value - Value to find or format.
     * @returns The matching option or false.
     */
    selectMenuReturnOption(data: Option[], value: string | number): boolean;
    /**
     * Add stable field IDs and readable labels to metadata entries in place.
     * @param metaData - Metadata array to decorate or divide.
     * @returns The same metadata array with IDs and labels.
     */
    normalizeMetaData(metaData: Metadata[]): Metadata[];
    /**
     * Move the latter half of metadata into a second group, mutating the supplied array.
     * @param metaData - Metadata array to decorate or divide.
     * @returns Two groups; group-1 retains the mutated input array.
     */
    splitMetaData(metaData: Metadata[]): {
        'group-1': Metadata[];
        'group-2': Metadata[];
    };
    /**
     * Create display options from named records and mark the requested selections.
     * @param arr - Records used to build select options.
     * @param selected - Selected ID or IDs.
     * @returns New options containing names, values, and selection flags.
     */
    buildOptions(arr: OptionInput[], selected: string | number | Array<string | number>): Option[];
}
export {};
