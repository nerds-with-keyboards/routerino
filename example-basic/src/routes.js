import React from "react";

// Simple page components
const HomePage = () => (
  <div>
    <h1>Welcome to Routerino!</h1>
    <p>This is a basic example showing simple routing with Routerino.</p>
    <nav>
      <a href="/about">About</a> | <a href="/blog">Blog</a> |{" "}
      <a href="/contact">Contact</a>
    </nav>
  </div>
);

const AboutPage = () => (
  <div>
    <h1>About Us</h1>
    <p>We love building fast, SEO-friendly React applications!</p>
    <a href="/">← Back to Home</a>
  </div>
);

const BlogPage = () => (
  <div>
    <h1>Blog</h1>
    <p>Check out our latest posts:</p>
    <ul>
      <li>
        <a href="/blog/getting-started">Getting Started with Routerino</a>
      </li>
      <li>
        <a href="/blog/seo-tips">SEO Tips for React Apps</a>
      </li>
    </ul>
    <a href="/">← Back to Home</a>
  </div>
);

const BlogPost = ({ routerino }) => (
  <div>
    <h1>Blog Post: {routerino.params.slug}</h1>
    <p>This is a dynamic route. The slug is: {routerino.params.slug}</p>
    <a href="/blog">← Back to Blog</a>
  </div>
);

const ContactPage = () => (
  <div>
    <h1>Contact Us</h1>
    <p>Email us at: hello@example.com</p>
    <a href="/">← Back to Home</a>
  </div>
);

export default [
  {
    path: "/",
    element: <HomePage />,
    title: "Home",
    description: "Welcome to my awesome website built with Routerino",
  },
  {
    path: "/about",
    element: <AboutPage />,
    title: "About Us",
    description: "Learn more about our company and mission",
  },
  {
    path: "/blog",
    element: <BlogPage />,
    title: "Blog",
    description: "Read our latest articles and insights",
  },
  {
    path: "/blog/:slug",
    element: <BlogPost />,
    title: "Blog Post",
    description: "Read our blog post",
  },
  {
    path: "/contact",
    element: <ContactPage />,
    title: "Contact Us",
    description: "Get in touch with our team",
  },
];
