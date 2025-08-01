import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Routerino from "../../routerino.jsx";

const app = express();
const port = process.argv[2] || 3101;

// Test routes
const routes = [
  {
    path: "/",
    element: React.createElement("div", null, "Home Page"),
    title: "Home",
    description: "Welcome to the test site",
  },
  {
    path: "/about",
    element: React.createElement("div", null, "About Page"),
    title: "About",
    description: "Learn about us",
  },
  {
    path: "/redirect",
    element: React.createElement("div", null, "Redirecting..."),
  },
  {
    path: "/cached-test",
    element: React.createElement("div", null, "Cached Page"),
    title: "Cached",
    description: "This page should be cached",
  },
];

// Serve all routes
app.get("*", (req, res) => {
  // Simulate redirect
  if (req.path === "/redirect") {
    res.setHeader("Content-Type", "text/html");
    res.status(301);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="prerender-status-code" content="301">
        <meta name="prerender-header" content="Location: ${req.protocol}://${req.get("host")}/redirected">
      </head>
      <body>Redirecting...</body>
      </html>
    `);
    return;
  }

  // Mock window.location for SSR
  global.window = {
    location: {
      href: `http://localhost:${port}${req.path}`,
      pathname: req.path,
      search: "",
      host: `localhost:${port}`,
    },
  };

  try {
    const app = React.createElement(
      Routerino,
      { routes, title: "Test Site" },
      React.createElement("div", { id: "routerino-target" })
    );

    const html = ReactDOMServer.renderToString(app);

    // Get the current route
    const currentRoute = routes.find((r) => r.path === req.path);
    const is404 = !currentRoute;

    res.status(is404 ? 404 : 200);
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${currentRoute?.title || "404"} | Test Site</title>
        ${currentRoute?.description ? `<meta name="description" content="${currentRoute.description}">` : ""}
        ${currentRoute?.description ? `<meta property="og:description" content="${currentRoute.description}">` : ""}
        ${currentRoute?.title ? `<meta property="og:title" content="${currentRoute.title} | Test Site">` : ""}
        ${is404 ? '<meta name="prerender-status-code" content="404">' : ""}
      </head>
      <body>
        <div id="root">${html}</div>
        <script>console.log('Test app running');</script>
      </body>
      </html>
    `);
  } catch {
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
