import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes";
import "./style.css";

const App = () => (
  <div className="min-h-screen flex flex-col">
    <header className="navbar bg-base-200 shadow-lg">
      <div className="flex-1">
        <h1 className="text-xl font-bold text-primary px-4">
          Routerino Basic Example
        </h1>
      </div>
    </header>

    <main className="flex-1 container mx-auto px-4 py-8">
      <Routerino
        routes={routes}
        title="Basic Example"
        separator=" | "
        notFoundTemplate={
          <div className="hero min-h-[50vh]">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold text-error">404</h1>
                <p className="py-6">
                  The page you're looking for doesn't exist.
                </p>
                <a href="/" className="btn btn-primary">
                  Go back home
                </a>
              </div>
            </div>
          </div>
        }
      />
    </main>

    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <p>© 2025 Routerino Basic Example</p>
    </footer>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
