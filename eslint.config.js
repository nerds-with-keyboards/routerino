import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
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
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    settings: {
      react: {
        version: "^18.0.0",
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
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
  {
    files: ["test/**/*.{js,jsx}"],
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: [
      "demo-prerender/**/*.{js,jsx}",
      "demo-static/**/*.{js,jsx}",
      "example-basic/**/*.{js,jsx}",
      "example-prerender/**/*.{js,jsx}",
      "example-vite-static/**/*.{js,jsx}",
    ],
    rules: {
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
    },
  },
];
