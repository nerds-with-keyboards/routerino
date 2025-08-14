import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

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
