/** @module app/assets/script/utility/regex */
'use strict';
export default class {
    date;
    password;
    phone;
    phoneEXT;
    zip;
    characters2;
    characters25;
    currency;
    /**
     * Create an instance with its own state and listener references.
     */
    constructor() {
        this.date = /^\$?(20|30)\d\d[- \/.](0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])?$/g;
        this.password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,15}$/m;
        this.phone = /^(\+?\d[ -\.])?([\\(]{0,1}([0-9]){3}[\\\.\-)]{0,1}[ ]?([^0-1]){1}([0-9]){2}[ ]?[-\.]?[ ]?([0-9]){4})|(\d{10})$/m;
        this.phoneEXT = /^(\+?\d[ -\.])?([\\(]{0,1}([0-9]){3}[\\\.\-)]{0,1}[ ]?([^0-1]){1}([0-9]){2}[ ]?[-\.]?[ ]?([0-9]){4}[ ]*((x|ext|ext ){0,1}([0-9]){1,5}){0,1})|(\d{10})$/m;
        this.zip = /^\d{5}$/m;
        this.characters2 = /^.{2,500}$/m;
        this.characters25 = /^.{25,500}$/m;
        this.currency = /^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/m;
    }
}
;
//# sourceMappingURL=regex.js.map