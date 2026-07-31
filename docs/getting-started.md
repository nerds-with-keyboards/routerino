# Getting Started with Routerino

## Starting a New React Project

If you're starting from scratch, here's the recommended approach:

1. Ensure you have [Node.js](https://nodejs.org/) and npm installed. Consider using a Node version manager like [Volta](https://volta.sh/), [fnm](https://github.com/Schniz/fnm), or [asdf](https://asdf-vm.com/).

2. Create a new React project with [Vite](https://vitejs.dev/):

```sh
npm create vite@latest my-react-app -- --template react
```

3. Install dependencies:

```sh
cd my-react-app
npm install
```

4. Add Routerino:

```sh
npm install routerino
```

## Full React + Forge Example

Keep the route data and app shell together so Forge renders the same tree that
the browser hydrates.

`src/App.jsx`:

```jsx
import Routerino from "routerino";

export const routes = [
  {
    path: "/",
    element: <p>Welcome to Home</p>,
    title: "Home",
    description: "Welcome to my website!",
  },
  {
    path: "/about/",
    element: <p>About us...</p>,
    title: "About",
    description: "Learn more about us.",
  },
  {
    path: "/contact/",
    element: (
      <div>
        <h1>Contact Us</h1>
        <p>
          Please <a href="mailto:user@example.com">send us an email</a> at
          user@example.com
        </p>
      </div>
    ),
    title: "Contact",
    description: "Get in touch with us.",
  },
];

export default function App() {
  return (
    <main>
      <nav>
        <a href="/">Home</a>
      </nav>

      <Routerino
        title="Example.com"
        notFoundTitle="Sorry, but this page does not exist."
        errorTitle="Yikes! Something went wrong."
        routes={routes}
      />

      <footer>
        <p>
          Learn more <a href="/about/">about us</a> or{" "}
          <a href="/contact/">contact us</a> today.
        </p>
      </footer>
    </main>
  );
}
```

`src/main.jsx`:

```jsx
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const root = document.getElementById("root");
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
```

`vite.config.js`:

```js
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
```

`baseUrl` must be the production HTTP(S) origin only: it cannot include a path,
query, hash, or trailing slash. Routes must be statically enumerable at build
time. Dynamic paths containing `:param` still work in the browser but are
skipped by Forge.

Forge writes both `about.html` and `about/index.html` for an `/about/` route.
Both use the canonical URL style selected by `useTrailingSlash`. The build stops
with an error if Forge cannot render a configured static route or the 404 page.

## Using Preact

Routerino is fully compatible with Preact via `@preact/compat`:

1. Install Preact:

```sh
npm i preact @preact/compat
```

2. Configure your bundler:

**Vite:**

```js
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: "@preact/compat",
      "react-dom": "@preact/compat",
      "react/jsx-runtime": "@preact/compat/jsx-runtime",
    },
  },
});
```

**Webpack:**

```js
module.exports = {
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
};
```

3. Use Routerino exactly as you would in a React project — the API is identical.
