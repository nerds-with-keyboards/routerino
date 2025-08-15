import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { routerinoForge } from "../../routerino-forge.js";

export default defineConfig({
  plugins: [
    react(),
    routerinoForge({
      baseUrl: "https://example.com",
      // All other options use sensible defaults:
      // routes: './src/routes.jsx',
      // outputDir: 'dist',
      // generateSitemap: true,
      // prerenderStatusCode: true,
      // verbose: false
      // useTrailingSlash: true (default)
    }),
  ],
  resolve: {
    alias: {
      routerino: path.resolve(__dirname, "../../dist/routerino.js"),
    },
  },
});
