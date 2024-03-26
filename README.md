# Routerino

Tiny, SEO-focused router for React CSR websites, such as JAMStack or Vite.js sites. Supports [Prerender](https://github.com/prerender/prerender) tags for handling redirects and 404 codes for SEO bots. Routerino can even generate your sitemap.xml file from your routes!

## Features

Routerino allows developers to define routing and SEO metadata together. This saves duplication when creating a sitemap and setting page metadata like a description.

You can:

- easily add simple routing to your React app (supports React v18)
- set any arbitrary `<head>` tags for any route
- set the title, description, and image for each route
- configure the site name to be included with the page titles
- generate a sitemap automatically from your routes
- keep your sitemap up-to-date as part of the build process
- observe best practices for SEO
- optimize for Googlebot with pre-rendering
- support sharing and social previews

## Installation

Save it as a dev dependency. You need to have React & React DOM installed in the same project.

```sh
npm i routerino -D
```

## Usage

### Minimal example React app `App.jsx`

```jsx
import Routerino from "routerino";

const App = () => (
  <main>
    <header>
      <a href="/">Home</a>
    </header>

    <Routerino
      routes={[
        {
          path: "/",
          element: <p>Hello, world!</p>,
          title: "Hello!",
          description: "Lorem ipsum, etc...",
        },
      ]}
      titlePostfix=" | Foo.com"
    />

    <footer>
      <p>Copyright 2048 Foo.com</p>
    </footer>
  </main>
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

todo: convert these to sub sections with headings

- path: PropTypes.string.isRequired
- element: PropTypes.element.isRequired
- title: PropTypes.string
- description: PropTypes.string
- tags: PropTypes.arrayOf(PropTypes.object)
- titlePrefix: PropTypes.string
- titlePostfix: PropTypes.string
- imageUrl: PropTypes.string

##### tags

This is where you can put head tags that you want to have set for a page. For example, for a blog post you may want to use: `tags: [{ property: "og:type", content: "article" }]`

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

### Extracting route parameters, getting the current route, and updating head tags

Child components can access the current route and its parameters via the `routerino` prop. This prop is an object with the following properties:

- routePattern: The current route path pattern, such as `/foo/:id/`.
- currentRoute: The current route path, such as `/foo/bar/`.
- params: a dictionary of route parameters, such as `{id: "bar"}`. These will match the route pattern provided by the `path` prop.
- updateHeadTag: a function that takes a tag object and updates the head tags for the current route. This is useful for setting custom tags for each route, such as `og:image` for social previews. You may need to set this after doing some data fetches, for example. Sample: `updateHeadTag({ name: "description", content: 'Some description...' });`

## Routerino best practices

What are the best practices for using Routerino? For SEO and social previews?

- Don't put the site name (ex: Foo.com) in the page title. Each page title should be unique.
- Put the site name in one of the "title prefix/postfix" props. Only put the site name in one of the two props (ex: "Foo.com - Page Title" would use a `titlePrefix` of `Foo.com - `). Make sure to include your desired spacing and separator.
- Automate generation of a sitemap.xml as part of your build, which you can do with the `build-sitemap` command (see below).
- For social previews, you can add an imageUrl to each route. For pages that don't need a unique image, a sitewide default imageUrl can be set via the Routerino props.
- A canonical URL is that page URL which is considered the source of truth or "canon" for duplicate pages. Search engines consider the following URLs as two different pages: `example.com/foo` and `example.com/foo/`. We don't want to show users an error whether they use a trailing slash or not. So we will render the same page at both URLs, but for search engines, we have to point them towards which one is the canonical. Otherwise, the link equity can become split among two "different" URLs.
- Try to keep description between 100-200 chars. This is the sweet spot for most search engines. More than ~150 chars may be truncated in search results.

## Generating a sitemap from routes

You can use the included CLI tool `build-sitemap` to create a sitemap.xml for your site. Adjust the arguments to your needs. Make sure to run a build first (or create the directory for the sitemap). Note: routes with route params are not added to the sitemap. Node 16+ should be installed.

### Arguments

- routeFilePath: The path to whichever file contains your routes, in order for the sitemap build tool to find them. The routes can be defined either inline in the Routerino props, or kept in an array named `routes` or `Routes`. This might be something like `src/routes.jsx`, or `src/App.jsx`.
- hostname: The domain to use as the base for the URLs in the sitemap. E.g. `https://example.com`.
- outputPath: The path to write the new sitemap XML file. This would usually be a build directory, e.g. `dist/sitemap.xml`, or something like `public/sitemap.xml` if you want to check in the sitemap to your repo.

### Example

```sh
build-sitemap routeFilePath=src/routes.jsx hostname=https://example.com outputPath=dist/sitemap.xml
```

Sample Output: `sitemap.xml with 12 URLs written to dist/sitemap.xml`

### package.json scripts

Add `build-sitemap` to your build command to update automatically on every build. This sitemap only includes the location entry, as the rest are [mostly ignored by Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#additional-notes-about-xml-sitemaps).

Example package.json build script: `"build": "vite build && build-sitemap routeFilePath=src/App.jsx hostname=https://example.com outputPath=dist/sitemap.xml",`

## Sources & Resources

There is a lot of information on SEO and social previews. Here are some sources for further reading on best-practices.

- https://developer.apple.com/library/archive/technotes/tn2444/_index.html
- https://ahrefs.com/blog/open-graph-meta-tags/

### License

Routerino is [MIT licensed](./LICENSE).
