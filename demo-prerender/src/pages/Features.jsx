import React from "react";
import Layout from "../components/Layout.jsx";

const Features = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Features</h1>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Core Features</h2>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">
                Zero Runtime Dependencies
              </h3>
              <p>
                Routerino has no runtime dependencies beyond React itself. This
                means:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Smaller bundle size</li>
                <li>Fewer security vulnerabilities</li>
                <li>No dependency conflicts</li>
                <li>Easier maintenance</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">SEO Optimization</h3>
              <p>Built-in SEO features include:</p>
              <ul className="list-disc list-inside ml-4 mb-4">
                <li>Dynamic meta tag management</li>
                <li>Open Graph and Twitter Card support</li>
                <li>Canonical URL handling</li>
                <li>Automatic title composition</li>
                <li>Prerender detection for bots</li>
              </ul>
              <div className="mockup-code">
                <pre data-prefix="">
                  <code>{`{
  path: '/blog/:slug',
  element: <BlogPost />,
  title: 'Blog Post Title',
  description: 'Post description for SEO',
  imageUrl: 'https://example.com/post-image.jpg',
  tags: [
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">
                Static Site Generation
              </h3>
              <p>Generate static HTML files for better performance and SEO:</p>
              <ul className="list-disc list-inside ml-4 mb-4">
                <li>Build-time static HTML generation</li>
                <li>Simple command-line interface</li>
                <li>Proper meta tags in static files</li>
                <li>Works with any hosting provider</li>
              </ul>
              <div className="mockup-code">
                <pre data-prefix="">
                  <code>{`// package.json
"scripts": {
  "build:static": "routerino-build-static routesFile=src/routes.jsx outputDir=dist template=dist/index.html baseUrl=https://example.com"
}

// Run the command
npm run build:static`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">Prerendering Support</h3>
              <p>
                Full prerendering support for better SEO and social sharing:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Automatic bot detection</li>
                <li>Prerender status codes (404, 301, 500)</li>
                <li>Docker container for self-hosted prerendering</li>
                <li>Compatible with prerender.io and similar services</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">Error Handling</h3>
              <p>Robust error handling with customizable templates:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Built-in Error Boundary</li>
                <li>Custom 404 pages</li>
                <li>Error recovery</li>
                <li>Development-friendly error messages</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">Dynamic Routes</h3>
              <p>Support for dynamic route parameters:</p>
              <div className="mockup-code mt-4">
                <pre data-prefix="">
                  <code>{`const routes = [
  { path: '/user/:id', element: <UserProfile /> },
  { path: '/blog/:year/:month/:slug', element: <BlogPost /> }
];

// Access params in your component
function UserProfile() {
  const { id } = window.routerinoParams;
  return <div>User ID: {id}</div>;
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">TypeScript Support</h3>
              <p>
                Full TypeScript support with comprehensive type definitions:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Type-safe route configuration</li>
                <li>Autocomplete for all props</li>
                <li>Strict type checking</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-primary">
                Trailing Slash Normalization
              </h3>
              <p>
                Automatic handling of trailing slashes to prevent duplicate
                content:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Configurable behavior</li>
                <li>SEO-friendly redirects</li>
                <li>Consistent URL structure</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card bg-primary text-primary-content p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-6">
            Check out our documentation to learn how to use Routerino in your
            project.
          </p>
          <a href="/docs" className="btn btn-secondary btn-lg">
            Read the Docs
          </a>
        </section>
      </div>
    </Layout>
  );
};

export default Features;
