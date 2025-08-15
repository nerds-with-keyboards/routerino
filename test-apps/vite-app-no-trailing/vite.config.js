import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { routerinoForge } from "../../routerino-forge.js";

export default defineConfig({
  plugins: [
    react(),
    routerinoForge({
      baseUrl: "https://example.com",
      useTrailingSlash: false, // Testing non-trailing slash configuration
      // All other options use sensible defaults
    }),
  ],
  resolve: {
    alias: {
      routerino: path.resolve(__dirname, "../../dist/routerino.js"),
    },
  },
});
