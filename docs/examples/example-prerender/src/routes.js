import React from "react";

// Page components with more SEO-focused content
const HomePage = () => (
  <div className="prose lg:prose-xl mx-auto">
    <h1 className="text-4xl font-bold text-primary">
      Routerino Prerender Example
    </h1>
    <p className="text-lg">
      This example demonstrates how to set up prerendering for optimal SEO. When
      search engines visit, they receive fully rendered HTML.
    </p>
    <div className="flex gap-4 my-6">
      <a href="/features" className="btn btn-primary">
        Features
      </a>
      <a href="/seo" className="btn btn-secondary">
        SEO Benefits
      </a>
      <a href="/setup" className="btn btn-accent">
        Setup Guide
      </a>
    </div>
    <div className="alert alert-info shadow-lg">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current flex-shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <h3 className="font-bold">Test this page:</h3>
          <p>
            Use curl with a Googlebot user agent to see the prerendered HTML!
          </p>
          <code className="kbd kbd-sm mt-2">
            curl -H "User-Agent: Googlebot" http://localhost:8082
          </code>
        </div>
      </div>
    </div>
  </div>
);

const FeaturesPage = () => (
  <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
    <div className="card-body">
      <h1 className="card-title text-3xl text-primary mb-4">
        Prerendering Features
      </h1>
      <h2 className="text-2xl font-bold mb-2">What You Get</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Full HTML content for search engines</li>
        <li>JavaScript stripped for faster crawling</li>
        <li>Social media preview support</li>
        <li>Caching for performance</li>
        <li>No changes to your React code</li>
      </ul>
      <div className="card-actions justify-start mt-6">
        <a href="/" className="btn btn-ghost">
          ← Back to Home
        </a>
      </div>
    </div>
  </div>
);

const SEOPage = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-3xl text-primary">
          SEO Benefits of Prerendering
        </h1>
        <p className="text-lg">
          Prerendering solves the classic problem of JavaScript-heavy SPAs being
          difficult for search engines to index properly.
        </p>
      </div>
    </div>

    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="text-2xl font-bold mb-4">Key Benefits:</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>
            <strong className="text-primary">Instant Content:</strong> Search
            engines see fully rendered HTML
          </li>
          <li>
            <strong className="text-primary">Better Rankings:</strong> Faster
            crawling leads to better SEO
          </li>
          <li>
            <strong className="text-primary">Social Previews:</strong> Facebook,
            Twitter, etc. can read your meta tags
          </li>
          <li>
            <strong className="text-primary">No Duplicate Code:</strong> Same
            React app serves both users and bots
          </li>
        </ol>
      </div>
    </div>

    <a href="/" className="btn btn-ghost">
      ← Back to Home
    </a>
  </div>
);

const SetupPage = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-bold text-primary">Setting Up Prerendering</h1>

    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="text-2xl font-bold mb-4">Quick Start with Docker</h2>
        <div className="mockup-code">
          <pre data-prefix="#">
            <code>1. Build and start services</code>
          </pre>
          <pre data-prefix="$">
            <code>docker-compose up -d</code>
          </pre>
          <pre data-prefix=""></pre>
          <pre data-prefix="#">
            <code>2. Test as a search engine</code>
          </pre>
          <pre data-prefix="$">
            <code>curl -H "User-Agent: Googlebot" http://localhost:8082</code>
          </pre>
          <pre data-prefix=""></pre>
          <pre data-prefix="#">
            <code>3. Test as a regular user</code>
          </pre>
          <pre data-prefix="$">
            <code>curl http://localhost:8082</code>
          </pre>
        </div>
      </div>
    </div>

    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <p>
          The Nginx server detects search engine bots and proxies their requests
          to the prerender service, which renders your React app server-side.
        </p>
      </div>
    </div>

    <a href="/" className="btn btn-ghost">
      ← Back to Home
    </a>
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
