export default [
  {
    path: "/",
    title: "Home - Vite Static",
    description: "Welcome to the Vite static build example",
    component: () => import("./pages/Home.jsx"),
  },
  {
    path: "/about",
    title: "About - Vite Static",
    description: "Learn about static site generation with Routerino",
    component: () => import("./pages/About.jsx"),
  },
  {
    path: "/features",
    title: "Features - Vite Static",
    description: "Discover the features of Routerino static builds",
    tags: [{ property: "article:author", content: "Routerino Team" }],
    component: () => import("./pages/Features.jsx"),
  },
  {
    path: "/blog/:id",
    title: "Blog Post",
    description: "Dynamic blog post",
    component: () => import("./pages/BlogPost.jsx"),
  },
];
