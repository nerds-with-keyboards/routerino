/* eslint-disable react/prop-types */
// Test components
const HomePage = ({ featured = "Latest News" }) => (
  <div>
    <h1>Home Page</h1>
    <p>Welcome to the test app!</p>
    <p>Featured: {featured}</p>
    <nav>
      <a href="/about">About</a> | <a href="/products">Products</a> |{" "}
      <a href="/contact">Contact</a>
    </nav>
  </div>
);

const AboutPage = () => (
  <div>
    <h1>About Us</h1>
    <p>This is the about page of our test application.</p>
    <p>
      <a href="https://example.com">External Link</a>
    </p>
    <a href="/">Back to Home</a>
  </div>
);

const ProductsPage = () => (
  <div>
    <h1>Products</h1>
    <p>Browse our products:</p>
    <ul>
      <li>
        <a href="/products/1">Product 1</a>
      </li>
      <li>
        <a href="/products/2">Product 2</a>
      </li>
    </ul>
    <a href="/">Back to Home</a>
  </div>
);

const ProductDetailPage = () => (
  <div>
    <h1>Product Detail</h1>
    <p>This is a dynamic route that won't be statically generated</p>
    <a href="/products">Back to Products</a>
  </div>
);

const ContactPage = () => (
  <div>
    <h1>Contact Us</h1>
    <p>Get in touch with us!</p>
    <p>Email: test@example.com</p>
    <a href="/">Back to Home</a>
  </div>
);

// 404 Not Found template (optional export)
export const notFoundTemplate = (
  <div>
    <h2>Route Not Found</h2>
    <p>This is a not found example component.</p>
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate
      quisquam necessitatibus reprehenderit velit assumenda quidem nihil
      temporibus praesentium esse? Eum a recusandae enim magni placeat aliquam
      ullam facilis at iste.
    </p>
  </div>
);

// Routes configuration with SEO metadata
export const routes = [
  {
    path: "/",
    element: <HomePage featured="Works with Props!" />,
    title: "Home - Test App",
    description: "Welcome to our test application",
    imageUrl: "/images/home-og.jpg",
  },
  {
    path: "/about",
    element: <AboutPage />,
    title: "About Us - Test App",
    description: "Learn more about our company",
  },
  {
    path: "/products",
    element: <ProductsPage />,
    title: "Products - Test App",
    description: "Browse our product catalog",
  },
  {
    path: "/products/:id", // Dynamic route - won't be statically generated
    element: <ProductDetailPage />,
    title: "Product Detail - Test App",
    description: "Product details page",
  },
  {
    path: "/contact",
    element: <ContactPage />,
    title: "Contact Us - Test App",
    description: "Get in touch with our team",
    imageUrl: "/images/contact-og.jpg",
  },
];

export default routes;
