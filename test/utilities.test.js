import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import Form from '../dist/app/assets/script/utility/form.js';
import Regex from '../dist/app/assets/script/utility/regex.js';
import Share from '../dist/app/assets/script/utility/share.js';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Hello from '../dist/app/assets/script/view/default.js';
test('form helpers return selected values, decorate metadata, and build options', () => {
    const window = new JSDOM('<select multiple><option value="a" selected>A</option><option value="b">B</option></select>').window;
    try {
        const form = new Form();
        assert.deepEqual(form.multiselectGetSelectedValues(window.document.querySelector('select')), ['a']);
        const options = [{value: 1}, {value: 2}];
        assert.deepEqual(form.selectMenuSelectOption(options, 2), [{value: 1, selected: false}, {value: 2, selected: true}]);
        assert.equal(form.selectMenuReturnOption(options, 2), options[1]);
        assert.equal(form.selectMenuReturnOption(options, 3), false);
        const metadata = form.normalizeMetaData([{key: 'color'}, {key: 'size'}, {key: 'shape'}]);
        assert.equal(metadata[0].keyID, 'meta-field-key-0');
        assert.equal(metadata[1].valueTitle, 'Field Value: size');
        const split = form.splitMetaData(metadata);
        assert.equal(split['group-1'].length, 2); assert.equal(split['group-2'].length, 1);
        const data = [{id: 1, first_name: 'Ada', last_name: 'Lovelace'}, {id: 2, name: 'Grace'}, {id: 3}];
        assert.deepEqual(form.buildOptions(data, 1), [{name: 'Ada Lovelace', value: 1, selected: true}, {name: 'Grace', value: 2, selected: false}, {name: 'not specified', value: 3, selected: false}]);
        assert.deepEqual(form.buildOptions(data, [2]).map(item => item.selected), [false, true, false]);
    } finally {window.close();}
});
test('string helpers handle missing values, escaping, dates, and links', async () => {
    const window = new JSDOM('').window;
    globalThis.DOMParser = window.DOMParser;
    try {
        const {default: Strings} = await import('../dist/app/assets/script/utility/string.js');
        const strings = new Strings();
        assert.equal(strings.toElement('<p>Hello</p>').textContent, 'Hello');
        assert.throws(() => strings.toElement(''), /root node/);
        assert.equal(strings.getQueryStringParamater('q', '/?q=Ada+Lovelace'), 'Ada Lovelace');
        assert.equal(strings.getQueryStringParamater('q', '/?q'), '');
        assert.equal(strings.getQueryStringParamater('q', '/'), null);
        assert.equal(strings.getQueryStringParamater('a[]', '/?a[]=one'), 'one');
        assert.equal(strings.formatDate('bad'), 'Invalid date');
        assert.equal(strings.formatDateAPI('bad'), 'Invalid date');
        assert.equal(strings.unformatNumber('42'), 42);
        assert.equal(strings.unformatCurrency('1.2.3'), '0.00');
        assert.equal(strings.formatPhoneLink('(614) 555-1234'), 'tel:6145551234');
        assert.equal(strings.formatEmailLink('a@example.test'), 'mailto:a@example.test');
        assert.equal(new Share().shareFacebookUrl({}), 'https://www.facebook.com/sharer.php?u=');
        const regex = new Regex();
        for (const name of ['date', 'password', 'phone', 'phoneEXT', 'zip', 'characters2', 'characters25', 'currency']) assert.ok(regex[name] instanceof RegExp);
        assert.equal(regex.zip.test('43085'), true);
        assert.equal(regex.zip.test('bad'), false);
        assert.equal(renderToStaticMarkup(React.createElement(Hello, {name: 'Ada'})), '<div>Hello Ada</div>');
    } finally {delete globalThis.DOMParser; window.close();}
});
