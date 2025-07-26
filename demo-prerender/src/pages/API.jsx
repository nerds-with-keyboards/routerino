import React from "react";
import Layout from "../components/Layout.jsx";

const API = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">API Reference</h1>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Routerino Component</h2>
          <p className="mb-6">
            The main router component that manages routing in your application.
          </p>

          <h3 className="text-2xl font-bold mb-4">Props</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
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
                    <code className="text-primary">routes</code>
                  </td>
                  <td>
                    <code>Route[]</code>
                  </td>
                  <td>Required</td>
                  <td>
                    Array of route objects defining your application routes
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">title</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    <code>{`""`}</code>
                  </td>
                  <td>Base title for your site</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">titleSeparator</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    <code>{`" - "`}</code>
                  </td>
                  <td>Separator between page title and site title</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">description</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    <code>{`""`}</code>
                  </td>
                  <td>Default meta description</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">imageUrl</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    <code>{`""`}</code>
                  </td>
                  <td>Default Open Graph image URL</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">touchIconUrl</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    <code>{`""`}</code>
                  </td>
                  <td>Apple touch icon URL</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">notFoundTemplate</code>
                  </td>
                  <td>
                    <code>ReactElement</code>
                  </td>
                  <td>Default 404</td>
                  <td>Custom 404 page component</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">errorTemplate</code>
                  </td>
                  <td>
                    <code>ReactElement</code>
                  </td>
                  <td>Default error</td>
                  <td>Custom error page component</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">useTrailingSlash</code>
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
                    <code className="text-primary">usePrerenderTags</code>
                  </td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    <code>true</code>
                  </td>
                  <td>Enable prerender meta tags</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">debug</code>
                  </td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>Enable debug logging</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Route Object</h2>
          <p className="mb-6">
            Each route in the routes array should have the following structure:
          </p>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
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
                    <code className="text-primary">path</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>Yes</td>
                  <td>URL path pattern (supports parameters like :id)</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">element</code>
                  </td>
                  <td>
                    <code>ReactElement</code>
                  </td>
                  <td>Yes</td>
                  <td>React component to render for this route</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">title</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>No</td>
                  <td>Page title for this route</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">description</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>No</td>
                  <td>Meta description for this route</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">imageUrl</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>No</td>
                  <td>Open Graph image URL for this route</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">tags</code>
                  </td>
                  <td>
                    <code>Tag[]</code>
                  </td>
                  <td>No</td>
                  <td>Additional meta tags for this route</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">redirectTo</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>No</td>
                  <td>Redirect to another path</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Utility Functions</h2>

          <div className="card bg-base-200 mb-4">
            <div className="card-body">
              <h3 className="card-title">updateHeadTag</h3>
              <p>Update a meta tag dynamically.</p>
              <div className="mockup-code mt-4">
                <pre data-prefix="">
                  <code>{`import { updateHeadTag } from 'routerino';

updateHeadTag({
  name: 'description',
  content: 'New description'
});

updateHeadTag({
  property: 'og:title',
  content: 'New title'
});`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 mb-4">
            <div className="card-body">
              <h3 className="card-title">navigate</h3>
              <p>Programmatically navigate to a route.</p>
              <div className="mockup-code mt-4">
                <pre data-prefix="">
                  <code>{`import { navigate } from 'routerino';

// Navigate to a path
navigate('/products');

// Navigate with state
navigate('/products', { category: 'electronics' });`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Global Variables</h2>

          <div className="card bg-base-200 mb-4">
            <div className="card-body">
              <h3 className="card-title">window.routerinoParams</h3>
              <p>Access current route parameters.</p>
              <div className="mockup-code mt-4">
                <pre data-prefix="">
                  <code>{`// For route /user/:id
// When visiting /user/123
console.log(window.routerinoParams.id); // "123"`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 mb-4">
            <div className="card-body">
              <h3 className="card-title">window.routerinoPath</h3>
              <p>Current route path.</p>
              <div className="mockup-code mt-4">
                <pre data-prefix="">
                  <code>{`console.log(window.routerinoPath); // "/current/path"`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">ErrorBoundary Component</h2>
          <p className="mb-6">
            A reusable error boundary component for handling React errors.
          </p>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code className="text-primary">fallback</code>
                  </td>
                  <td>
                    <code>ReactElement</code>
                  </td>
                  <td>Yes</td>
                  <td>Component to render when an error occurs</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">errorTitleString</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>No</td>
                  <td>Document title to set when error occurs</td>
                </tr>
                <tr>
                  <td>
                    <code className="text-primary">children</code>
                  </td>
                  <td>
                    <code>ReactNode</code>
                  </td>
                  <td>Yes</td>
                  <td>Child components to wrap</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mockup-code mt-6">
            <pre data-prefix="">
              <code>{`import { ErrorBoundary } from 'routerino';

<ErrorBoundary
  fallback={<ErrorPage />}
  errorTitleString="Error - My Site"
>
  <App />
</ErrorBoundary>`}</code>
            </pre>
          </div>
        </section>

        <section className="card bg-primary text-primary-content p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="mb-6">
            Check out our documentation and examples for more detailed usage.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/docs" className="btn btn-secondary">
              Documentation
            </a>
            <a href="/examples" className="btn btn-outline">
              Examples
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default API;
