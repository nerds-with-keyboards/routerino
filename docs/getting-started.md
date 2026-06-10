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

## Full React Example

This example includes the full React configuration. It can replace `src/main.jsx`:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
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

const App = () => (
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

createRoot(document.getElementById("root")).render(<App />);
```

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
