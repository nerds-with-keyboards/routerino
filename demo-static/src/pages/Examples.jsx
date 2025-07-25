import React from 'react';
import Layout from '../components/Layout.jsx';

const Examples = () => {
  return (
    <Layout>
      <div className="page-container">
        <h1>Examples</h1>
        <p>See Routerino in action with these practical examples.</p>

        <section className="example-section">
          <h2>Basic Blog</h2>
          <p>A simple blog with dynamic routes and SEO optimization.</p>
          <div className="code-example">
            <pre><code>{`// routes.js
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
      document.title = \`\${data.title} | My Blog\`;
      updateHeadTag({
        name: 'description',
        content: data.excerpt
      });
      updateHeadTag({
        property: 'og:image',
        content: data.featuredImage
      });
    });
  }, [slug]);
  
  if (!post) return <div>Loading...</div>;
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}`}</code></pre>
          </div>
        </section>

        <section className="example-section">
          <h2>E-commerce Product Pages</h2>
          <p>Product pages with structured data and social sharing optimization.</p>
          <div className="code-example">
            <pre><code>{`const routes = [
  {
    path: '/products/:id',
    element: <ProductPage />,
    tags: [
      { property: 'og:type', content: 'product' }
    ]
  }
];

function ProductPage() {
  const { id } = window.routerinoParams;
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    fetchProduct(id).then(data => {
      setProduct(data);
      
      // Update all meta tags
      document.title = \`\${data.name} - \${data.price}\`;
      
      updateHeadTag({
        name: 'description',
        content: data.description
      });
      
      updateHeadTag({
        property: 'og:title',
        content: data.name
      });
      
      updateHeadTag({
        property: 'og:image',
        content: data.images[0]
      });
      
      updateHeadTag({
        property: 'product:price:amount',
        content: data.price
      });
      
      updateHeadTag({
        property: 'product:price:currency',
        content: 'USD'
      });
      
      // Add structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.name,
        "image": data.images,
        "description": data.description,
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      });
      document.head.appendChild(script);
    });
  }, [id]);
  
  return product ? <ProductDisplay product={product} /> : <Loading />;
}`}</code></pre>
          </div>
        </section>

        <section className="example-section">
          <h2>Multi-language Site</h2>
          <p>Supporting multiple languages with proper SEO tags.</p>
          <div className="code-example">
            <pre><code>{`// Separate routes for each language
const enRoutes = [
  {
    path: '/',
    element: <Home lang="en" />,
    title: 'Welcome',
    tags: [
      { tag: 'link', rel: 'alternate', hrefLang: 'es', href: 'https://example.com/es' },
      { tag: 'link', rel: 'alternate', hrefLang: 'fr', href: 'https://example.com/fr' }
    ]
  }
];

const esRoutes = [
  {
    path: '/es',
    element: <Home lang="es" />,
    title: 'Bienvenido',
    tags: [
      { tag: 'link', rel: 'alternate', hrefLang: 'en', href: 'https://example.com' },
      { tag: 'link', rel: 'alternate', hrefLang: 'fr', href: 'https://example.com/fr' },
      { property: 'og:locale', content: 'es_ES' }
    ]
  }
];

// Combine routes based on detected language
const routes = [...enRoutes, ...esRoutes];`}</code></pre>
          </div>
        </section>

        <section className="example-section">
          <h2>Protected Routes</h2>
          <p>Implementing authentication with Routerino.</p>
          <div className="code-example">
            <pre><code>{`// Create a wrapper component for protected routes
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkAuth().then(authenticated => {
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      if (!authenticated) {
        // Redirect to login
        window.location.href = '/login?redirect=' + window.location.pathname;
      }
    });
  }, []);
  
  if (isLoading) return <div>Checking authentication...</div>;
  if (!isAuthenticated) return null;
  
  return children;
}

// Use in routes
const routes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    title: 'Dashboard'
  },
  {
    path: '/login',
    element: <Login />,
    title: 'Login'
  }
];`}</code></pre>
          </div>
        </section>

        <section className="example-section">
          <h2>Static Site with Vite</h2>
          <p>Full static site generation setup.</p>
          <div className="code-example">
            <pre><code>{`// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import routerinoStatic from 'routerino/vite-plugin-routerino-static';

export default defineConfig({
  plugins: [
    react(),
    routerinoStatic({
      routesFile: './src/routes.js',
      baseUrl: 'https://mysite.com',
      generateSitemap: true
    })
  ],
  build: {
    outDir: 'dist'
  }
});

// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:static": "vite build && node build-sitemap.js",
    "preview": "vite preview"
  }
}

// Deploy to Netlify
// 1. Connect your GitHub repo
// 2. Build command: npm run build:static
// 3. Publish directory: dist
// 4. Add _redirects file for client-side routing:
/*    /index.html   200`}</code></pre>
          </div>
        </section>

        <section className="example-section">
          <h2>Integration with State Management</h2>
          <p>Using Routerino with Redux, Zustand, or Context API.</p>
          <div className="code-example">
            <pre><code>{`// With React Context
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

// App component
function App() {
  return (
    <AppProvider>
      <Routerino routes={routes}>
        <div id="routerino-target"></div>
      </Routerino>
    </AppProvider>
  );
}

// In your route components
function Profile() {
  const { user } = useContext(AppContext);
  
  useEffect(() => {
    if (user) {
      updateHeadTag({
        property: 'og:title',
        content: \`\${user.name}'s Profile\`
      });
    }
  }, [user]);
  
  return <ProfileView user={user} />;
}`}</code></pre>
          </div>
        </section>

        <section className="cta-section">
          <h2>Need More Examples?</h2>
          <p>Check out our GitHub repository for more complete examples and starter templates.</p>
          <a href="https://github.com/nerds-with-keyboards/routerino/tree/main/examples" 
             className="btn btn-primary"
             target="_blank"
             rel="noopener noreferrer">
            View on GitHub
          </a>
        </section>
      </div>
    </Layout>
  );
};

export default Examples;