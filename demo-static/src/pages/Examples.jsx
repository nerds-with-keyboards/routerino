import React from "react";
import Layout from "../components/Layout.jsx";

const Examples = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Examples</h1>
        <p className="text-lg mb-8">
          See Routerino in action with these practical examples.
        </p>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Basic Blog</h2>
          <p className="mb-4">
            A simple blog with dynamic routes and SEO optimization.
          </p>
          <div className="mockup-code">
            <pre data-prefix="">
              <code>{`// routes.js
const routes = [
  {
    path: '/',
    element: <BlogList />,
    title: 'My Blog',
    description: 'Welcome to my personal blog'
  },
  {
    path: '/post/:slug',
    element: <BlogPost />,
    // Title and meta tags set dynamically in component
  },
  {
    path: '/category/:category',
    element: <CategoryPage />
  },
  {
    path: '/about',
    element: <About />,
    title: 'About Me',
    description: 'Learn more about the author'
  }
];

// BlogPost component
function BlogPost() {
  const { slug } = window.routerinoParams;
  const [post, setPost] = useState(null);
  
  useEffect(() => {
    // Fetch post data
    fetchPost(slug).then(data => {
      setPost(data);
      
      // Update meta tags dynamically
      updateHeadTag({
        name: 'description',
        content: data.excerpt
      });
      
      updateHeadTag({
        property: 'og:title',
        content: data.title
      });
      
      updateHeadTag({
        property: 'og:image',
        content: data.featuredImage
      });
    });
  }, [slug]);
  
  return (
    <article>
      {post && (
        <>
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </>
      )}
    </article>
  );
}`}</code>
            </pre>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            E-commerce Product Catalog
          </h2>
          <p className="mb-4">
            Product listing with filters and dynamic routing.
          </p>
          <div className="mockup-code">
            <pre data-prefix="">
              <code>{`const routes = [
  {
    path: '/',
    element: <HomePage />,
    title: 'Welcome to Our Store'
  },
  {
    path: '/products',
    element: <ProductList />,
    title: 'All Products'
  },
  {
    path: '/products/:category',
    element: <ProductList />,
    // Dynamic title based on category
  },
  {
    path: '/product/:id',
    element: <ProductDetail />,
    // SEO tags set in component
  },
  {
    path: '/cart',
    element: <ShoppingCart />,
    title: 'Shopping Cart'
  },
  {
    path: '/checkout',
    element: <Checkout />,
    title: 'Checkout'
  }
];`}</code>
            </pre>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Documentation Site</h2>
          <p className="mb-4">
            Multi-page documentation with sidebar navigation.
          </p>
          <div className="mockup-code">
            <pre data-prefix="">
              <code>{`const routes = [
  {
    path: '/',
    element: <DocsLayout />,
    title: 'Documentation',
    children: [
      {
        path: '/',
        element: <Introduction />
      },
      {
        path: '/getting-started',
        element: <GettingStarted />,
        title: 'Getting Started'
      },
      {
        path: '/api/:component',
        element: <ApiDocs />,
        // Dynamic title: "API - ComponentName"
      },
      {
        path: '/examples',
        element: <Examples />,
        title: 'Examples'
      }
    ]
  }
];

// DocsLayout with persistent sidebar
function DocsLayout() {
  return (
    <div className="docs-container">
      <Sidebar />
      <main>
        <div id="routerino-target"></div>
      </main>
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Portfolio Site</h2>
          <p className="mb-4">Personal portfolio with project showcase.</p>
          <div className="mockup-code">
            <pre data-prefix="">
              <code>{`const routes = [
  {
    path: '/',
    element: <Home />,
    title: 'John Doe - Full Stack Developer',
    description: 'Portfolio of John Doe, a full stack developer',
    imageUrl: '/profile.jpg'
  },
  {
    path: '/projects',
    element: <Projects />,
    title: 'Projects'
  },
  {
    path: '/project/:slug',
    element: <ProjectDetail />,
    // Dynamic SEO per project
  },
  {
    path: '/blog',
    element: <Blog />,
    title: 'Blog'
  },
  {
    path: '/contact',
    element: <Contact />,
    title: 'Contact',
    description: 'Get in touch'
  }
];`}</code>
            </pre>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Static Site Generation</h2>
          <p className="mb-4">Example of static build configuration.</p>
          <div className="mockup-code">
            <pre data-prefix="">
              <code>{`// package.json
{
  "scripts": {
    "build": "vite build && npm run build:static",
    "build:static": "routerino-build-static routesFile=src/routes.js outputDir=dist template=dist/index.html baseUrl=https://mysite.com"
  }
}

// vite.config.js with Routerino plugin
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import routerinoStatic from 'routerino/plugin';

export default defineConfig({
  plugins: [
    react(),
    routerinoStatic({
      routes: './src/routes.js',
      template: './index.html'
    })
  ]
});`}</code>
            </pre>
          </div>
        </section>

        <section className="card bg-primary text-primary-content p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Try Routerino Today</h2>
          <p className="mb-6">
            Start building SEO-friendly React applications with zero
            dependencies.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/docs" className="btn btn-secondary btn-lg">
              Get Started
            </a>
            <a
              href="https://github.com/nerds-with-keyboards/routerino"
              className="btn btn-outline btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Examples;
