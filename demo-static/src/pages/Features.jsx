import React from 'react';
import Layout from '../components/Layout.jsx';

const Features = () => {
  return (
    <Layout>
      <div className="page-container">
        <h1>Features</h1>
        
        <section className="feature-section">
          <h2>Core Features</h2>
          
          <div className="feature-detail">
            <h3>Zero Runtime Dependencies</h3>
            <p>Routerino has no runtime dependencies beyond React itself. This means:</p>
            <ul>
              <li>Smaller bundle size</li>
              <li>Fewer security vulnerabilities</li>
              <li>No dependency conflicts</li>
              <li>Easier maintenance</li>
            </ul>
          </div>

          <div className="feature-detail">
            <h3>SEO Optimization</h3>
            <p>Built-in SEO features include:</p>
            <ul>
              <li>Dynamic meta tag management</li>
              <li>Open Graph and Twitter Card support</li>
              <li>Canonical URL handling</li>
              <li>Automatic title composition</li>
              <li>Prerender detection for bots</li>
            </ul>
            <div className="code-example">
              <pre><code>{`{
  path: '/blog/:slug',
  element: <BlogPost />,
  title: 'Blog Post Title',
  description: 'Post description for SEO',
  imageUrl: 'https://example.com/post-image.jpg',
  tags: [
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
}`}</code></pre>
            </div>
          </div>

          <div className="feature-detail">
            <h3>Static Site Generation</h3>
            <p>Generate static HTML files for better performance and SEO:</p>
            <ul>
              <li>Build-time static HTML generation</li>
              <li>Simple command-line interface</li>
              <li>Proper meta tags in static files</li>
              <li>Works with any hosting provider</li>
            </ul>
            <div className="code-example">
              <pre><code>{`// package.json
"scripts": {
  "build:static": "routerino-build-static routesFile=src/routes.jsx outputDir=dist template=dist/index.html baseUrl=https://example.com"
}

// Run the command
npm run build:static`}</code></pre>
            </div>
          </div>

          <div className="feature-detail">
            <h3>Prerendering Support</h3>
            <p>Full prerendering support for better SEO and social sharing:</p>
            <ul>
              <li>Automatic bot detection</li>
              <li>Prerender status codes (404, 301, 500)</li>
              <li>Docker container for self-hosted prerendering</li>
              <li>Compatible with prerender.io and similar services</li>
            </ul>
          </div>

          <div className="feature-detail">
            <h3>Error Handling</h3>
            <p>Robust error handling with customizable templates:</p>
            <ul>
              <li>Built-in Error Boundary</li>
              <li>Custom 404 pages</li>
              <li>Error recovery</li>
              <li>Development-friendly error messages</li>
            </ul>
          </div>

          <div className="feature-detail">
            <h3>Dynamic Routes</h3>
            <p>Support for dynamic route parameters:</p>
            <div className="code-example">
              <pre><code>{`const routes = [
  { path: '/user/:id', element: <UserProfile /> },
  { path: '/blog/:year/:month/:slug', element: <BlogPost /> }
];

// Access params in your component
function UserProfile() {
  const { id } = window.routerinoParams;
  return <div>User ID: {id}</div>;
}`}</code></pre>
            </div>
          </div>

          <div className="feature-detail">
            <h3>TypeScript Support</h3>
            <p>Full TypeScript support with comprehensive type definitions:</p>
            <ul>
              <li>Type-safe route configuration</li>
              <li>Autocomplete for all props</li>
              <li>Strict type checking</li>
            </ul>
          </div>

          <div className="feature-detail">
            <h3>Trailing Slash Normalization</h3>
            <p>Automatic handling of trailing slashes to prevent duplicate content:</p>
            <ul>
              <li>Configurable behavior</li>
              <li>SEO-friendly redirects</li>
              <li>Consistent URL structure</li>
            </ul>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Check out our documentation to learn how to use Routerino in your project.</p>
          <a href="/docs" className="btn btn-primary">Read the Docs</a>
        </section>
      </div>
    </Layout>
  );
};

export default Features;