import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {createProject} from '../dist/scaffold/index.js';

const expectedEditorConfig = [
    'root = true',
    'charset = utf-8',
    'end_of_line = lf',
    'insert_final_newline = true',
    'indent_style = space',
    'indent_size = 4',
    'trim_trailing_whitespace = true',
    '[*.{json,yml,yaml}]',
    'indent_size = 2',
    '[*.md]',
    'trim_trailing_whitespace = false'
];

async function assertGeneratedEditorConfig(jsx) {
    const temporary = await mkdtemp(path.join(tmpdir(), 'white-label-editorconfig-'));
    try {
        const destination = path.join(temporary, 'site');
        await createProject({destination, jsx});
        const editorConfig = await readFile(path.join(destination, '.editorconfig'), 'utf8');
        for (const setting of expectedEditorConfig) {assert.match(editorConfig, new RegExp(setting.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));}
        assert.doesNotMatch(editorConfig, /max_line_length|quote_type|indent_brace_style/);
    } finally {
        await rm(temporary, {recursive: true, force: true});
    }
}

test('generated JSX projects include the standard EditorConfig', () => assertGeneratedEditorConfig(true));
test('generated non-JSX projects include the standard EditorConfig', () => assertGeneratedEditorConfig(false));
