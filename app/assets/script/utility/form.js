import _ from 'lodash';

(() => {
    'use strict';
    module.exports = class {
        multiselectGetSelectedValues(element) {
            let values = [];
            element.querySelectorAll(':checked').forEach((item) => {
                values.push(item.value);
            });
            return values;
        }
        selectMenuSelectOption(data, value) {
            data.forEach ((item) => {
                if (item.value === value) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
            });
            return data;
        }
        selectMenuReturnOption(data, value) {
            let itemMatch = false;
            data.forEach((item) => {
                if (item.value === value) {
                    itemMatch = item;
                }
            });
            return itemMatch;
        }
        normalizeMetaData(metaData) {
            let i = 0;
            metaData.forEach((item) => {
                item.keyID = 'meta-field-key-' + i;
                item.keyTitle = 'Field Name:';
                item.valueID = 'meta-field-value-' + i;
                item.valueTitle =  'Field Value: ' + item.key;
                i++;
            });

            return metaData;
        }
        splitMetaData(metaData) {
            let secondRowCount = Math.floor(metaData.length / 2);
            return {
                'group-1': metaData,
                'group-2': metaData.splice(metaData.length - secondRowCount, secondRowCount)
            }
        }
        buildOptions(arr, selected) {

            var options = [],
                option = {};

            arr.forEach((obj) => {

                let name = 'not specified';

                if (obj.first_name && obj.last_name) {
                    name = obj.first_name + ' ' + obj.last_name;
                } else if (obj.name) {
                    name = obj.name;
                }

                option = {
                    name: name,
                    value: obj.id
                };

                if (selected === obj.id) {
                    option.selected = true;
                } else if (Array.isArray(selected) && selected.indexOf(obj.id) !== -1) {
                    option.selected = true;
                } else {
                    option.selected = false;
                }

                options.push(option);

            });

            return options;
        }
    };
})();
