import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { routerinoForge } from "../../routerino-forge.js";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80 },
      webp: { quality: 80 },
    }),
    routerinoForge({
      baseUrl: "https://example.com",
      routes: "./src/App.jsx",
    }),
  ],
  resolve: {
    alias: {
      routerino: path.resolve(__dirname, "../../dist/routerino.js"),
    },
  },
});
