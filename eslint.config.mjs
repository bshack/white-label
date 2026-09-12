import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
export default [
  {ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'template-test/**']},
  {files: ['scripts/**/*.ts', 'scaffold/**/*.ts', 'generators/**/*.ts', 'app/**/*.{ts,tsx}'], languageOptions: {parser: babelParser, parserOptions: {requireConfigFile: false, sourceType: 'module', babelOptions: {presets: [['@babel/preset-typescript', {allExtensions: true, isTSX: true}]]}}}, rules: {...js.configs.recommended.rules, 'no-undef': 'off', 'no-unused-vars': 'off', curly: ['error', 'all'], eqeqeq: ['error', 'always'], 'no-eval': 'error', 'no-implied-eval': 'error', 'no-new-wrappers': 'error', 'no-var': 'error', 'prefer-const': 'error'}},
];
