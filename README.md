# Routerino

Tiny, SEO-focused router for React CSR websites, such as JAMStack or Vite.js sites. Supports [Prerender](https://github.com/prerender/prerender) tags for handling redirects and 404 codes for SEO bots. Routerino can even generate your sitemap.xml file from your routes!

## Installation

```sh
npm i routerino
```

## Usage

### Minimal example

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

### Props

Please see the [default props](#default-props) and [usage](#usage) sections for more details.

#### Main props

All of these are optional, so it's easy to get started with a simple `<Routerino />` element.

- `routes`: arrayOf(RouteProps); see below for details. If you don't set anything in this prop, you'll see a default page.
- `host`: string; The root page URL, such as `https://example.com`. Defaults to an empty string and relative paths are used.
- `notFoundTemplate`: element; Any React element for the default (or no) match.
- `notFoundTitle`: string; A title string for the default (or no) match.
- `errorTemplate`: element; Any React element for uncaught exceptions.
- `errorTitle`: string; A title string for uncaught exceptions.
- `useTrailingSlash`: bool; Is the page using trailing slashes as the canonical URL? See best practices section for an explanation.
- `usePrerenderTags`: bool; Is the page using pre-render technology? If so, we will include meta tags to enable proper error codes like 404 when serving pages to a search crawler.
- `titlePrefix`: string; A string to preprend to every title. Should include the brand name, a separator, and spacing, such as `Example.com | `<- Note the extra end space.
- `titlePostfix`: string; A string to append to every title. Should include the brand name, a separator, and spacing, such as the following example. Note the extra starting space ->` - Example.com`.
- `imageUrl`: string; A string containing the path of the default (site-wide) image to use for sharing previews. If the `host` prop is set, a relative path may be used (with or without a starting forward-slash).

#### Route props

- path: PropTypes.string.isRequired
- element: PropTypes.element.isRequired
- title: PropTypes.string
- description: PropTypes.string
- tags: PropTypes.arrayOf(PropTypes.object)
- titlePrefix: PropTypes.string
- titlePostfix: PropTypes.string
- imageUrl: PropTypes.string

### Default props

```
Routerino.defaultProps = {
  routes: [
    {
      path: "/",
      element: (
        <p>
          This is the default route. Pass an array of routes to the Routerino
          component in order to configure your own pages.
        </p>
      ),
      description: "The default route example description.",
      tags: [{ property: "og:locale", content: "en_US" }],
    },
  ],
  host: "",
  notFoundTemplate: (
    <>
      <p>No page found for this URL. [404]</p>
      <p>
        <a href="/">Home</a>
      </p>
    </>
  ),
  notFoundTitle: "Page not found [404]",
  errorTemplate: (
    <>
      <p>Page failed to load. [500]</p>
      <p>
        <a href="/">Home</a>
      </p>
    </>
  ),
  errorTitle: "Page error [500]",
  useTrailingSlash: true,
  usePrerenderTags: true,
  titlePrefix: "",
  titlePostfix: "",
};
```

## Routerino best practices

What are the best practices for using Routerino? For SEO and social previews?

- Don't page the site name (ex: Foo.com) in the page title. Each page title should be unique.
- Put the site name in one of the "title prefix/postfix" props. Only put the site name in one of the two props (ex: "Foo.com - Page Title" would use a `titlePrefix` of `Foo.com - `). Make sure to include your desired spacing and separator.
- Automate generation of a sitemap.xml as part of your build, which you can do with the `build-sitemap` command (see below).
- For social previews, you can add an imageUrl to each route. For pages that don't need a unique image, a sitewide default imageUrl can be set via the Routerino props.
- A canonical URL is that page URL which is considered the source of truth or "canon" for duplicate pages. Search engines consider the following URLs as two different pages: `example.com/foo` and `example.com/foo/`. We don't want to show users an error whether they use a trailing slash or not. So we will render the same page at both URLs, but for search engines, we have to point them towards which one is the canonical. Otherwise, the link equity can become split among two "different" URLs.

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

## Sources & Resources

- https://developer.apple.com/library/archive/technotes/tn2444/_index.html
- https://ahrefs.com/blog/open-graph-meta-tags/

### License

Routerino is [MIT licensed](./LICENSE).
