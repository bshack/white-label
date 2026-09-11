import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
export default [
  {ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'template-test/**']},
  {files: ['scripts/**/*.ts', 'generators/**/*.ts', 'app/assets/script/**/*.{ts,tsx}'], languageOptions: {parser: babelParser, parserOptions: {requireConfigFile: false, sourceType: 'module', babelOptions: {presets: ['@babel/preset-typescript']}}}, rules: {...js.configs.recommended.rules, 'no-undef': 'off', 'no-unused-vars': 'off', curly: ['error', 'all'], eqeqeq: ['error', 'always'], 'no-eval': 'error', 'no-implied-eval': 'error', 'no-new-wrappers': 'error', 'no-var': 'error', 'prefer-const': 'error'}},
];
