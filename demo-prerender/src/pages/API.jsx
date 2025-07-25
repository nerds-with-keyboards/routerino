import React from "react";
import Layout from "../components/Layout.jsx";

const API = () => {
  return (
    <Layout>
      <div className="page-container">
        <h1>API Reference</h1>

        <section className="api-section">
          <h2>Routerino Component</h2>
          <p>
            The main router component that manages routing in your application.
          </p>

          <h3>Props</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>routes</code>
                </td>
                <td>
                  <code>Route[]</code>
                </td>
                <td>Required</td>
                <td>Array of route objects defining your application routes</td>
              </tr>
              <tr>
                <td>
                  <code>title</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>""</code>
                </td>
                <td>Base title for your site</td>
              </tr>
              <tr>
                <td>
                  <code>titleSeparator</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>" - "</code>
                </td>
                <td>Separator between page title and site title</td>
              </tr>
              <tr>
                <td>
                  <code>description</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>""</code>
                </td>
                <td>Default meta description</td>
              </tr>
              <tr>
                <td>
                  <code>imageUrl</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>""</code>
                </td>
                <td>Default Open Graph image URL</td>
              </tr>
              <tr>
                <td>
                  <code>touchIconUrl</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>""</code>
                </td>
                <td>Apple touch icon URL</td>
              </tr>
              <tr>
                <td>
                  <code>notFoundTemplate</code>
                </td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>
                  <code>&lt;div&gt;404&lt;/div&gt;</code>
                </td>
                <td>Component to render for 404 errors</td>
              </tr>
              <tr>
                <td>
                  <code>errorTemplate</code>
                </td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>
                  <code>&lt;div&gt;Error&lt;/div&gt;</code>
                </td>
                <td>Component to render for errors</td>
              </tr>
              <tr>
                <td>
                  <code>useTrailingSlash</code>
                </td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>false</code>
                </td>
                <td>Enforce trailing slashes on URLs</td>
              </tr>
              <tr>
                <td>
                  <code>usePrerenderTags</code>
                </td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>true</code>
                </td>
                <td>Enable prerender meta tags for bots</td>
              </tr>
              <tr>
                <td>
                  <code>debug</code>
                </td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>false</code>
                </td>
                <td>Enable debug logging</td>
              </tr>
              <tr>
                <td>
                  <code>children</code>
                </td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>Required</td>
                <td>Must include an element with id="routerino-target"</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="api-section">
          <h2>Route Object</h2>
          <p>Configuration object for individual routes.</p>

          <h3>Properties</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>path</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>Yes</td>
                <td>URL path pattern (supports parameters like :id)</td>
              </tr>
              <tr>
                <td>
                  <code>element</code>
                </td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>Yes</td>
                <td>React component to render for this route</td>
              </tr>
              <tr>
                <td>
                  <code>title</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>No</td>
                <td>Page title (will be combined with site title)</td>
              </tr>
              <tr>
                <td>
                  <code>description</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>No</td>
                <td>Meta description for the page</td>
              </tr>
              <tr>
                <td>
                  <code>imageUrl</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>No</td>
                <td>Open Graph image URL for this page</td>
              </tr>
              <tr>
                <td>
                  <code>tags</code>
                </td>
                <td>
                  <code>HeadTag[]</code>
                </td>
                <td>No</td>
                <td>Additional meta tags for this route</td>
              </tr>
            </tbody>
          </table>

          <h3>Example</h3>
          <div className="code-example">
            <pre>
              <code>{`const route = {
  path: '/blog/:slug',
  element: <BlogPost />,
  title: 'Blog Post',
  description: 'Read our latest blog post',
  imageUrl: 'https://example.com/blog-image.jpg',
  tags: [
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
};`}</code>
            </pre>
          </div>
        </section>

        <section className="api-section">
          <h2>updateHeadTag Function</h2>
          <p>Utility function to dynamically update meta tags.</p>

          <h3>Syntax</h3>
          <div className="code-example">
            <pre>
              <code>{`updateHeadTag(tagConfig: HeadTag): void`}</code>
            </pre>
          </div>

          <h3>Parameters</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>tag</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>"meta"</code>
                </td>
                <td>HTML tag name</td>
              </tr>
              <tr>
                <td>
                  <code>soft</code>
                </td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>false</code>
                </td>
                <td>Skip update if tag already exists</td>
              </tr>
              <tr>
                <td>
                  <code>name</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
                <td>Name attribute for meta tags</td>
              </tr>
              <tr>
                <td>
                  <code>property</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
                <td>Property attribute for Open Graph tags</td>
              </tr>
              <tr>
                <td>
                  <code>content</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
                <td>Content attribute value</td>
              </tr>
              <tr>
                <td>
                  <code>rel</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
                <td>Rel attribute for link tags</td>
              </tr>
              <tr>
                <td>
                  <code>href</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
                <td>Href attribute for link tags</td>
              </tr>
            </tbody>
          </table>

          <h3>Examples</h3>
          <div className="code-example">
            <pre>
              <code>{`import { updateHeadTag } from 'routerino';

// Update meta description
updateHeadTag({
  name: 'description',
  content: 'New page description'
});

// Update Open Graph image
updateHeadTag({
  property: 'og:image',
  content: 'https://example.com/image.jpg'
});

// Add canonical link
updateHeadTag({
  tag: 'link',
  rel: 'canonical',
  href: 'https://example.com/page'
});

// Soft update (won't overwrite if exists)
updateHeadTag({
  name: 'author',
  content: 'John Doe',
  soft: true
});`}</code>
            </pre>
          </div>
        </section>

        <section className="api-section">
          <h2>ErrorBoundary Component</h2>
          <p>
            A React error boundary component for handling errors gracefully.
          </p>

          <h3>Props</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>fallback</code>
                </td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>Required</td>
                <td>Component to render when error occurs</td>
              </tr>
              <tr>
                <td>
                  <code>errorTitleString</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>"Error"</code>
                </td>
                <td>Page title when error occurs</td>
              </tr>
              <tr>
                <td>
                  <code>usePrerenderTags</code>
                </td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>true</code>
                </td>
                <td>Add prerender error tags</td>
              </tr>
              <tr>
                <td>
                  <code>routePath</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
                <td>Current route path for logging</td>
              </tr>
            </tbody>
          </table>

          <h3>Example</h3>
          <div className="code-example">
            <pre>
              <code>{`import { ErrorBoundary } from 'routerino';

function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorPage />}
      errorTitleString="Error | My Site"
    >
      <Routerino routes={routes}>
        <div id="routerino-target"></div>
      </Routerino>
    </ErrorBoundary>
  );
}`}</code>
            </pre>
          </div>
        </section>

        <section className="api-section">
          <h2>Global Variables</h2>

          <h3>window.routerinoParams</h3>
          <p>Object containing route parameters for dynamic routes.</p>
          <div className="code-example">
            <pre>
              <code>{`// Route: /user/:id
// URL: /user/123

console.log(window.routerinoParams);
// { id: "123" }

// Route: /blog/:year/:month/:slug
// URL: /blog/2024/01/my-post

console.log(window.routerinoParams);
// { year: "2024", month: "01", slug: "my-post" }`}</code>
            </pre>
          </div>

          <h3>window.prerenderReady</h3>
          <p>
            Flag to indicate when dynamic content is ready for prerendering.
          </p>
          <div className="code-example">
            <pre>
              <code>{`// Set to false while loading
window.prerenderReady = false;

// When content is loaded
fetchData().then(data => {
  setContent(data);
  window.prerenderReady = true;
});`}</code>
            </pre>
          </div>
        </section>

        <section className="api-section">
          <h2>TypeScript Types</h2>
          <p>Routerino includes comprehensive TypeScript definitions.</p>

          <div className="code-example">
            <pre>
              <code>{`import type { Route, RoutePropTypes, HeadTag } from 'routerino';

const routes: Route[] = [
  {
    path: '/',
    element: <Home />,
    title: 'Home',
    description: 'Homepage',
    tags: [
      { property: 'og:type', content: 'website' }
    ]
  }
];

const props: RoutePropTypes = {
  routes,
  title: 'My App',
  notFoundTemplate: <NotFound />
};`}</code>
            </pre>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default API;
