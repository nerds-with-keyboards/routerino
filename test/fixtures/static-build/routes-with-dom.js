import React from "react";

// Routes with plain DOM elements
const routes = [
  {
    path: "/plain",
    // Using plain div
    element: React.createElement(
      "div",
      { className: "plain" },
      "Plain DOM element"
    ),
    title: "Plain Element",
    description: "Testing plain DOM elements",
  },
];

export default routes;
