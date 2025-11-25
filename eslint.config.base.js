import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/**
 * Base ESLint configuration for the monorepo
 * This provides shared rules that all packages can extend
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const config = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/lib/**',
      '**/coverage/**',
      '**/.yarn/**',
      '**/babel.config.js',
      '**/*.eslintrc.cjs',
      '**/*.eslintrc.js',
      '**/jest.config.ts',
      '**/public/**/*.js',
    ],
  },
  js.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;
