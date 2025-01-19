# Routerino

> A lightweight, SEO-optimized React router for modern websites and applications

Routerino is a zero-dependency router tailored for [React](https://reactjs.org/) [client-side rendered (CSR)](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#csr) websites - perfect for modern web architectures like [JAMStack](https://jamstack.org/) or simple [Vite.js](https://vitejs.dev/)-React sites. It supports [Prerender](https://github.com/prerender/prerender) tags for SEO-friendly redirects and HTTP status codes, and can **automatically generate a sitemap.xml** file from your routes. Routerino simplifies client-side routing in React apps while providing handy SEO optimizations out of the box - a **minimalist router with SEO benefits**.

As a developer, I've always been passionate about creating user-friendly applications and websites. However, I've faced challenges in routing and SEO optimization for React client-side rendered (CSR) websites. For years, the de facto routing monoculture has stifled diversity and innovation in the React ecosystem. Moreover, keeping up with the frequent API churn has been time-consuming and frustrating. Driven by these challenges, I set out to create Routerino — a lightweight, zero-dependency router that simplifies routing and offers excellent SEO benefits.

I also wanted the ability to steer clear of the JSX-soup that has become prevalent in the React ecosystem. HTML is a powerful tool and it's often enough. Attempts to abstract away the web browser have led to excessive complexity, an endless black hole of bugs, and poor developer experience and delivery speed. If you've encountered such issues, you know exactly what I mean. By using plain HTML in JSX, we can build applications with simplicity. We shouldn't use this as an excuse to introduce needless complexity.

Here's a quick example of what using Routerino looks like:

```jsx
<Routerino
  title="Example.com"
  routes={[
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
      tags: [{ property: "og:type", content="article" }]
    },
  ]}
/>
```

For more details on getting started, see the [Installation](#installation) and [Usage](#usage) sections below.

## Features

Routerino empowers developers to define and manage routing and SEO concerns in one centralized location. This approach eliminates duplication when creating sitemaps and setting page metadata, such as descriptions or open-graph tags. The core of Routerino fits in a single file, making it [easy to vendor](#vendoring-routerino) if that suits your needs.

Key capabilities:

- Routing

  - Easy integration of simple routing for your React app (supports React v18, older versions have not yet been tested)
  - Zero dependencies for lighter, more maintainable projects
  - No special link components required, works great for Markdown-based pages and semantic HTML

- SEO Optimization

  - Configure title, description, and image for each route
  - Set `<head>` tags for any route (either directly in your routes config, or dynamically after rendering)
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

## Usage

Here's a quick example of using Routerino in your React application:

```jsx
<Routerino
  title="Example.com"
  routes={[
    {
      path: "/",
      element: <p>This is the home page!</p>,
      title: "My Home Page!",
      description: "Welcome to my home page!",
    },
  ]}
/>
```

Links are just regular HTML anchor tags. No need to use special `<Link>` components and you can handle styling however you wish. For example: `<a href="/some-page/>a link</a>`

See [props](#props-arguments) for full explanations and [example code](#how-to-guides--example-code) for more complete code samples.

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

See [RouteConfig props](#routeconfig-props) for more details. At a minimum a path and React element are required for each route.

- path: string;
- element: React.ReactNode;
- title?: string;
- description?: string;
- tags?: HeadTag[];
- imageUrl?: string;

##### `separator`: string;

A string to separate the page title from the site title. The default is `|` (a pipe character w/space around). Set this to customize the separator.

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

Include meta tags to enable proper error codes like 404 when serving pages to a search crawler.

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

Any desired head tags for that route. See [HeadTag props](#headtag-props) for details.

##### titlePrefix?: string;

Deprecated: a title prefix for this route to override the default. Use title and separator instead.

##### titlePostfix?: string;

Deprecated: a title postfix for this route to override the default. Use title and separator instead.

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

### Get route parameters and the current route, and updating head tags

Child components can access the current route and its parameters via the `Routerino` or `routerino` props. This prop is an object with the following properties:

- routePattern: The current route path pattern, such as `/foo/:id/`.
- currentRoute: The current route path, such as `/foo/bar/`.
- params: a dictionary of route parameters, such as `{id: "bar"}`. These will match the route pattern provided by the `path` prop.
- updateHeadTag: a function that takes a [HeadTag object](#headtag-props) and updates the head tags for the current route. This is useful for setting custom `<head>` child tags for each route, such as Open Graph tags for social previews. You may need to set this after doing some data fetches, for example. See the next section for more details.

### `updateHeadTag`

The `updateHeadTag` function is responsible for creating or updating the specified head tag. It searches for an existing tag based on the provided attributes (excluding the "content" attribute) to prevent duplicate tags. If a matching tag is found (and the `soft` prop is not set to `true`), the function updates the tag's attributes. If no matching tag is found, a new tag is created with the specified attributes.

Please note that the `updateHeadTag` function requires at least one attribute to be provided. If no attributes are specified, an error message will be logged.

### Props

See [HeadTag props](#headtag-props) for arguments and some common tag attributes.

#### Examples

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
- Include any other Open Graph tags you need for each page with the `updateHeadTag` function.

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

You can use the included CLI tool `routerino-build-sitemap` to create a sitemap.xml for your site. Adjust the arguments to your needs. Make sure to run a build first (or otherwise ensure the directory for the sitemap exists). Routes with route params are not added to the sitemap. This sitemap only includes the location entry, as the others are [mostly ignored by Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#additional-notes-about-xml-sitemaps). Node 16+ should be installed and available in the path. Since it would be an SEO problem to not have the `robots.txt` file pointing to the sitemap, we include it if missing. If you create your own, make sure to include the sitemap URL in it.

### Arguments

- routeFilePath: The path to whichever file contains your routes, in order for the sitemap build tool to find them. The routes can be defined either inline in the Routerino props, or kept in an array named `routes`, `Routes`, or just exported as default. This might be something like `src/Router/index.jsx`, or `src/App.jsx`. Whichever file you've put your routes in should be used.
- hostname: The domain to use as the base for the URLs in the sitemap. E.g. `https://example.com`. Make sure to include or exclude the `www` prefix as desired.
- outputDir: The path to write the new sitemap XML file. This would usually be a build directory, e.g. `dist` or `build`, or maybe something like `public` if you wanted to check in the sitemap to your repo (set it as a pre-commit step in that case).

### Example Usage

```sh
routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://example.com outputDir=dist
```

### Sample Output:

`✅ sitemap.xml with 42 URLs written to dist`

`✅ robots.txt written to dist`

### Adding to package.json scripts

Add `routerino-build-sitemap` to your build command to update automatically on every build.

Example package.json build script: `"build": "vite build && routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://example.com outputDir=dist",`

## How-to Guides & Example Code

1. [Starting a New React Project with Routerino](#starting-a-new-react-project-with-routerino)
2. [Basic Example](#basic-example)
3. [Full React Example](#full-react-example)

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

With these steps, you'll have a new React project set up with Vite as the build tool and Routerino installed as a development dependency. You can now start building your application with React & Routerino.

### Basic Example

Somewhere in your project, such as in your `src/App.jsx` file, import Routerino and add it to your code. Define your routes and configure the site title.

```jsx
import React from "react";
import Routerino from "routerino";

// example pages
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";

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

export default App;
```

### Full React Example

This example includes the full React configuration. It might take the place of `src/main.jsx` or an `index.js` file. Also suitable for use in a code-pen.

```jsx
import React from "react";
import { render } from "react-dom";
import Routerino from "routerino";

const title = "Example.com";
const routes = [
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
      {...{
        title,
        routes,
      }}
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

3. Update your import statements to reference the vendored `routerino.jsx` file instead of the package:

```jsx
// Before (importing from the package)
import { Router, Route } from "routerino";

// After (importing from the vendored file)
import { Router, Route } from "./vendor/routerino";
```

4. You're all set! Routerino is now vendored in your project, and you can use it as before.

5. If you want to use the [sitemap generation script](./build-sitemap.js), copy `build-sitemap.js` into your project and reference it directly with the same arguments [as above](#generating-a-sitemap-from-routes). For example: `./build-sitemap.js routeFilePath=src/App.jsx hostname=https://example.com outputDir=build`

By vendoring Routerino, you have full control over the code and can make any necessary modifications directly to the `routerino.jsx` file. However, keep in mind that you'll need to manually update the vendored file if you want to incorporate any future updates or bug fixes from the main Routerino repository.

## Additional Resources

There is a lot of information on SEO and social previews. Here are some sources for further reading on best-practices.

- [Apple's best practices for link previews](https://developer.apple.com/library/archive/technotes/tn2444/_index.html)
- [Use Open Graph tags](https://ahrefs.com/blog/open-graph-meta-tags/)
- [Use descriptive link text](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en&ref_topic=9460495)

## Contributions

Contributions are always welcome. Please feel free to create an issue or submit a pull request. Just remember to keep it simple!

## License

Routerino is [MIT licensed](./LICENSE).
