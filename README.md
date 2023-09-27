# Routerino

Tiny, SEO-focused router for React CSR websites, such as JAMStack or Vite.js sites. Supports [Prerender](https://github.com/prerender/prerender) tags for handling redirects and 404 codes for SEO bots. Routerino can even generate your sitemap.xml file from your routes!

## Installation

```sh
npm i routerino
```

## Usage

Here is a basic usage example:

```jsx
import Routerino from "routerino";

const routes = [
  {
    path: "/",
    element: <p>Hello, world!</p>,
    title: "Hello!",
    description: "Lorem ipsum......",
  },
];

const App = () => (
  <div>
    <header>
      <a href="/">Home</a>
    </header>

    <Routerino routes={routes} titlePostfix=" | Foo.com" />

    <footer>
      <p>Copyright 2048 Foo.com</p>
    </footer>
  </div>
);

export default App;
```

## Generating a sitemap from routes

Run the command `build-sitemap` to create a sitemap.xml for your site. Adjust the arguments to your needs.

Arguments:

- routeFilePath: The path to whichever file contains your routes. The routes array can be defined either directly in the props to Routerino, or stored in an array called routes/Routes.
- hostname: The domain to use as the base for the URLs in the sitemap.
- outputPath: The path to write the new sitemap XML file.

Example:

```sh
build-sitemap routeFilePath=src/routes.jsx hostname=https://example.com outputPath=dist/sitemap.xml
# sitemap.xml with 12 URLs written to dist/sitemap.xml
```

Add `build-sitemap` to your build command to update automatically on every build. This sitemap only includes the location entry, as the rest are [mostly ignored by Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#additional-notes-about-xml-sitemaps).

### License

Routerino is [MIT licensed](./LICENSE).
