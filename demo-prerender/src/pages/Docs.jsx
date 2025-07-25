import React from "react";
import Layout from "../components/Layout.jsx";

const Docs = () => {
  return (
    <Layout>
      <div className="page-container docs-container">
        <aside className="docs-sidebar">
          <nav>
            <h3>Getting Started</h3>
            <ul>
              <li>
                <a href="#installation">Installation</a>
              </li>
              <li>
                <a href="#basic-usage">Basic Usage</a>
              </li>
              <li>
                <a href="#configuration">Configuration</a>
              </li>
            </ul>
            <h3>Guides</h3>
            <ul>
              <li>
                <a href="#seo">SEO Optimization</a>
              </li>
              <li>
                <a href="#static-generation">Static Generation</a>
              </li>
              <li>
                <a href="#prerendering">Prerendering</a>
              </li>
              <li>
                <a href="#error-handling">Error Handling</a>
              </li>
            </ul>
            <h3>API Reference</h3>
            <ul>
              <li>
                <a href="/api">Complete API</a>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="docs-content">
          <h1>Documentation</h1>

          <section id="installation">
            <h2>Installation</h2>
            <p>Install Routerino using npm, yarn, or pnpm:</p>
            <div className="code-example">
              <pre>
                <code>{`npm install routerino

# or
yarn add routerino

# or
pnpm add routerino`}</code>
              </pre>
            </div>
          </section>

          <section id="basic-usage">
            <h2>Basic Usage</h2>
            <p>Here{"'"}s a minimal example to get you started:</p>
            <div className="code-example">
              <pre>
                <code>{`import React from 'react';
import ReactDOM from 'react-dom/client';
import Routerino from 'routerino';

// Define your routes
const routes = [
  {
    path: '/',
    element: <HomePage />,
    title: 'Home'
  },
  {
    path: '/about',
    element: <AboutPage />,
    title: 'About'
  },
  {
    path: '/contact',
    element: <ContactPage />,
    title: 'Contact'
  }
];

// Create your app
function App() {
  return (
    <Routerino 
      routes={routes} 
      title="My App"
    >
      <div id="routerino-target"></div>
    </Routerino>
  );
}

// Render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`}</code>
              </pre>
            </div>
          </section>

          <section id="configuration">
            <h2>Configuration</h2>
            <p>Routerino accepts several configuration props:</p>
            <div className="code-example">
              <pre>
                <code>{`<Routerino
  routes={routes}                    // Required: Array of route objects
  title="My Site"                    // Site title
  titleSeparator={" | "}              // Title separator (default: {" - "})
  description="Site description"     // Default meta description
  imageUrl="/default-image.jpg"     // Default OG image
  touchIconUrl="/icon.png"          // Apple touch icon
  notFoundTemplate={<Custom404 />}  // Custom 404 component
  errorTemplate={<ErrorPage />}     // Custom error component
  useTrailingSlash={true}           // Enforce trailing slashes
  usePrerenderTags={true}           // Enable prerender tags
  debug={false}                     // Enable debug logging
>
  <div id="routerino-target"></div>
</Routerino>`}</code>
              </pre>
            </div>
          </section>

          <section id="seo">
            <h2>SEO Optimization</h2>
            <p>Routerino makes SEO easy with built-in meta tag management:</p>

            <h3>Route-level SEO</h3>
            <div className="code-example">
              <pre>
                <code>{`const routes = [
  {
    path: '/blog/my-post',
    element: <BlogPost />,
    title: 'My Blog Post',
    description: 'This is an amazing blog post about...',
    imageUrl: 'https://example.com/post-image.jpg',
    tags: [
      { property: 'og:type', content: 'article' },
      { property: 'article:author', content: 'John Doe' },
      { property: 'article:published_time', content: '2024-01-01' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:creator', content: '@johndoe' }
    ]
  }
];`}</code>
              </pre>
            </div>

            <h3>Dynamic Meta Tags</h3>
            <p>You can also update meta tags dynamically:</p>
            <div className="code-example">
              <pre>
                <code>{`import { updateHeadTag } from 'routerino';

// In your component
useEffect(() => {
  updateHeadTag({
    name: 'description',
    content: dynamicDescription
  });
  
  updateHeadTag({
    property: 'og:image',
    content: dynamicImageUrl
  });
}, [dynamicDescription, dynamicImageUrl]);`}</code>
              </pre>
            </div>
          </section>

          <section id="static-generation">
            <h2>Static Site Generation</h2>
            <p>Generate static HTML files for better performance:</p>

            <h3>Using the Build Script</h3>
            <div className="code-example">
              <pre>
                <code>{`// package.json
{
  "scripts": {
    "build:static": "routerino-build-static"
  }
}

// Run with configuration
npm run build:static -- \\
  --routes ./src/routes.js \\
  --template ./index.html \\
  --output ./dist \\
  --base-url https://example.com`}</code>
              </pre>
            </div>
          </section>

          <section id="prerendering">
            <h2>Prerendering</h2>
            <p>Routerino includes a Docker-based prerender server for SEO:</p>

            <h3>Docker Compose Setup</h3>
            <div className="code-example">
              <pre>
                <code>{`version: '3.8'
services:
  prerender:
    build: ./node_modules/routerino/prerender
    ports:
      - "3000:3000"
    environment:
      - ALLOWED_DOMAINS=example.com,www.example.com
      - CACHE_TTL=86400000
      - PRERENDER_USER_AGENTS=all
      - STRIP_JS_USER_AGENTS=googlebot|bingbot`}</code>
              </pre>
            </div>

            <h3>Nginx Configuration</h3>
            <div className="code-example">
              <pre>
                <code>{`location / {
  try_files $uri @prerender;
}

location @prerender {
  set $prerender 0;
  
  if ($http_user_agent ~* "googlebot|bingbot|facebookexternalhit|twitterbot") {
    set $prerender 1;
  }
  
  if ($prerender = 1) {
    rewrite .* /http://$host$request_uri break;
    proxy_pass http://localhost:3000;
  }
  
  if ($prerender = 0) {
    try_files $uri $uri/ /index.html;
  }
}`}</code>
              </pre>
            </div>
          </section>

          <section id="error-handling">
            <h2>Error Handling</h2>
            <p>Routerino includes built-in error handling:</p>

            <h3>Custom Error Pages</h3>
            <div className="code-example">
              <pre>
                <code>{`<Routerino
  routes={routes}
  notFoundTemplate={
    <div className="error-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you{"'"}re looking for doesn{"'"}t exist.</p>
      <a href="/">Go Home</a>
    </div>
  }
  errorTemplate={
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>We{"'"}re sorry, but an error occurred.</p>
      <a href="/">Go Home</a>
    </div>
  }
/>`}</code>
              </pre>
            </div>

            <h3>Using the Error Boundary</h3>
            <div className="code-example">
              <pre>
                <code>{`import { ErrorBoundary } from 'routerino';

function MyApp() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      errorTitleString={"Error | My Site"}
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

          <section className="next-steps">
            <h2>Next Steps</h2>
            <ul>
              <li>
                <a href="/examples">Check out examples</a>
              </li>
              <li>
                <a href="/api">Read the API reference</a>
              </li>
              <li>
                <a href="https://github.com/nerds-with-keyboards/routerino">
                  View on GitHub
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Docs;
