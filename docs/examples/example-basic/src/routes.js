import React from "react";

// Simple page components
const HomePage = () => (
  <div className="prose lg:prose-xl mx-auto">
    <h1 className="text-4xl font-bold text-primary">Welcome to Routerino!</h1>
    <p className="text-lg">
      This is a basic example showing simple routing with Routerino.
    </p>
    <div className="flex gap-4 mt-6">
      <a href="/about" className="btn btn-primary">
        About
      </a>
      <a href="/blog" className="btn btn-secondary">
        Blog
      </a>
      <a href="/contact" className="btn btn-accent">
        Contact
      </a>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="card bg-base-200 shadow-xl max-w-2xl mx-auto">
    <div className="card-body">
      <h1 className="card-title text-3xl text-primary">About Us</h1>
      <p>We love building fast, SEO-friendly React applications!</p>
      <div className="card-actions justify-start mt-4">
        <a href="/" className="btn btn-ghost">
          ← Back to Home
        </a>
      </div>
    </div>
  </div>
);

const BlogPage = () => (
  <div className="max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-4">Blog</h1>
    <p className="mb-6">Check out our latest posts:</p>
    <div className="space-y-4">
      <a
        href="/blog/getting-started"
        className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow block"
      >
        <div className="card-body">
          <h2 className="card-title">Getting Started with Routerino</h2>
        </div>
      </a>
      <a
        href="/blog/seo-tips"
        className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow block"
      >
        <div className="card-body">
          <h2 className="card-title">SEO Tips for React Apps</h2>
        </div>
      </a>
    </div>
    <div className="mt-8">
      <a href="/" className="btn btn-ghost">
        ← Back to Home
      </a>
    </div>
  </div>
);

const BlogPost = ({ routerino }) => (
  <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
    <div className="card-body">
      <h1 className="card-title text-2xl">
        Blog Post: {routerino.params.slug}
      </h1>
      <div className="badge badge-primary badge-lg">
        {routerino.params.slug}
      </div>
      <p className="mt-4">
        This is a dynamic route. The slug is: {routerino.params.slug}
      </p>
      <div className="card-actions justify-start mt-6">
        <a href="/blog" className="btn btn-ghost">
          ← Back to Blog
        </a>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="hero min-h-[50vh]">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="py-6">
          Email us at:{" "}
          <a href="mailto:hello@example.com" className="link link-primary">
            hello@example.com
          </a>
        </p>
        <a href="/" className="btn btn-primary">
          ← Back to Home
        </a>
      </div>
    </div>
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
