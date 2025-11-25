import dns from 'dns';
import { execSync } from 'child_process';

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { lingui } from '@lingui/vite-plugin';

dns.setDefaultResultOrder('verbatim');

const getCommitHash = (): string | undefined => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return undefined;
  }
};

const commitHash = getCommitHash();

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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Template App',
        short_name: 'Template',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    lingui(),
  ],
  assetsInclude: ['**/*.svg'],
  envDir: '../../environments',
  define: {
    __COMMIT_HASH: JSON.stringify(commitHash),
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 2000,
    sourcemap: process.env['ENV'] !== 'production',
  },
  server: {
    port: 4000,
    open: true,
  },
  mode: process.env['ENV'] || 'dev',
});
