import baseConfig from './eslint.config.base.js';

/**
 * Root ESLint configuration for the monorepo
 * This configuration applies to workspace-level files
 * Individual packages have their own eslint.config.js that extends the base
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const config = [
  ...baseConfig,
  {
    // Ignore package directories as they have their own configs
    ignores: ['apps/**'],
  },
];

export default config;
