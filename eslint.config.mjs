import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';

const sharedRules = {...js.configs.recommended.rules, curly: ['error', 'all'], eqeqeq: ['error', 'always'], 'no-eval': 'error', 'no-implied-eval': 'error', 'no-new-wrappers': 'error', 'no-var': 'error', 'prefer-const': 'error'};

// Node.js globals the repository and generated-project tests use. Listed here rather than adding the `globals` package
// for a handful of names.
const nodeTestGlobals = {AbortController: 'readonly', Buffer: 'readonly', URL: 'readonly', console: 'readonly', fetch: 'readonly', globalThis: 'readonly', performance: 'readonly', process: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', CustomEvent: 'readonly', Request: 'readonly', Response: 'readonly', setImmediate: 'readonly'};

export default [
  {ignores: ['dist/**', 'coverage/**', 'node_modules/**', '_deploy/**']},
  {files: ['cli/**/*.ts', 'scripts/**/*.ts', 'scaffold/**/*.ts', 'generators/**/*.ts', 'server/**/*.ts', 'app/**/*.ts', 'test-types/**/*.mts'], languageOptions: {parser: babelParser, parserOptions: {requireConfigFile: false, sourceType: 'module', babelOptions: {presets: ['@babel/preset-typescript']}}}, rules: {...sharedRules, 'no-undef': 'off', 'no-unused-vars': 'off'}},
  // Repository tests and the generated project's tests (template-test/) are plain ES modules run by node:test.
  {files: ['test/**/*.js', 'template-test/**/*.js'], languageOptions: {ecmaVersion: 'latest', sourceType: 'module', globals: nodeTestGlobals}, rules: sharedRules},
];
