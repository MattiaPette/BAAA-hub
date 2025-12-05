import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
  plugins: [
    svgr({
      include: ['../ui-icons/**/*.svg'],
      exclude: ['**/favicon.svg'],
      svgrOptions: {
        exportType: 'default',
        icon: true,
      },
    }),
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
  ],
  ssr: {
    noExternal: ['@mui/x-data-grid'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: true,
    coverage: {
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
      },
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'build/',
        'coverage/',
        'public/sw.js',
        '**/*.model.ts',
        '**/index.tsx',
        '**/index.ts',
        '**/types/**',
        'assets/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
