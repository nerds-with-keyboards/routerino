# Routerino

> A lightweight, SEO-optimized React router for modern websites and applications

For teams who want SPA simplicity with search-friendly static HTML, Open Graph previews, and **no framework lock-in.**

Routerino is a zero-dependency router for React designed for optimal SEO performance in client-side rendered applications. Built for modern web architectures like JAMStack applications and Vite-powered React sites, it provides route & meta tag management, sitemap generation, and static site generation or [prerender](https://github.com/prerender/prerender) support to ensure your React applications are fully discoverable by search engines.

## Why Routerino?

- SEO-First Design: Automatic meta tag management, sitemap generation, and prerender support ensure maximum search engine visibility
- Zero Added Dependencies: Keeps bundle size minimal and reduces supply-chain vulnerabilities
- Simple API: No special `Link` components required - use standard HTML anchors and navigate programmatically with standard browser APIs
- Static Site Generation: Build-tool agnostic static HTML generation for improved performance and SEO
- Prerender Ready: Works with prerender servers (such as prerender/prerender) via dedicated meta tags for correct crawler status codes
- Single File Core: The entire routing logic fits in one file, making it easy to understand and customize

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Props](#props-arguments)
  - [useRouterino Hook](#using-the-userouterino-hook)
  - [updateHeadTag](#updateheadtag)
- [TypeScript Support](#typescript-support)
- [Best Practices](#routerino-best-practices)
- [Generating a Sitemap](#generating-a-sitemap-from-routes)
- [Static Site Generation](#static-site-generation)
- [How-to Guides & Examples](#how-to-guides--example-code)
  - [Starting a New Project](#starting-a-new-react-project-with-routerino)
  - [Full React Example](#full-react-example)
  - [Basic Example](#basic-example)
- [ErrorBoundary Component](#errorboundary-component)
- [Vendoring Routerino](#vendoring-routerino)
- [Additional Resources](#additional-resources)
- [Contributions](#contributions)
- [License](#license)

## Quick Start

```jsx
// export your routes for SSG, not required for CSR-only
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

This simple configuration automatically handles routing, meta tags, and SEO optimization for your React application.

## Features

- Routing
  - Easy integration of simple routing for your React app (supports React 18 and 19)
  - Zero dependencies for lighter, more maintainable projects
  - No special link components required, works great for Markdown-based pages and semantic HTML

- SEO Optimization
  - Configure title, description, and image for each route
  - Set `<head>` tags for any route (either directly in your routes config, or dynamically after rendering)
  - Set a site-wide name to be included with page titles
  - Automatically generate and maintain an up-to-date `sitemap.xml` from your routes
  - Generate static HTML files for each route with proper meta tags
  - Implement SEO best practices out-of-the-box
  - Optimize for Googlebot with pre-rendering support
  - Automatic image optimization with blur placeholders

- Enhanced User Experience
  - Support for sharing and social preview metadata
  - Snappy page transitions with automatic scroll reset, eliminating the jarring experience of landing mid-page when navigating

## Installation

```sh
npm i routerino
```

Note: Routerino requires React, React DOM, and PropTypes as peer dependencies. These are typically already installed in React projects.

### Compatibility

Routerino supports:

- React 18 and 19: Both versions are tested and supported. React 17 works for CSR-only.
- Node.js 18+: Tested on Node.js 18, 20, 22, and 24. Could be used on earlier versions if we skip tests.
- Preact: Compatible via `@preact/compat`. See [using Preact](#using-preact) below.

## Usage

Here's a short example of using Routerino in your React application:

```jsx
export const routes = [
  {
    path: "/",
    element: <p>This is the home page!</p>,
    title: "My Home Page!",
    description: "Welcome to my home page!",
  },
];
<Routerino
  title="Example.com"
  routes={routes}
  debug={window.location.hostname === "localhost"}
/>;
```

Links are just standard HTML anchor tags. No need to use special `<Link>` components—you can use whatever components or design system you like. For example: <a href="/some-page/">a link</a> is perfectly valid. This is very handy for markdown-based content. With standard link support in Routerino, you won't need to [transform your markdown content with custom React components](https://github.com/remarkjs/react-markdown?tab=readme-ov-file#appendix-b-components). Routerino handles same-origin anchor clicks. Cross-origin links and non-HTTP schemes (e.g., mailto:, tel:) are handled by the browser as usual.

### Programmatic Navigation

<details>
<summary style="cursor:pointer;font-style:italic">Navigate programmatically using standard browser APIs (expand for details)</summary>

```js
// Using History API
window.history.pushState({}, "", "/about/");
window.dispatchEvent(new PopStateEvent("popstate"));

// Working with URL and search params
const url = new URL(window.location);
url.searchParams.set("page", "2");
window.history.pushState({}, "", url.toString());
window.dispatchEvent(new PopStateEvent("popstate"));
```

</details>

See [props](#props-arguments) for full explanations and [example code](#how-to-guides--example-code) for more complete code samples.

### Using Preact

Routerino is fully compatible with Preact via the `@preact/compat` compatibility layer. This allows you to use Routerino in Preact projects with the same API.

#### Setup Instructions

1. Install Preact and the compatibility layer:

```sh
npm i preact @preact/compat
```

2. Configure your bundler to alias React to @preact/compat:

**Vite Configuration:**

```js
// vite.config.js
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

**Webpack Configuration:**

```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
};
```

3. Use Routerino exactly as you would in a React project - the API is identical!

### Props (arguments)

The table below shows all available props with their default values. See the [usage](#usage) section for examples.

#### Routerino props

All of these are optional, so it's easy to get started with nothing but a bare-bones `<Routerino />` element, to get started with a working sample page. The main props you'll need are `routes` and `title`. See [RouteConfig props](#routeconfig-props) for the route format.

| Prop                                           | Type            | Description                       | Default                       |
| ---------------------------------------------- | --------------- | --------------------------------- | ----------------------------- |
| [title](#title-string)                         | string          | The site title                    | `""`                          |
| [routes](#routes-array-of-routeconfig-objects) | RouteConfig[]   | Array of route configurations     | `[Default Route Object]`      |
| [separator](#separator-string)                 | string          | Title separator                   | `" \| "`                      |
| [notFoundTemplate](#notfoundtemplate-element)  | React.ReactNode | 404 page template                 | `<DefaultNotFoundTemplate />` |
| [notFoundTitle](#notfoundtitle-string)         | string          | 404 page title                    | `"Page not found [404]"`      |
| [errorTemplate](#errortemplate-element)        | React.ReactNode | Error page template               | `<DefaultErrorTemplate />`    |
| [errorTitle](#errortitle-string)               | string          | Error page title                  | `"Page error [500]"`          |
| [useTrailingSlash](#usetrailingslash-bool)     | boolean         | Use trailing slashes in URLs      | `true`                        |
| [usePrerenderTags](#useprerendertags-bool)     | boolean         | Use pre-render meta tags          | `false`                       |
| [baseUrl](#baseurl-string)                     | string          | Base URL for canonical tags       | `null` (uses window.location) |
| [imageUrl](#imageurl-string)                   | string          | Default image URL for sharing     | `null`                        |
| [touchIconUrl](#touchiconurl-string)           | string          | Image URL for PWA homescreen icon | `null`                        |
| [debug](#debug-boolean)                        | boolean         | Enable debug mode                 | `false`                       |

##### `title`: string;

The site title, such as "Foo.com". This will be appended to your page's title with a default separator. For example: "Page Title | Foo.com"

##### `routes`: array of `RouteConfig` objects;

See [RouteConfig props](#routeconfig-props) for more details. At a minimum a path and React element are required for each route.

- path: string;
- element: React.ReactNode;
- title?: string;
- description?: string;
- tags?: HeadTag[];
- imageUrl?: string;

##### `separator`: string;

A string to separate the page title from the site title. The default is `" | "` (a pipe character w/space around). Set this to customize the separator.

##### `notFoundTemplate`: element;

Any React element for the default (or no) route match.

Default:

```jsx
<>
  <p>No page found for this URL. [404]</p>
  <p>
    <a href="/">Home</a>
  </p>
</>
```

##### `notFoundTitle`: string;

A title string for no route match.

Default: `"Page not found [404]"`

##### `errorTemplate`: element;

Any React element for uncaught exceptions.

Default:

```jsx
<>
  <p>Page failed to load. [500]</p>
  <p>
    <a href="/">Home</a>
  </p>
</>
```

##### `errorTitle`: string;

A title string for uncaught exceptions.

Default: `"Page error [500]"`

##### `useTrailingSlash`: bool;

Use trailing slashes as the canonical URL. See best practices section for an explanation.

Default: `true`

##### `usePrerenderTags`: bool;

Include prerender-specific meta tags to enable proper error codes like 404 when serving prerendered pages to a search crawler. This means that Routerino uses <meta name="prerender-status-code" content="..."> and <meta name="prerender-header" content="Location: ..."> to signal status codes and redirects to prerender servers.

Default: `false`

##### `baseUrl`: string;

The base URL to use for canonical tags and og:url meta tags. If not provided, uses `window.location.origin`. This is useful when you want to specify the production URL regardless of the current environment.

**Important:** The baseUrl must NOT end with a trailing slash (`/`). Correct example: `"https://example.com"`

Default: `null` (uses window.location.origin)

##### `imageUrl`: string;

A string containing the path of the default (site-wide) image to use for sharing previews.

Default: `null`

##### `touchIconUrl`: string;

A string containing the path of the image to use for PWA homescreen icon.

Default: `null`

##### `debug`: boolean;

Enable debug mode for additional logging and information. When enabled, Routerino logs detailed information to the console including:

- Route changes and pattern matching
- Meta tag updates
- Error boundaries and component failures
- Performance timing information

Example debug output:

```
[Routerino] Route changed to: /products/laptop/
[Routerino] Matched pattern: /products/:id/
[Routerino] Route params: { id: "laptop" }
[Routerino] Updated meta tag: og:title = "Laptop Pro - $1299"
```

Default: `false`

#### RouteConfig props

There is a default RouteConfig that will be loaded if you don't specify any routes. The default route is a basic template that can confirm your app is working and routing is good to go.

##### path: string;

The path of the desired route. **Must start with a forward slash (`/`)**. For example: `"/foo/"`, or `"/about/"`. Supported dynamic segments use the :param syntax (e.g., /products/:id/). Wildcards, optional segments, and splats are not supported. Params are matched by position; decode values in your components if needed.

##### element: React.ReactNode;

The React element to be rendered at the desired route, for example: `<FooPage />`

##### title?: string;

The page's title, which should not include the site's title. For example: `"Contact Us"`

##### description?: string;

The page's description, which will show up on search results pages.

##### tags?: HeadTag[];

Any desired head tags for that route. See [HeadTag props](#headtag-props) for details.

##### imageUrl?: string;

An image URL to set for the page's og:image tag.

#### HeadTag props

An array of HeadTag objects that can be added to the route to manage meta tags, links, and other elements in the `<head>` section of the HTML document. These HeadTag objects are processed by the `updateHeadTag` function to update or create a `<head>` child tag (usually `<meta>` tags). The available props and most common tag attributes are listed below, but any arbitrary tag attributes are supported. See the [updateHeadTag section](#updateheadtag) for more details.

- `tag` (string, default: "meta"): The HTML element to update or create. By default, it is set to "meta", but you can specify other tags like "link" or "title".

- `soft` (boolean, default: false): When set to `true`, it prevents overwriting the value of an existing tag if it already exists. This is useful when you want to preserve existing tag attributes.

- `name` (string): The "name" attribute of the tag. Commonly used for meta tags to specify the name of the metadata.

- `property` (string): The "property" attribute of the tag. Used for Open Graph (OG) meta tags to define specific OG properties.

- `content` (string): The "content" attribute of the tag. Specifies the value or content of the metadata. Sometimes two distinct meta tags may share identical content, so it's not used for matching.

- `charset` (string): The "charset" attribute of the tag. Defines the character encoding for the document.

- `httpEquiv` (string): The "http-equiv" attribute of the tag. Used for defining HTTP headers for the document.

- `itemProp` (string): The "itemProp" attribute of the tag. Used for adding schema.org microdata to the tag.

- `rel` (string): The "rel" attribute of the tag. Specifies the relationship between the current document and the linked resource.

- `href` (string): The "href" attribute of the tag. Specifies the URL of the linked resource.

- `src` (string): The "src" attribute of the tag. Specifies the URL of an external resource, such as an image or script.

- `sizes` (string): The "sizes" attribute of the tag. Defines the sizes of the linked resource, commonly used for favicon links.

- `type` (string): The "type" attribute of the tag. Specifies the MIME type of the linked resource.

- `media` (string): The "media" attribute of the tag. Defines the media or device the linked resource is optimized for.

- `hrefLang` (string): The "hrefLang" attribute of the tag. Specifies the language of the linked resource.

- `target` (string): The "target" attribute of the tag. Defines where to open the linked resource.

### Using the `useRouterino` Hook

The `useRouterino` hook provides access to router state from any child component. This is the primary way to access route information and update head tags dynamically.

```jsx
import { useRouterino } from "routerino";

function MyComponent() {
  const { currentRoute, params, routePattern, updateHeadTag } = useRouterino();

  // Access current route information
  console.log("Current path:", currentRoute); // e.g., "/products/laptop/"
  console.log("Route pattern:", routePattern); // e.g., "/products/:id/"
  console.log("Route params:", params); // e.g., { id: "laptop" }

  // Update meta tags dynamically
  useEffect(() => {
    updateHeadTag({
      name: "description",
      content: `Product page for ${params.id}`,
    });
  }, [params.id]);

  return <div>Product: {params.id}</div>;
}
```

#### Hook Return Values

- **`currentRoute`**: The current URL path (e.g., `/foo/bar/`)
- **`routePattern`**: The matched route pattern with parameters (e.g., `/foo/:id/`)
- **`params`**: Object containing route parameters (e.g., `{id: "bar"}`)
- **`updateHeadTag`**: Function to dynamically update head tags (see [updateHeadTag](#updateheadtag) section)

### `updateHeadTag`

The `updateHeadTag` function is responsible for creating or updating the specified head tag. It searches for an existing tag based on the provided attributes (excluding the "content" attribute) to prevent duplicate tags. If a matching tag is found (and the `soft` prop is not set to `true`), the function updates the tag's attributes. If no matching tag is found, a new tag is created with the specified attributes.

Please note that the `updateHeadTag` function requires at least one attribute to be provided. If no attributes are specified, an error message will be logged.

#### Props

See [HeadTag props](#headtag-props) for arguments and some common tag attributes.

## TypeScript Support

Routerino includes TypeScript definitions out of the box. The types are automatically available when you import Routerino.

### Basic Usage

```typescript
// Both import styles are supported
import Routerino from 'routerino';  // Default import
// or
import { Routerino } from 'routerino';  // Named import (recommended)

import type { RouteConfig } from 'routerino';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <HomePage />,
    title: 'Home',
    description: 'Welcome to our site'
  }
];

// TypeScript will validate all props
<Routerino
  routes={routes}
  baseUrl="https://example.com"
  title="My Site"
/>
```

## Examples

Setting a page description:

```js
updateHeadTag({ name: "description", content: "Some description..." });
```

Adding an apple touch icon (for when saving to the home screen):

```js
updateHeadTag({
  tag: "link",
  rel: "apple-touch-icon",
  href: "/example-icon.png",
});
```

While these two examples are automatically handled for you via the `description` and `touchIconUrl` properties in [RouteConfig props](#routeconfig-props), you might want to update them later or in specific scenarios.

## Routerino Best Practices

To optimize your site for SEO and social previews when using Routerino, consider the following best practices:

### Page Titles

- Keep page titles unique for each route. Avoid including the site name like "Foo.com" in individual page titles, Routerino adds that automatically.
- Aim for concise, descriptive titles that accurately represent the page content.
- We prefer to keep title length at a max of 50-60 characters, longer text will be ignored or cut off (especially for mobile users).

### URL Structure & Canonicalization

#### Canonical URLs (Don't worry, this is handled for you!)

**What is canonicalization?**

When multiple URLs show the same content (like `/about` vs `/about/`), search engines need to know which one is the "official" version to avoid duplicate content penalties. The canonical URL tells search engines which version to index and rank.

**How Routerino handles this automatically**

- Sets `<link rel="canonical">` tags on every page pointing to the preferred URL version
- Uses the `useTrailingSlash` prop (default: `true`) to determine the canonical format
- Generates proper `og:url` meta tags for social sharing
- For SSG: Creates both file versions (`/about.html` and `/about/index.html`) with canonical tags
- For Prerender: Includes meta tags that instruct the prerender server to return 301 redirects
- Ensures sitemap.xml only contains canonical URLs

**Best practices that Routerino implements**

- Consistency: Sitemap, canonical, and redirects all agree
- Dual file generation (SSG): Creates both `/about.html` and `/about/index.html` so both URLs work
- Prerender support (SPA): Includes meta tags that tell prerender services to serve proper status codes
- Absolute URLs: When `baseUrl` is provided, canonical tags use the provided base instead of defaulting to the current domain

**Example of what's generated**

With Static Site Generation (SSG):

```html
<!-- Both /about.html and /about/index.html contain: -->
<link rel="canonical" href="https://example.com/about/" />
<meta property="og:url" content="https://example.com/about/" />
```

With Prerender (SPA):

```html
<!-- For canonical URL (/about/) -->
<link rel="canonical" href="https://example.com/about/" />
<meta property="og:url" content="https://example.com/about/" />

<!-- For non-canonical URL (/about) -->
<meta name="prerender-status-code" content="301" />
<meta name="prerender-header" content="Location: https://example.com/about/" />
```

You can override the default with `useTrailingSlash={false}` if you prefer URLs without trailing slashes. Either way, Routerino ensures search engines see consistent, canonical URLs.

### Sitemap Generation

- Automate the creation of `sitemap.xml` and `robots.txt` during your build process with Routerino Forge.
- The Vite plugin automatically generates these files when building static sites (see [Static Site Generation](#static-site-generation)).

### Social Previews & Open Graph

Routerino automatically sets the core Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`) for every page. Here's how to optimize them:

#### Image Best Practices

- Size: Use 1200×630 pixels (1.91:1 ratio) for maximum compatibility
- Content: Avoid text in images - use metadata for text instead (per Apple's guidelines)
- Add dimensions for faster first-share rendering:
  ```js
  // In your route's component or after data loading
  updateHeadTag({ property: "og:image:width", content: "1200" });
  updateHeadTag({ property: "og:image:height", content: "630" });
  ```

#### Title & Branding

- Don't duplicate branding in `og:title` - Routerino uses your page title directly
- For site-wide branding, add `og:site_name` instead:
  ```js
  updateHeadTag({ property: "og:site_name", content: "Your Brand" });
  ```

#### Platform-Specific Enhancements

- Apple/iMessage: Set `touchIconUrl` prop for iMessage link previews
- Video content: Add direct playable assets when possible:
  ```js
  updateHeadTag({
    property: "og:video",
    content: "https://example.com/video.mp4",
  });
  updateHeadTag({ property: "og:video:type", content: "video/mp4" });
  ```

#### Testing Your Previews

Test how your links appear on different platforms:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - Use "Scrape Again" after changes
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**Tip**: Social platforms cache previews aggressively. After updating tags, use each platform's debugger to force a refresh.

#### Twitter Card Tags (Handled Automatically)

Routerino automatically includes Twitter card meta tags to ensure rich previews when your links are shared on Twitter/X:

```html
<meta name="twitter:card" content="summary_large_image" />
```

**What this does:**

- Without Twitter cards: Links appear as plain URLs with no preview
- With Twitter cards: Links show rich previews with title, description, and image

**How it works:**

- Routerino always sets `summary_large_image` for maximum engagement
- If you provide an `imageUrl`, Twitter displays a large prominent image
- If no image is provided, Twitter gracefully falls back to a text-only card
- This is better than no card at all (which would show just the bare URL)

**The complete picture:**

```html
<!-- What Routerino generates for social sharing -->
<meta name="twitter:card" content="summary_large_image" />
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Your page description" />
<meta property="og:image" content="https://example.com/preview.jpg" />
```

This creates an engaging Twitter preview with a large image, title, and description - much more clickable than a plain URL.

### Meta Descriptions

- Provide unique, informative descriptions for each route.
- Descriptions may be used for snippets so keep them short and to the point.
- Descriptions longer than ~150 characters may be truncated in search results.

### Additional SEO Considerations

- Use semantic HTML elements in your components for better content structure.
- Implement structured data (JSON-LD) where applicable to enhance rich snippets in search results.
- Ensure your site is mobile-friendly and loads quickly for better search engine rankings.

By following these practices, you'll improve your site's SEO performance and social media presence when using Routerino.

## Sitemap and robots.txt Generation

When using Routerino Forge for static site generation, `sitemap.xml` and `robots.txt` files are automatically generated during the build process:

- sitemap.xml: Contains all static routes (dynamic routes with parameters like `:id` are excluded)
- robots.txt: Created with a reference to the sitemap (if it doesn't already exist)

These files are generated automatically when you build with the Routerino Forge Vite plugin - no additional configuration needed.

### Sample Build Output:

```
✓ Generated sitemap.xml with 42 URLs
✓ Generated robots.txt
✓ Generated 42 static pages + 404.html
```

## Static Site Generation

Routerino provides static site generation (SSG), creating fully-rendered HTML files at build time with "just clean JSX elements that render identically on server and client."

### Routerino Forge - Vite Plugin for SSG

The Vite plugin generates static HTML files with your React components fully rendered at build time. Zero configuration required - the plugin automatically handles all the complexity!

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { routerinoForge } from "routerino/forge";

export default defineConfig({
  plugins: [
    react(),
    routerinoForge({
      baseUrl: "https://example.com", // Your production URL (no trailing slash)
      // Optional settings (these are the defaults):
      // routes: "./src/routes.jsx", // Your routes file (and App.jsx for full layout)
      // outputDir: "dist",
      // generateSitemap: true,
      // useTrailingSlash: true, // Set to false for /about instead of /about/
      // verbose: false,
      // ssgCacheDir: "node_modules/.cache/routerino-forge", // SSG cache directory
      // optimizeImages: true, // Enable image optimization (see below)
    }),
  ],
});
```

**Requirements:**

- Your `index.html` must have `<div id="root"></div>` (standard for all React apps)
- **IMPORTANT**: Routes must be exported (not defined inline) for SSG to work

**Features:**

- Renders your components to HTML at build time (SSG)
- Generates dual files for maximum URL compatibility:
  - `/about` → `about.html`
  - `/about/` → `about/index.html`
  - Canonical URLs and redirects based on `useTrailingSlash` setting
  - Prerender compatible 301 redirects for non-canonical versions
- **Static host ready**: Output format aligns perfectly with Vercel, Netlify, and Cloudflare Pages conventions
  - Routes generate `/path/index.html` for clean URLs (and `/path.html` for compatibility with no-slash URLs)
  - `404.html` at root for custom error pages
  - No server configuration needed - just deploy!
- Automatic canonical URL and og:url meta tags
- Injects rendered HTML into your root div
- Generates sitemap.xml and robots.txt
- Creates a 404.html page
- Skips dynamic routes (with `:param` syntax)
- SEO optimized: Complete HTML with meta tags
- Image optimization: Automatic blur placeholders (LQIP)
- Easy configuration: Works out of the box with Vite and minimal setup

#### Image Optimization

Routerino Forge can automatically optimize images in your static builds for faster loading:

```js
routerinoForge({
  optimizeImages: true, // Enable with defaults
  // Or configure in detail:
  optimizeImages: {
    enabled: true,
    placeholderSize: 20, // Size of blur placeholder (20x20 pixels)
    blur: 4, // Blur radius for placeholder
    maxSize: 10485760, // Maximum image size to process (10MB)
    minSize: 1024, // Minimum image size to process (1KB)
    cacheDir: "node_modules/.cache/routerino-forge", // Cache directory
  },
});
```

**What it does:**

- Generates tiny blur placeholders for images (base64 encoded)
- Caches processed images to speed up subsequent builds
- Preserves original images while enhancing loading performance
- Skips external images (http/https), data URIs, and SVGs
- Smart sizing: Uses aspect-ratio only to prevent layout shift without forcing dimensions
- Hides images initially with `opacity: 0` to prevent broken image icons during load

**Note:** Image optimization requires `ffmpeg` to be installed. Without it, images work normally but without blur placeholders. Install with `brew install ffmpeg` (Mac), `apt install ffmpeg` (Ubuntu), or `choco install ffmpeg` (Windows).

##### CI/CD Setup for Image Optimization

To enable image optimization in your CI/CD pipeline, you need to install ffmpeg. Here are examples for the most common setups:

###### GitHub Actions

Add the `setup-ffmpeg` action to your workflow:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      # Install ffmpeg for image optimization
      - name: Setup FFmpeg
        uses: FedericoCarboni/setup-ffmpeg@v3
        with:
          ffmpeg-version: release

      - run: npm ci
      - run: npm run build

      # Deploy to GitHub Pages (optional)
      - uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

###### Docker

For containerized deployments, install ffmpeg in your Dockerfile:

```dockerfile
FROM node:20-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

###### Netlify

Netlify builds run on Ubuntu images, so you can install ffmpeg using apt-get in your build command.

In your netlify.toml:

```
[build]
  command = "apt-get update && apt-get install -y ffmpeg && npm ci && npm run build"
  publish = "dist"
```

#### Routes Configuration

**Critical for SSG**: Routes MUST be exported for the build plugin to discover them. The plugin needs to import your routes at build time, so inline route definitions won't work.

To include your full layout (headers, footers, etc.) in static generated HTML, export routes from the same file as your App component:

```jsx
// App.jsx - export routes from here for full layout SSG
export const routes = [
  { path: "/", element: <HomePage />, title: "Home" },
  { path: "/about/", element: <AboutPage />, title: "About" },
];

export default function App() {
  return (
    <main>
      <Header />
      <Routerino routes={routes} />
      <Footer />
    </main>
  );
}
```

This ensures your entire App layout is rendered during static site generation. Without this, SSG renders only the individual route elements.

Define routes with an `element` property containing JSX elements:

```jsx
export const routes = [
  {
    path: "/",
    element: <HomePage featured="Latest News" />, // Props preserved
    title: "Home - My Site",
    description: "Welcome to our site",
    imageUrl: "/images/home-og.jpg", // Optional social image
  },
  {
    path: "/about/",
    element: <AboutPage />,
    title: "About Us",
    description: "Learn more about our team",
  },
  {
    path: "/products/:id", // Dynamic route - won't be statically generated
    element: <ProductDetail />,
    title: "Product Detail",
  },
];

// Optional: Custom 404 page
export const notFoundTemplate = (
  <div>
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you're looking for doesn't exist.</p>
  </div>
);
```

#### Generating Routes from Data (e.g., Product Listings)

You can dynamically generate routes from data sources at build time. This is perfect for creating SEO-friendly static pages for products, blog posts, or any content from APIs or databases:

```jsx
// src/routes.jsx
import { ProductPage } from "./components/ProductPage";
import { BlogPost } from "./components/BlogPost";

// This could be fetched from an API at build time
const products = [
  {
    id: "laptop-pro",
    name: "Laptop Pro",
    price: 1299,
    description: "High-performance laptop",
  },
  {
    id: "wireless-mouse",
    name: "Wireless Mouse",
    price: 49,
    description: "Ergonomic wireless mouse",
  },
  { id: "usb-hub", name: "USB Hub", price: 29, description: "7-port USB hub" },
];

// Generate a route for each product
const productRoutes = products.map((product) => ({
  path: `/products/${product.id}/`,
  element: <ProductPage product={product} />,
  title: `${product.name} - $${product.price}`,
  description: product.description,
  tags: [
    { property: "og:type", content: "product" },
    { property: "product:price:amount", content: product.price.toString() },
    { property: "product:price:currency", content: "USD" },
  ],
}));

// You can also fetch data asynchronously at build time
const blogPosts = await fetch("https://api.example.com/posts")
  .then((res) => res.json())
  .catch(() => []); // Fallback to empty array if API fails

const blogRoutes = blogPosts.map((post) => ({
  path: `/blog/${post.slug}/`,
  element: <BlogPost post={post} />,
  title: post.title,
  description: post.excerpt,
  imageUrl: post.featuredImage,
  tags: [
    { property: "og:type", content: "article" },
    { property: "article:published_time", content: post.publishedAt },
    { property: "article:author", content: post.author },
  ],
}));

// Combine all routes
export const routes = [
  {
    path: "/",
    element: <HomePage />,
    title: "Home",
    description: "Welcome to our store",
  },
  ...productRoutes, // All products get their own static pages
  ...blogRoutes, // All blog posts get their own static pages
  {
    path: "/products/",
    element: <ProductListing products={products} />,
    title: "All Products",
    description: "Browse our product catalog",
  },
];
```

**Benefits of this approach:**

- Each product/post gets its own static HTML page with proper SEO meta tags
- All generated routes are automatically included in `sitemap.xml`
- Search engines can discover and index every product/post
- Fast page loads since HTML is pre-rendered at build time
- Type-safe if using TypeScript with your data structures

### What Gets Generated

The static build process will:

- Generate HTML files for each static route (e.g., `/about/` → `about/index.html` & `about.html`)
- Skip dynamic routes with parameters (e.g., `/user/:id`)
- Apply route-specific meta tags (title, description, og:image)
- Generate `sitemap.xml` with all static routes (Vite plugin only)
- Preserve your existing HTML structure and assets

### Example Output

For a route configuration like:

```javascript
{
  path: '/about/',
  title: 'About Us',
  description: 'Learn more about our company',
  imageUrl: 'https://example.com/about-og.jpg'
}
```

The generated `/about/index.html` will include:

```html
<title>About Us</title>
<meta name="description" content="Learn more about our company" />
<meta property="og:title" content="About Us" />
<meta property="og:description" content="Learn more about our company" />
<meta property="og:image" content="https://example.com/about-og.jpg" />
<meta property="og:url" content="https://example.com/about/" />
```

This provides excellent SEO while maintaining the benefits of a React SPA.

## How-to Guides & Example Code

1. [Starting a New React Project with Routerino](#starting-a-new-react-project-with-routerino)
2. [Full React Example](#full-react-example)
3. [Basic Example](#basic-example)

### Starting a New React Project with Routerino

If you're starting from scratch and wondering "How do I create a React project with Routerino?", here's a recommended approach:

1. First, ensure you have [Node.js](https://nodejs.org/) and npm (Node Package Manager) installed on your system. If you're just getting started, consider using a Node version manager like [Volta](https://volta.sh/), [fnm](https://github.com/Schniz/fnm), or [asdf](https://asdf-vm.com/) for easy installation and management of Node.js versions.

2. We recommend using [Vite](https://vitejs.dev/) for a fast and lean development experience. Vite is a modern build tool that focuses on speed and simplicity. To create a new React project with Vite, run the following command in your terminal:

```
npm create vite@latest my-react-app -- --template react
```

This command will create a new directory called `my-react-app` with a basic React project structure.

3. Navigate to your new project directory:

```
cd my-react-app
```

4. Install the project dependencies using npm:

```
npm install
```

This command will read the `package.json` file in your project and install all the necessary dependencies.

5. Now, add Routerino to your project as a dependency:

```
npm install routerino
```

This command will install the latest version of Routerino and save it to your `package.json` file under the `dependencies` section.

With these steps, you'll have a new React project set up with Vite as the build tool and Routerino installed as a dependency. You can now start building your application with React & Routerino.

### Full React Example

This example includes the full React configuration. It might take the place of `src/main.jsx` or an `index.js` file.

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

## ErrorBoundary Component

Routerino exports an `ErrorBoundary` component that you can use in your own applications to catch and handle React component errors gracefully. Fun fact: error boundary components are one of the last cases that still require using a React Class! Since this library aims to include everything you need to build a multiple page React SPA, and enable users to be able to know which component had an issue without confusing it with a Routerino bug.

### Import

```jsx
import { ErrorBoundary } from "routerino";
```

### Usage

```jsx
<ErrorBoundary
  fallback={<div>Something went wrong. Please try again.</div>}
  errorTitleString="Error | My Application"
  debug={window.location.hostname === "localhost"} // Auto-enable on localhost
>
  <MyComponent />
</ErrorBoundary>
```

### Props

| Prop               | Type        | Required | Description                                                       |
| ------------------ | ----------- | -------- | ----------------------------------------------------------------- |
| `children`         | `ReactNode` | No       | The child components to render when there's no error              |
| `fallback`         | `ReactNode` | No       | The UI to display when an error is caught                         |
| `errorTitleString` | `string`    | Yes      | The document title to set when an error occurs                    |
| `usePrerenderTags` | `boolean`   | No       | Whether to set prerender meta tags (status code 500)              |
| `routePath`        | `string`    | No       | The current route path for better error context (used internally) |
| `debug`            | `boolean`   | No       | Enable detailed console logging of errors (default: `false`)      |

### Debug Logging

When `debug` is set to `true`, the ErrorBoundary provides detailed console output:

- Groups error information for better readability
- Logs the component stack trace showing exactly where the error occurred
- Shows the failed route path (if available)
- Includes timestamp of when the error occurred

**Recommended debug pattern:**

```jsx
// Auto-enable debug mode on localhost
debug={window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"}

// Or use environment variable
debug={process.env.NODE_ENV === "development"}
```

### Features

- Catches JavaScript errors in child component tree
- Displays fallback UI instead of white screen
- Sets document title on error
- Provides detailed debug logging when enabled
- Optionally sets prerender status code for SEO
- Used internally by Routerino to protect route components

This is the same error boundary used internally by Routerino to protect your route components from crashing the entire application.

## Vendoring Routerino

If you prefer to include Routerino directly in your project instead of using it as a dependency, you can easily vendor the library. Vendoring allows you to have full control over the version of Routerino used in your project and eliminates the need to manage it as an external dependency.

To vendor Routerino, follow these steps:

1. Download the `routerino.jsx` file from the Routerino [repository](./routerino.jsx).

2. Place the `routerino.jsx` file in a suitable location within your project's source directory. For example, you could create a `vendor` folder and place the file there:

```md
your-project/
├── src/
│ ├── vendor/
│ │ └── routerino.jsx
│ └── ...
└── ...
```

3. Update your import statements to reference the vendored `routerino.jsx` file instead of the npm package:

```jsx
// Before (importing from the package)
import Routerino from "routerino";

// After (importing from the vendored file)
import Routerino from "./vendor/routerino";
```

4. You're all set! Routerino is now vendored in your project, and you can use it as before.

5. If using the Routerino Forge plugin for SSG and to automatically generate a sitemap during the build process, be sure to copy it over as well.

By vendoring Routerino, you have full control over the code and can make any necessary modifications directly to the `routerino.jsx` file. However, keep in mind that you'll need to manually update the vendored file if you want to incorporate any future updates or bug fixes from the main Routerino repository.

## Additional Resources

Here are some sources for further reading on SEO best-practices.

- [Optimize Largest Contentful Paint (LCP)](https://web.dev/articles/optimize-lcp) - Improve loading performance
- [Apple's best practices for link previews](https://developer.apple.com/library/archive/technotes/tn2444/_index.html)
- [Use Open Graph tags](https://ahrefs.com/blog/open-graph-meta-tags/)
- [Use descriptive link text](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en&ref_topic=9460495)

## Contributions

Contributions are always welcome. Please feel free to create an issue or submit a pull request. Just remember to keep it simple!

## License

Routerino is [MIT licensed](./LICENSE).
