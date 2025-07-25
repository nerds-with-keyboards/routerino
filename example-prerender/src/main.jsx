import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes";
import "./style.css";

const App = () => (
  <div className="app">
    <header>
      <h1>🔍 Routerino + Prerendering</h1>
      <p>SEO-optimized React routing with server-side rendering for bots</p>
    </header>

    <main>
      <Routerino
        routes={routes}
        title="Prerender Example"
        separator=" - "
        notFoundTemplate={
          <div>
            <h1>404 - Page Not Found</h1>
            <p>This page doesn't exist.</p>
            <a href="/">Go back home</a>
          </div>
        }
        // Enable prerender meta tags
        usePrerenderTags={true}
      />
    </main>

    <footer>
      <p>
        View prerendered HTML:{" "}
        <code>curl -H "User-Agent: Googlebot" http://localhost:8082</code>
      </p>
    </footer>
  </div>
);

// Mark page as ready for prerendering
if (window.prerenderReady) {
  window.prerenderReady = false;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Signal to prerender that the page is ready
setTimeout(() => {
  if (window.prerenderReady !== undefined) {
    window.prerenderReady = true;
  }
}, 100);
