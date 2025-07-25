import React from "react";
import Layout from "../components/Layout.jsx";

const Home = () => {
  return (
    <Layout>
      <section className="hero">
        <div className="hero-content">
          <h1>The Lightweight React Router</h1>
          <p className="hero-subtitle">
            Zero dependencies. Built-in SEO. Prerendering support. Static site
            generation.
          </p>
          <div className="hero-actions">
            <a href="/docs" className="btn btn-primary">
              Get Started
            </a>
            <a
              href="https://github.com/nerds-with-keyboards/routerino"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
          <div className="install-command">
            <code>npm install routerino</code>
          </div>
        </div>
      </section>

      <section className="features-preview">
        <div className="container">
          <h2>Why Routerino?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Zero Dependencies</h3>
              <p>
                No external dependencies means a smaller bundle size and fewer
                security concerns.
              </p>
            </div>
            <div className="feature-card">
              <h3>SEO First</h3>
              <p>
                Built-in meta tag management, Open Graph support, and prerender
                detection.
              </p>
            </div>
            <div className="feature-card">
              <h3>Static Generation</h3>
              <p>
                Generate static HTML files for each route with proper meta tags.
              </p>
            </div>
            <div className="feature-card">
              <h3>TypeScript Ready</h3>
              <p>
                Full TypeScript support with comprehensive type definitions.
              </p>
            </div>
            <div className="feature-card">
              <h3>Lightweight</h3>
              <p>Minimal overhead with a tiny runtime footprint.</p>
            </div>
            <div className="feature-card">
              <h3>Easy to Use</h3>
              <p>Simple API that feels familiar to React Router users.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-start">
        <div className="container">
          <h2>Quick Start</h2>
          <div className="code-example">
            <pre>
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
          <a href="/docs" className="btn btn-primary">
            Read the Documentation
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
