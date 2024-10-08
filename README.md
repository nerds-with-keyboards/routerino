# Routerino

> A lightweight, SEO-optimized React router for modern web applications

Routerino is a zero-dependency router tailored for [React](https://reactjs.org/) [client-side rendered (CSR)](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#csr) websites - perfect for modern web architectures like [JAMStack](https://jamstack.org/) or simple [Vite.js](https://vitejs.dev/)-React sites. It supports [Prerender](https://github.com/prerender/prerender) tags for SEO-friendly redirects and HTTP status codes, and can automatically generate a sitemap.xml file from your routes. Routerino simplifies client-side routing in React apps while providing essential [SEO](https://developer.mozilla.org/en-US/docs/Glossary/SEO) optimizations out of the box, making it a minimalist router with SEO benefits.

## Features

Routerino empowers developers to define and manage routing and SEO concerns in one centralized location. This approach eliminates duplication when creating sitemaps and setting page metadata like descriptions or open-graph tags. The core fits in one file for easy vendoring if that suits your need.

Key capabilities:

- Routing

  - Easy integration of simple routing for your React app (supports React v18, older versions have not yet been tested)
  - Zero dependencies for lighter, more maintainable projects

- SEO Optimization

  - Configure title, description, and image for each route
  - Set `<head>` tags for any route
  - Set a site-wide name to be included with page titles
  - Automatically generate and maintain an up-to-date `sitemap.xml` from your routes
  - Implement SEO best practices out-of-the-box
  - Optimize for Googlebot with pre-rendering support

- Enhanced User Experience

  - Support for sharing and social preview metadata
  - Snappy page transitions with automatic scroll reset, eliminating the jarring experience of landing mid-page when navigating

Routerino is designed to work with modern browsers and has been tested with the latest versions of Chrome, Firefox, Safari, and Edge.

## Installation

Ensure that you have React and React DOM installed in your project as peer dependencies. To add as a dev dependency:

```sh
npm i routerino -D
```

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

5. Now, add Routerino to your project as a development dependency:

```

npm install routerino --save-dev

```

This command will install the latest version of Routerino and save it to your `package.json` file under the `devDependencies` section.

With these steps, you'll have a new React project set up with Vite as the build tool and Routerino installed as a development dependency. You can now start building your application and incorporating Routerino for client-side routing and SEO optimizations.

## Usage

Here's a minimal example of using Routerino in your React application:

```jsx
import React from "react";
import { render } from "react-dom";
import Routerino from "routerino";

const routes = [
  {
    path: "/",
    element: <HomePage />,
    title: "Home",
    description: "Welcome to my website!",
  },
  {
    path: "/about/",
    element: <AboutPage />,
    title: "About",
    description: "Learn more about us.",
  },
  {
    path: "/contact/",
    element: <ContactPage />,
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
      title="Foo.com"
      routes={routes}
      notFoundTitle="Sorry, but this page does not exist."
      errorTitle="Yikes! Something went wrong."
    />

    <footer>
      <p>
        Learn more <a href="/about/">about us</a> or{" "}
        <a href="/contact/">contact us</a> today.
      </p>
    </footer>
  </main>
);

render(<App />, document.getElementById("root"));
```

### Props (arguments)

Please see the [default props](#default-props) and [usage](#usage) sections for more details.

#### Routerino props

All of these are optional, so it's easy to get started with nothing but a bare-bones `<Routerino />` element, to get started with a working sample page. The main props you'll need are `routes` and `title`. See [Route props](#routes-prop) for the route format.

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
| [usePrerenderTags](#useprerendertags-bool)     | boolean         | Use pre-render meta tags          | `true`                        |
| [imageUrl](#imageurl-string)                   | string          | Default image URL for sharing     | `null`                        |
| [touchIconUrl](#touchiconurl-string)           | string          | Image URL for PWA homescreen icon | `null`                        |
| [debug](#debug-boolean)                        | boolean         | Enable debug mode                 | `false`                       |
| [titlePrefix](#titleprefix-string)             | string          | Deprecated: Title prefix          | `""`                          |
| [titlePostfix](#titlepostfix-string)           | string          | Deprecated: Title postfix         | `""`                          |

##### `title`: string;

The site title, such as "Foo.com". This will be appended to your page's title with a default separator. For example: "Page Title | Foo.com"

##### `routes`: array of `RouteConfig` objects;

See [RouteConfig props](#routeconfig-props) for more details.

- path: string;
- element: React.ReactNode;
- title?: string;
- description?: string;
- tags?: HeadTag[];
- titlePrefix?: string;
- titlePostfix?: string;
- imageUrl?: string;

###### `tags`: array of `HeadTag` objects;

This is where you can put head tags that you want to have set for a page. For example, for a blog post you may want to use: `tags: [{ property: "og:type", content: "article" }]`. Requires at least one attribute to set, use the dictionary keys to correspond to the attributes you want to set in the tag.

##### `separator`: string;

A string to separate the page title from the site title. The default is `|` (a pipe character with spaces around). Set this to customize the separator.

##### `notFoundTemplate`: element;

Any React element for the default (or no) match.

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

A title string for no match.

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

Is the page using trailing slashes as the canonical URL? See best practices section for an explanation.

Default: `true`

##### `usePrerenderTags`: bool;

Is the page using pre-render technology? If so, we will include meta tags to enable proper error codes like 404 when serving pages to a search crawler.

Default: `true`

##### `titlePrefix`: string;

Deprecated: use `title` instead. A string to preprend to every title. Should include the brand name, a separator, and spacing, such as `Example.com | `<- Note the extra end space.

Default: `""` (empty string)

##### `titlePostfix`: string;

Deprecated: use `title` instead. A string to append to every title. Should include the brand name, a separator, and spacing, such as the following example. Note the extra starting space ->` - Example.com`.

Default: `""` (empty string)

##### `imageUrl`: string;

A string containing the path of the default (site-wide) image to use for sharing previews.

Default: `null`

##### `touchIconUrl`: string;

A string containing the path of the image to use for PWA homescreen icon.

Default: `null`

##### `debug`: boolean;

Enable debug mode for additional logging and information.

Default: `false`

#### RouteConfig props

There is a default RouteConfig that will be loaded if you don't specify any routes. The default route is a basic template that can confirm your app is working and routing is good to go.

##### path: string;

The path of the desired route, for example: `"/foo/"`.

##### element: React.ReactNode;

The React element to be rendered at the desired route, for example: `<FooPage />`

##### title?: string;

The page's title, which should not include the site's title. For example: `"Contact Us"`

##### description?: string;

The page's description, which will show up on search results pages.

##### tags?: HeadTag[];

Any desired head tags for that route.

##### titlePrefix?: string;

Deprecated: a title prefix for this route to override the default.

##### titlePostfix?: string;

Deprecated: a title postfix for this route to override the default.

##### imageUrl?: string;

An image URL to set for the page's og:image tag.

#### HeadTag props

Head tags can have a lot of attributes. The first one is `tag`, which sets the HTML tag with a default of meta e.g. `<meta ... />`. The next prop is `soft` which will preserve the existing tag if it is present already.

### Get route parameters and the current route, and updating head tags

Child components can access the current route and its parameters via the `routerino` prop. This prop is an object with the following properties:

- routePattern: The current route path pattern, such as `/foo/:id/`.
- currentRoute: The current route path, such as `/foo/bar/`.
- params: a dictionary of route parameters, such as `{id: "bar"}`. These will match the route pattern provided by the `path` prop.
- updateHeadTag: a function that takes a tag object and updates the head tags for the current route. This is useful for setting custom tags for each route, such as `og:image` for social previews. You may need to set this after doing some data fetches, for example. Sample: `updateHeadTag({ name: "description", content: 'Some description...' });`

## Routerino Best Practices

To optimize your site for SEO and social previews when using Routerino, consider the following best practices:

### Page Titles

- Keep page titles unique for each route. Avoid including the site title (e.g., "Foo.com") in individual page titles.
- Aim for concise, descriptive titles that accurately represent the page content.
- Ideal title length is typically 50-60 characters.

### URL Structure

- Maintain trailing slash consistency: Search engines treat `example.com/foo` and `example.com/foo/` as different pages.
- Routerino will render the same content for both versions to avoid user errors.
- Routerino will use the `useTrailingSlash` prop to automatically set the preferred URL version for search engines.

### Sitemap Generation

- Automate the creation of `sitemap.xml` during your build process with Routerino.
- Use the `routerino-build-sitemap` command to generate the sitemap from your routes (see [Generating a Sitemap from Routes](#generating-a-sitemap-from-routes)).

### Social Previews

- Add an `imageUrl` to each route for page-specific social preview images.
- Set a default `imageUrl` via the Routerino prop for pages without unique images.
- Ensure preview images meet platform-specific size requirements (e.g., 1200x630 pixels for Facebook).
- Include any other open graph tags you need for each page with the `updateHeadTag` function.

### Meta Descriptions

- Provide unique, informative descriptions for each route.
- Keep descriptions between 100-200 characters. This range is optimal for most search engines.
- Descriptions longer than ~150 characters may be truncated in search results.

### Additional SEO Considerations

- Use semantic HTML elements in your components for better content structure.
- Implement structured data (JSON-LD) where applicable to enhance rich snippets in search results.
- Ensure your site is mobile-friendly and loads quickly for better search engine rankings.

By following these practices, you'll improve your site's SEO performance and social media presence when using Routerino.

## Generating a sitemap from routes

You can use the included CLI tool `routerino-build-sitemap` to create a sitemap.xml for your site. Adjust the arguments to your needs. Make sure to run a build first (or ensure the directory for the sitemap exists). Note: routes with route params are not added to the sitemap. Node 16+ should be installed and available in the path. If no `robots.txt` file is found, a default one will be created which just points to the sitemap. It would be an SEO problem to not have the `robots.txt` file pointing to the sitemap, so we include it if necessary. If you create your own, make sure to include the sitemap URL.

### Arguments

- routeFilePath: The path to whichever file contains your routes, in order for the sitemap build tool to find them. The routes can be defined either inline in the Routerino props, or kept in an array named `routes`, `Routes`, or just exported as default. This might be something like `src/Router/index.jsx`, or `src/App.jsx`. Whichever file you've put your routes in should be used.
- hostname: The domain to use as the base for the URLs in the sitemap. E.g. `https://example.com`. Make sure to include or exclude the `www` prefix as desired.
- outputDir: The path to write the new sitemap XML file. This would usually be a build directory, e.g. `dist` or `build`, or maybe something like `public` if you wanted to check in the sitemap to your repo (set it as a pre-commit step in that case).

### Example

```sh
routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://example.com outputDir=dist
```

Sample Output: `✅ sitemap.xml with 42 URLs written to dist`
and: `✅ robots.txt written to dist`

### package.json scripts

Add `routerino-build-sitemap` to your build command to update automatically on every build. This sitemap only includes the location entry, as the rest are [mostly ignored by Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#additional-notes-about-xml-sitemaps).

Example package.json build script: `"build": "vite build && routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://example.com outputDir=dist",`

## Resources

There is a lot of information on SEO and social previews. Here are some sources for further reading on best-practices.

- [Apple's best practices for link previews](https://developer.apple.com/library/archive/technotes/tn2444/_index.html)
- [Use Open Graph tags](https://ahrefs.com/blog/open-graph-meta-tags/)
- [Use descriptive link text](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en&ref_topic=9460495)

## Example code

Set an apple icon (e.g. when saving to home screen)

```js
updateHeadTag({
  tag: "link",
  rel: "apple-touch-icon",
  href: "/example-icon.png",
});
```

## License

Routerino is [MIT licensed](./LICENSE).
