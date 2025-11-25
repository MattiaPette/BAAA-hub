import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en', 'it'],
  sourceLocale: 'en',
  compileNamespace: 'ts',
  format: 'po',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['<rootDir>/src/**'],
      exclude: ['**/node_modules/**'],
    },
  ],
};

export default config;
