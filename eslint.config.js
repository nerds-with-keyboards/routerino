import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    ignores: [
      "**/dist/*",
      "node_modules/*",
      "docs/*",
      "demo-prerender/dist/*",
      "demo-static/dist/*",
      "coverage/*",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  // Enable Fast Refresh checks globally
  {
    plugins: {
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": "error",
    },
  },
  // Disable Fast Refresh checks for router files (they need multiple exports for SSG)
  {
    files: ["**/routes.jsx", "**/App.jsx", "**/routerino.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
