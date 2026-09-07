'use strict';
export default class {
    /**
     * Return the values of selected options in document order.
     * @param element - Select element to inspect.
     * @returns Selected option values in document order.
     */
    multiselectGetSelectedValues(element) {
        let values = [];
        element.querySelectorAll(':checked').forEach((item) => {
            values.push(item.value);
        });
        return values;
    }
    /**
     * Mutate option selection flags so only the matching value remains selected.
     * @param data - Data supplied by the caller; validation follows the method contract.
     * @param value - Value to find or format.
     * @returns The same option array with updated selection flags.
     */
    selectMenuSelectOption(data, value) {
        data.forEach((item) => {
            if (item.value === value) {
                item.selected = true;
            }
            else {
                item.selected = false;
            }
        });
        return data;
    }
    /**
     * Return the last option matching a value, or false when none matches.
     * @param data - Data supplied by the caller; validation follows the method contract.
     * @param value - Value to find or format.
     * @returns The matching option or false.
     */
    selectMenuReturnOption(data, value) {
        let itemMatch = false;
        data.forEach((item) => {
            if (item.value === value) {
                itemMatch = item;
            }
        });
        return itemMatch;
    }
    /**
     * Add stable field IDs and readable labels to metadata entries in place.
     * @param metaData - Metadata array to decorate or divide.
     * @returns The same metadata array with IDs and labels.
     */
    normalizeMetaData(metaData) {
        let i = 0;
        metaData.forEach((item) => {
            item.keyID = 'meta-field-key-' + i;
            item.keyTitle = 'Field Name:';
            item.valueID = 'meta-field-value-' + i;
            item.valueTitle = 'Field Value: ' + item.key;
            i++;
        });
        return metaData;
    }
    /**
     * Move the latter half of metadata into a second group, mutating the supplied array.
     * @param metaData - Metadata array to decorate or divide.
     * @returns Two groups; group-1 retains the mutated input array.
     */
    splitMetaData(metaData) {
        let secondRowCount = Math.floor(metaData.length / 2);
        return {
            'group-1': metaData,
            'group-2': metaData.splice(metaData.length - secondRowCount, secondRowCount)
        };
    }
    /**
     * Create display options from named records and mark the requested selections.
     * @param arr - Records used to build select options.
     * @param selected - Selected ID or IDs.
     * @returns New options containing names, values, and selection flags.
     */
    buildOptions(arr, selected) {
        const options = [];
        let option;
        arr.forEach((obj) => {
            let name = 'not specified';
            if (obj.first_name && obj.last_name) {
                name = obj.first_name + ' ' + obj.last_name;
            }
            else if (obj.name) {
                name = obj.name;
            }
            option = {
                name: name,
                value: obj.id
            };
            if (selected === obj.id) {
                option.selected = true;
            }
            else if (Array.isArray(selected) && selected.indexOf(obj.id) !== -1) {
                option.selected = true;
            }
            else {
                option.selected = false;
            }
            options.push(option);
        });
        return options;
    }
}
;
//# sourceMappingURL=form.js.map