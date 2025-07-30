import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure assets work correctly in Docker
    assetsDir: "assets",
    sourcemap: false,
  },
});
