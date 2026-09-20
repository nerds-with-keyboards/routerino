import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./routerino.jsx", import.meta.url)),
      //   formats: ["es", "cjs", "umd"],
      name: "routerino",
      //   fileName: (format) => `routerino.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "prop-types"],
      output: {
        globals: {
          react: "React",
          "prop-types": "PropTypes",
          "react/jsx-runtime": "react/jsx-runtime",
        },
        // Suppress warning about mixed exports - this is intentional for backward compatibility
        exports: "named",
      },
    },
  },
  plugins: [react()],
});
