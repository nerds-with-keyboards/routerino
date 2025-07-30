import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes";
import "./style.css";

const App = () => (
  <div className="min-h-screen flex flex-col bg-base-200">
    <header className="hero bg-primary text-primary-content">
      <div className="hero-content text-center py-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            🔍 Routerino + Prerendering
          </h1>
          <p className="text-lg opacity-90">
            SEO-optimized React routing with server-side rendering for bots
          </p>
        </div>
      </div>
    </header>

    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-xl p-8">
        <Routerino
          routes={routes}
          title="Prerender Example"
          separator=" - "
          notFoundTemplate={
            <div className="hero min-h-[50vh]">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <h1 className="text-5xl font-bold text-error">404</h1>
                  <p className="py-6">This page doesn't exist.</p>
                  <a href="/" className="btn btn-primary">
                    Go back home
                  </a>
                </div>
              </div>
            </div>
          }
          // Enable prerender meta tags
          usePrerenderTags={true}
        />
      </div>
    </main>

    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <p>
        View prerendered HTML:{" "}
        <code className="kbd kbd-sm">
          curl -H "User-Agent: Googlebot" http://localhost:8082
        </code>
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
