import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { routerinoForge } from "../routerino-forge.js";

const appRoot = fileURLToPath(
  new URL("./vite-app-no-trailing/", import.meta.url)
);
const routerinoBuild = fileURLToPath(
  new URL("../dist/routerino.js", import.meta.url)
);

// Release checks deliberately load Vite and its React plugin from the repository
// root. Ignored node_modules directories inside fixtures must not affect npm publish.
export default defineConfig({
  root: appRoot,
  plugins: [
    react(),
    routerinoForge({
      baseUrl: "https://example.com",
      useTrailingSlash: false,
    }),
  ],
  resolve: {
    alias: {
      routerino: routerinoBuild,
    },
  },
});
