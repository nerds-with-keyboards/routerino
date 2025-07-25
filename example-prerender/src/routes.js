import React from "react";

// Page components with more SEO-focused content
const HomePage = () => (
  <div>
    <h1>Routerino Prerender Example</h1>
    <p>
      This example demonstrates how to set up prerendering for optimal SEO. When
      search engines visit, they receive fully rendered HTML.
    </p>
    <nav>
      <a href="/features">Features</a> | <a href="/seo">SEO Benefits</a> |{" "}
      <a href="/setup">Setup Guide</a>
    </nav>
    <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0" }}>
      <p>
        <strong>Test this page:</strong> Use curl with a Googlebot user agent to
        see the prerendered HTML!
      </p>
      <code>curl -H "User-Agent: Googlebot" http://localhost:8082</code>
    </div>
  </div>
);

const FeaturesPage = () => (
  <div>
    <h1>Prerendering Features</h1>
    <h2>What You Get</h2>
    <ul>
      <li>Full HTML content for search engines</li>
      <li>JavaScript stripped for faster crawling</li>
      <li>Social media preview support</li>
      <li>Caching for performance</li>
      <li>No changes to your React code</li>
    </ul>
    <a href="/">← Back to Home</a>
  </div>
);

const SEOPage = () => (
  <div>
    <h1>SEO Benefits of Prerendering</h1>
    <p>
      Prerendering solves the classic problem of JavaScript-heavy SPAs being
      difficult for search engines to index properly.
    </p>
    <h2>Key Benefits:</h2>
    <ol>
      <li>
        <strong>Instant Content:</strong> Search engines see fully rendered HTML
      </li>
      <li>
        <strong>Better Rankings:</strong> Faster crawling leads to better SEO
      </li>
      <li>
        <strong>Social Previews:</strong> Facebook, Twitter, etc. can read your
        meta tags
      </li>
      <li>
        <strong>No Duplicate Code:</strong> Same React app serves both users and
        bots
      </li>
    </ol>
    <a href="/">← Back to Home</a>
  </div>
);

const SetupPage = () => (
  <div>
    <h1>Setting Up Prerendering</h1>
    <h2>Quick Start with Docker</h2>
    <pre>
      {`# 1. Build and start services
docker-compose up -d

# 2. Test as a search engine
curl -H "User-Agent: Googlebot" http://localhost:8082

# 3. Test as a regular user
curl http://localhost:8082`}
    </pre>
    <h2>How It Works</h2>
    <p>
      The Nginx server detects search engine bots and proxies their requests to
      the prerender service, which renders your React app server-side.
    </p>
    <a href="/">← Back to Home</a>
  </div>
);

export default [
  {
    path: "/",
    element: <HomePage />,
    title: "Prerender Example",
    description:
      "Learn how to set up prerendering for your Routerino app to improve SEO",
    tags: [
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Routerino Prerender Example" },
    ],
  },
  {
    path: "/features",
    element: <FeaturesPage />,
    title: "Prerendering Features",
    description: "Discover the features and benefits of prerendering your SPA",
  },
  {
    path: "/seo",
    element: <SEOPage />,
    title: "SEO Benefits",
    description:
      "How prerendering improves search engine optimization for React apps",
    tags: [
      { name: "keywords", content: "SEO, prerendering, React, Routerino" },
    ],
  },
  {
    path: "/setup",
    element: <SetupPage />,
    title: "Setup Guide",
    description: "Step-by-step guide to setting up prerendering with Docker",
  },
];
