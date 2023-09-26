import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "routerino.jsx"),
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
      },
    },
  },
  plugins: [react()],
});
