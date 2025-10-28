import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { routerinoForge } from "../../routerino-forge.js";

export default defineConfig({
  plugins: [
    react(),
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
