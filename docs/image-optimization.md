# Image Optimization

Routerino delegates image optimization to [`vite-plugin-image-optimizer`](https://github.com/FatehAK/vite-plugin-image-optimizer). Install it along with `sharp` and add it to your Vite config **before** `routerinoForge`:

```sh
npm install --save-dev vite-plugin-image-optimizer sharp
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { routerinoForge } from "routerino/forge";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80 },
      webp: { quality: 80 },
    }),
    routerinoForge({ baseUrl: "https://example.com" }),
  ],
});
```

Use standard HTML `<img>` tags in your components — the plugin optimizes source images in `public/` and imported assets during the Vite build. No special component or props needed.
