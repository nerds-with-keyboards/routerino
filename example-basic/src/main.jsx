import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes";
import "./style.css";

const App = () => (
  <div className="app">
    <header>
      <h1>Routerino Basic Example</h1>
    </header>

    <main>
      <Routerino
        routes={routes}
        title="Basic Example"
        separator=" | "
        notFoundTemplate={
          <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/">Go back home</a>
          </div>
        }
      />
    </main>

    <footer>
      <p>© 2025 Routerino Basic Example</p>
    </footer>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
