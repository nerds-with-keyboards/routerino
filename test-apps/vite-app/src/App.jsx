import Routerino from "routerino";
import { routes, notFoundTemplate } from "./routes";

function App() {
  return (
    <>
      <header
        style={{
          borderBottom: "2px solid #333",
        }}
      >
        <nav style={{ display: "flex", alignItems: "center" }}>
          <h1 style={{ marginRight: "2rem", fontSize: "1.5rem" }}>
            🚀 Test Site
          </h1>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              gap: "1rem",
            }}
          >
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about/">About</a>
            </li>
            <li>
              <a href="/products/">Products</a>
            </li>
            <li>
              <a href="/contact/">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <main
        style={{
          minHeight: "50vh",
          padding: "0 0.5rem 2rem",
        }}
      >
        <Routerino
          routes={routes}
          globalTitle="Test App"
          titleSeparator=" | "
          notFoundTitle="404 Not Found"
          notFoundTemplate={notFoundTemplate}
          errorTitle="Error"
          prerenderStatusCode={true}
          debug={window.location?.host?.includes("localhost:")}
        />
      </main>

      <footer
        style={{
          borderTop: "2px solid #333",
        }}
      >
        <div>
          <h3>Test Site Footer</h3>
          <p>© 2042 Test Company. All rights reserved.</p>
          <nav>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0.5rem 0",
                display: "flex",
                gap: "1rem",
              }}
            >
              <li>
                <a href="/privacy/">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms/">Terms of Service</a>
              </li>
              <li>
                <a href="/sitemap.xml">Sitemap</a>
              </li>
            </ul>
          </nav>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.9em", color: "#666" }}>
          Built with Routerino - The lightweight, SEO-optimized React router
        </p>
      </footer>
    </>
  );
}

export default App;
export { routes, notFoundTemplate };
