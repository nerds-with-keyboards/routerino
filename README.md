# Routerino

Routerino is a React router with static HTML generation and built-in SEO support.

Live demos: [raymondsseptic.com](https://raymondsseptic.com), [kissimmeekastawayvilla.com](https://kissimmeekastawayvilla.com), [nerdswithkeyboards.com](https://nerdswithkeyboards.com), and [logbook-ed.com](https://logbook-ed.com)

## Why

React SPAs do not always give search engines complete HTML to index. Frameworks such as Next.js and Remix solve this, but adopting one also brings its conventions and application structure.

Routerino handles routing as a library and provides a Vite plugin for generating static HTML at build time. Generated pages include meta tags, Open Graph tags, canonical URLs, `sitemap.xml`, and `robots.txt`. The client-side application still uses standard `<a>` tags and has no added runtime dependencies.

## Quick Start

```sh
npm i routerino
```

```jsx
import Routerino from "routerino";

export const routes = [
  {
    path: "/",
    element: <p>This is the home page!</p>,
    title: "My Home Page!",
    description: "Welcome to my home page!",
  },
  {
    path: "/blog/my-first-post/",
    element: (
      <article>
        <h1>My First Post</h1>
        <p>Lorem ipsum...</p>
      </article>
    ),
    title: "My First Post",
    description: "The first post on my new home page!",
    tags: [{ property: "og:type", content: "article" }],
  },
];

<Routerino title="Example.com" routes={routes} />;
```

## What It Does

| Feature                | Routerino               | React Router         | Next.js              | Gatsby               | Remix                |
| ---------------------- | ----------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| SSG (static HTML)      | ✅ Built-in Vite plugin | ❌                   | ✅ Built-in          | ✅ Core feature      | ✅ Built-in          |
| Meta tags / Open Graph | ✅ Per-route, automatic | ❌                   | ✅ Metadata API      | ✅ Via plugin        | ✅ meta export       |
| Sitemap generation     | ✅ Automatic            | ❌                   | ❌ Manual            | ✅ Via plugin        | ❌ Manual            |
| Canonical URLs         | ✅ Automatic            | ❌                   | ❌ Manual            | ❌ Manual            | ❌ Manual            |
| Standard `<a>` tags    | ✅ No `<Link>` needed   | ❌ Must use `<Link>` | ❌ Must use `<Link>` | ❌ Must use `<Link>` | ❌ Must use `<Link>` |
| Runtime dependencies   | 0 (peer: react)         | 3+                   | 50+                  | 100+                 | 20+                  |
| Prerender support      | ✅ Built-in             | ❌                   | ✅ ISR               | ✅ SSG               | ✅ Built-in          |
| Library, not framework | ✅                      | ✅                   | ❌                   | ❌                   | ❌                   |

## Installation

```sh
npm i routerino
```

Routerino requires React, React DOM, and PropTypes as peer dependencies (typically already installed). Supports React 18/19 and Node.js 18+.

## Usage

### Route Configuration

Routes are plain objects. At minimum, each needs a `path` and `element`:

```jsx
export const routes = [
  {
    path: "/",
    element: <HomePage />,
    title: "Home",
    description: "Welcome to our site",
  },
  {
    path: "/about/",
    element: <AboutPage />,
    title: "About Us",
    description: "Learn more about our team",
    imageUrl: "/images/about-og.jpg",
  },
  {
    path: "/products/:id/", // Dynamic routes are not statically generated
    element: <ProductPage />,
  },
];
```

Links are standard `<a>` tags. Routerino intercepts same-origin clicks for SPA navigation; the browser handles everything else (cross-origin links, `mailto:`, `target="_blank"`, file downloads, etc.) automatically.

### The `useRouterino` Hook

Access router state from any component:

```jsx
import { useRouterino } from "routerino";

function ProductPage() {
  const { currentRoute, params, routePattern, updateHeadTag } = useRouterino();

  useEffect(() => {
    updateHeadTag({ name: "description", content: `Product: ${params.id}` });
  }, [params.id]);

  return <div>Product: {params.id}</div>;
}
```

The hook returns `currentRoute`, `params`, `routePattern`, and `updateHeadTag`.

### `updateHeadTag`

Create or update head tags at any time. Matches existing tags by attribute to avoid duplicates:

```js
updateHeadTag({ name: "description", content: "Some description..." });
updateHeadTag({ tag: "link", rel: "apple-touch-icon", href: "/icon.png" });
updateHeadTag({ property: "og:site_name", content: "Your Brand" });
```

Set `soft: true` to skip overwriting existing values. Use `innerHTML` for structured data and non-self-closing tags. See [docs/seo-guide.md](docs/seo-guide.md) for full details.

### Programmatic Navigation

```js
window.history.pushState({}, "", "/about/");
window.dispatchEvent(new PopStateEvent("popstate"));
```

### ErrorBoundary

```jsx
import { ErrorBoundary } from "routerino";

<ErrorBoundary
  fallback={<div>Something went wrong.</div>}
  errorTitleString="Error | My Site"
  debug={window.location.hostname === "localhost"}
>
  <MyComponent />
</ErrorBoundary>;
```

## Static Site Generation (Routerino Forge)

Export the routes and the same app shell that the browser renders, then point
Forge at that module:

```js
// vite.config.js
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

### Requirements

- `baseUrl` is required and must be an HTTP(S) origin such as
  `https://example.com`, with no path, query, hash, or trailing slash
- `index.html` must have `<div id="root"></div>`
- The configured module must export `routes`; exporting its app component as
  `App` or the default export preserves the full layout and context during SSG
- Static route paths must begin with `/` and cannot contain empty segments,
  queries, hashes, backslashes, path traversal, or encoded separators
- Dynamic routes (with `:param`) are automatically skipped

If the module exports routes but no app component, Forge deliberately renders
the matched route element by itself. This route-only mode is useful for simple
sites, but it omits any layout or providers that live outside that element. See
the [full setup](docs/getting-started.md) for the recommended app structure and
hydration entry point.

### Build Output

- Static HTML for every route with full meta tags
- Dual file generation (`/about.html` + `/about/index.html`) for host
  compatibility; both copies point to the canonical style selected by
  `useTrailingSlash`
- Automatic `sitemap.xml` and `robots.txt`
- `404.html` at root for custom error pages
- Canonical URL and `og:url` meta tags on every page
- Root-relative social images resolved against `baseUrl`; absolute image URLs
  are preserved
- A failed route render, 404 render, unsafe route path, invalid configuration,
  or missing generated file fails the Vite build

### Generating Routes from Data

```jsx
// Build-time data fetching is fully supported
const blogPosts = await fetch("https://api.example.com/posts").then((r) =>
  r.json()
);

export const routes = [
  { path: "/", element: <HomePage />, title: "Home" },
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}/`,
    element: <BlogPost post={post} />,
    title: post.title,
    description: post.excerpt,
    imageUrl: post.featuredImage,
  })),
];
```

Each generated route gets its own static HTML page with proper meta tags and is automatically included in `sitemap.xml`.

## Who Is This For?

Routerino is intended for React content sites, marketing pages, and JAMstack applications that need static HTML, meta tags, and sitemaps without adopting a framework such as Next.js or Remix. A dashboard or authenticated application may not need static generation; a general-purpose client-side router may be enough in that case.

## TypeScript

TypeScript definitions are included. Routes are typed as `RouteConfig[]`:

```tsx
import type { RouteConfig } from "routerino";

export const routes: RouteConfig[] = [
  { path: "/", element: <HomePage />, title: "Home", description: "Welcome" },
];
```

## Documentation

- [Getting Started](docs/getting-started.md): Full React example and Preact setup
- [SEO Guide](docs/seo-guide.md): Canonical URLs, social previews, JSON-LD, and hash links
- [Image Optimization](docs/image-optimization.md): Using `vite-plugin-image-optimizer`
- [Accessibility](docs/accessibility.md): ESLint accessibility setup for Lighthouse scores
- [Vendoring](docs/vendoring.md): Including Routerino directly in your project
- [Additional Resources](docs/additional-resources.md): External SEO and performance links

## API Reference

### `<Routerino>` Props

| Prop               | Type            | Default                  | Description                                     |
| ------------------ | --------------- | ------------------------ | ----------------------------------------------- |
| `title`            | `string`        | `""`                     | Site title appended to page titles              |
| `routes`           | `RouteConfig[]` | `[default]`              | Array of route configurations                   |
| `separator`        | `string`        | `" \| "`                 | Title separator between page and site title     |
| `notFoundTemplate` | `ReactNode`     | Built-in 404             | 404 page template                               |
| `notFoundTitle`    | `string`        | `"Page not found [404]"` | 404 page title                                  |
| `errorTemplate`    | `ReactNode`     | Built-in 500             | Error page template                             |
| `errorTitle`       | `string`        | `"Page error [500]"`     | Error page title                                |
| `useTrailingSlash` | `boolean`       | `true`                   | Use trailing slashes in canonical URLs          |
| `usePrerenderTags` | `boolean`       | `false`                  | Include prerender meta tags for crawlers        |
| `baseUrl`          | `string`        | `null`                   | Base URL for canonical tags (no trailing slash) |
| `imageUrl`         | `string`        | `null`                   | Default site-wide social image URL              |
| `touchIconUrl`     | `string`        | `null`                   | PWA homescreen icon URL                         |
| `debug`            | `boolean`       | `false`                  | Enable console logging                          |
| `ignorePatterns`   | `string[]`      | `[]`                     | URL patterns to skip SPA routing                |

### `RouteConfig` Object

| Field         | Type           | Required | Description                                         |
| ------------- | -------------- | -------- | --------------------------------------------------- |
| `path`        | `string`       | Yes      | Route path. Must start with `/`. Supports `:param`. |
| `element`     | `ReactElement` | Yes      | Rendered JSX element, such as `<AboutPage />`       |
| `title`       | `string`       | No       | Page title (site title appended automatically)      |
| `description` | `string`       | No       | Meta description                                    |
| `imageUrl`    | `string`       | No       | Social preview image for this route                 |
| `tags`        | `HeadTag[]`    | No       | Additional head tags (OG, JSON-LD, etc.)            |

### `HeadTag` Object

Common attributes: `tag`, `name`, `property`, `content`, `rel`, `href`, `soft`, `innerHTML`. Supports all standard HTML attributes. See [updateHeadTag](#updateheadtag) for details.

### `routerinoForge` Options

| Option             | Type      | Default                                     | Description                                      |
| ------------------ | --------- | ------------------------------------------- | ------------------------------------------------ |
| `baseUrl`          | `string`  | Required                                    | HTTP(S) origin; no path, query, hash, or slash   |
| `routes`           | `string`  | `"./src/routes.jsx"`                        | Path to routes file                              |
| `template`         | `string`  | `"index.html"`                              | Built HTML path relative to `outputDir`          |
| `outputDir`        | `string`  | `"dist"`                                    | Build output directory                           |
| `generateSitemap`  | `boolean` | `true`                                      | Generate sitemap.xml and robots.txt              |
| `useTrailingSlash` | `boolean` | `true`                                      | Set to `false` for `/about` instead of `/about/` |
| `verbose`          | `boolean` | `false`                                     | Enable detailed build logging                    |
| `ssgCacheDir`      | `string`  | `"node_modules/.cache/routerino-forge/ssg"` | Parent for isolated temporary SSG bundles        |

## Contributing

Contributions are welcome. Please create an issue or submit a pull request. Keep it simple!

## License

Routerino is [MIT licensed](./LICENSE).
