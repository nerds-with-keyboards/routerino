import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { routerinoForge } from "routerino/forge";

export default defineConfig({
  plugins: [
    react(),
    routerinoForge({
      baseUrl: "https://example.com",
      routes: "./src/App.jsx",
    }),
  ],
});
