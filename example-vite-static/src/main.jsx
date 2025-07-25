import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes.js";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Routerino routes={routes}>
      <div className="app">
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/features">Features</a>
        </nav>
        <main id="routerino-target">{/* Routes will render here */}</main>
      </div>
    </Routerino>
  </React.StrictMode>
);
