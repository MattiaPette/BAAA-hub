import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import functional from 'eslint-plugin-functional';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FlatCompat allows us to use eslintrc-style configs in flat config
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      '.yarn/**',
      'dist/**',
      'build/**',
      'lib/**',
      'coverage/**',
      'node_modules/**',
      'babel.config.js',
      '*.eslintrc.cjs',
      '*.eslintrc.js',
      'src/locales/**/*.d.ts',
      'lingui.config.ts',
      'vite.config.ts',
      'vitest.config.ts',
      'vitest.setup.ts',
      'theme.ts',
      'jest.config.ts',
      'public/**/*.js',
    ],
  },
  js.configs.recommended,
  // Use FlatCompat for configs that don't support flat config yet
  ...compat.extends(
    'airbnb',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      functional,
      prettier,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'arrow-body-style': ['warn', 'as-needed'],
      'no-case-declarations': 'off',
      'no-console': 'off',
      'no-unused-expressions': [
        'error',
        { allowTernary: true, allowShortCircuit: true },
      ],
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',

      // Modern tooling handles these import rules
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',

      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
        },
      ],
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx', '.ts'] }],
      'react/prop-types': 'off',
      'react/no-array-index-key': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-no-duplicate-props': ['warn', { ignoreCase: false }],
      'react/display-name': 'off',
      'react/require-default-props': 'off',
      'react/react-in-jsx-scope': 'off',

      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.ts?(x)'],
    plugins: {
      functional,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Apply functional plugin rules for TypeScript files
      ...functional.configs.lite.rules,
      ...functional.configs.stylistic.rules,
      // Override specific functional rules
      'functional/no-return-void': 'off',
      'functional/no-throw-statement': 'off',
      'functional/no-mixed-types': 'off',
    },
  },
  {
    files: ['**/*.{spec,test}.ts?(x)'],
    rules: {
      'functional/immutable-data': 'off',
      'functional/no-let': 'off',
      'functional/no-throw-statements': 'off',
    },
  },
];
