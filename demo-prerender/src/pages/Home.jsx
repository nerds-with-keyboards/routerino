import React from "react";
import Layout from "../components/Layout.jsx";

const Home = () => {
  return (
    <Layout>
      <section className="hero min-h-[70vh] bg-gradient-to-br from-primary to-secondary text-primary-content">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              The Lightweight React Router
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Zero dependencies. Built-in SEO. Prerendering support. Static site
              generation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <a href="/docs" className="btn btn-primary btn-lg">
                Get Started
              </a>
              <a
                href="https://github.com/nerds-with-keyboards/routerino"
                className="btn btn-outline btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </div>
            <div className="mockup-code bg-base-300 text-base-content">
              <pre data-prefix="$">
                <code>npm install routerino</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Routerino?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">Zero Dependencies</h3>
                <p>
                  No external dependencies means a smaller bundle size and fewer
                  security concerns.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">SEO First</h3>
                <p>
                  Built-in meta tag management, Open Graph support, and
                  prerender detection.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">Static Generation</h3>
                <p>
                  Generate static HTML files for each route with proper meta
                  tags.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">TypeScript Ready</h3>
                <p>
                  Full TypeScript support with comprehensive type definitions.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">Lightweight</h3>
                <p>Minimal overhead with a tiny runtime footprint.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">Easy to Use</h3>
                <p>Simple API that feels familiar to React Router users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Quick Start</h2>
          <div className="mockup-code text-left mb-8">
            <pre data-prefix="">
              <code>{`import Routerino from 'routerino';

const routes = [
  {
    path: '/',
    element: <Home />,
    title: 'Home',
    description: 'Welcome to my site'
  },
  {
    path: '/about',
    element: <About />,
    title: 'About',
    description: 'Learn more about us'
  }
];

function App() {
  return (
    <Routerino routes={routes} title="My Site">
      <div id="routerino-target"></div>
    </Routerino>
  );
}`}</code>
            </pre>
          </div>
          <a href="/docs" className="btn btn-primary btn-lg">
            Read the Documentation
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
