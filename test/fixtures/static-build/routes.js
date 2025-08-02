import React from "react";

// Simple example page component
const PageComponent = ({ children, ...props }) => {
  return React.createElement("article", props, children);
};

const routes = [
  {
    path: "/",
    element: React.createElement(PageComponent, { className: "home-page" }, [
      React.createElement("h1", { key: "title" }, "Test Home Page"),
      React.createElement(
        "p",
        { key: "content" },
        "This is test content for SSR."
      ),
    ]),
    title: "Test Home",
    description: "Test home page description",
  },
  {
    path: "/about",
    element: React.createElement(PageComponent, { className: "about-page" }, [
      React.createElement("h1", { key: "title" }, "Test About Page"),
      React.createElement(
        "p",
        { key: "content" },
        "About page content for testing."
      ),
    ]),
    title: "Test About",
    description: "Test about page description",
    tags: [
      { property: "og:image", content: "https://example.com/about.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  },
  {
    path: "/blog/:id",
    element: React.createElement(
      "div",
      null,
      "Dynamic route - should be skipped"
    ),
    title: "Blog Post",
  },
];

export default routes;
