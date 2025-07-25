import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Routerino
      routes={routes}
      title="Routerino"
      separator=" - "
      imageUrl="https://routerino.dev/og-image.png"
      touchIconUrl="/apple-touch-icon.png"
      notFoundTemplate={
        <div className="error-page">
          <h1>404</h1>
          <p>Page not found</p>
          <a href="/">Go Home</a>
        </div>
      }
      errorTemplate={
        <div className="error-page">
          <h1>Oops!</h1>
          <p>Something went wrong</p>
          <a href="/">Go Home</a>
        </div>
      }
    >
      <div id="routerino-target"></div>
    </Routerino>
  </React.StrictMode>
);
