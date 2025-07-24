import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { routerinoStatic } from '../vite-plugin-routerino-static.js';

export default defineConfig({
  plugins: [
    react(),
    routerinoStatic({
      routesFile: './src/routes.js',
      baseUrl: 'https://example.com',
      globalMeta: {
        siteName: 'Vite Static Example',
        title: 'Vite Static Example'
      }
    })
  ]
});