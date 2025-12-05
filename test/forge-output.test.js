import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testAppDir = path.join(__dirname, "..", "test-apps", "vite-app");
const distDir = path.join(testAppDir, "dist");

describe("Routerino Forge Build Output", () => {
  let buildOutput;

  beforeAll(() => {
    // Build the test app once before all tests
    console.log("Building test app with Routerino Forge...");
    buildOutput = execSync("npm run build", {
      cwd: testAppDir,
      encoding: "utf8",
    });
  });

  describe("HTML Generation", () => {
    it("should generate HTML files for static routes", () => {
      // Root page (only one file)
      expect(fs.existsSync(path.join(distDir, "index.html"))).toBe(true);

      // Other pages should have both formats for trailing/non-trailing slash support
      expect(fs.existsSync(path.join(distDir, "about.html"))).toBe(true);
      expect(fs.existsSync(path.join(distDir, "about", "index.html"))).toBe(
        true
      );

      expect(fs.existsSync(path.join(distDir, "products.html"))).toBe(true);
      expect(fs.existsSync(path.join(distDir, "products", "index.html"))).toBe(
        true
      );

      expect(fs.existsSync(path.join(distDir, "contact.html"))).toBe(true);
      expect(fs.existsSync(path.join(distDir, "contact", "index.html"))).toBe(
        true
      );

      // Two levels deep
      expect(fs.existsSync(path.join(distDir, "docs.html"))).toBe(true);
      expect(fs.existsSync(path.join(distDir, "docs", "index.html"))).toBe(
        true
      );
      expect(
        fs.existsSync(path.join(distDir, "docs", "getting-started.html"))
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(distDir, "docs", "getting-started", "index.html")
        )
      ).toBe(true);

      // Three levels deep
      expect(
        fs.existsSync(path.join(distDir, "docs", "api", "reference.html"))
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(distDir, "docs", "api", "reference", "index.html")
        )
      ).toBe(true);
    });

    it("should NOT generate HTML for dynamic routes", () => {
      // The /products/:id route should not generate static HTML
      expect(
        fs.existsSync(path.join(distDir, "products", "1", "index.html"))
      ).toBe(false);
      expect(
        fs.existsSync(path.join(distDir, "products", "id", "index.html"))
      ).toBe(false);
    });

    it("should generate canonical tags with useTrailingSlash: true (default)", () => {
      // Default is useTrailingSlash: true, so about/index.html should be canonical
      const aboutFlat = fs.readFileSync(
        path.join(distDir, "about.html"),
        "utf8"
      );
      const aboutNested = fs.readFileSync(
        path.join(distDir, "about", "index.html"),
        "utf8"
      );
      const productsFlat = fs.readFileSync(
        path.join(distDir, "products.html"),
        "utf8"
      );
      const productsNested = fs.readFileSync(
        path.join(distDir, "products", "index.html"),
        "utf8"
      );
      const contactFlat = fs.readFileSync(
        path.join(distDir, "contact.html"),
        "utf8"
      );
      const contactNested = fs.readFileSync(
        path.join(distDir, "contact", "index.html"),
        "utf8"
      );

      // about/index.html should be canonical
      expect(aboutNested).toContain(
        '<link rel="canonical" href="https://example.com/about/">'
      );
      expect(aboutNested).toContain(
        '<meta property="og:url" content="https://example.com/about/">'
      );

      // about.html should have canonical pointing to trailing slash version
      expect(aboutFlat).toContain(
        '<link rel="canonical" href="https://example.com/about/">'
      );
      expect(aboutFlat).toContain(
        '<meta property="og:url" content="https://example.com/about/">'
      );

      // Test products page too
      expect(productsNested).toContain(
        '<link rel="canonical" href="https://example.com/products/">'
      );
      expect(productsNested).toContain(
        '<meta property="og:url" content="https://example.com/products/">'
      );

      // Products flat should have canonical pointing to trailing slash version
      expect(productsFlat).toContain(
        '<link rel="canonical" href="https://example.com/products/">'
      );
      expect(productsFlat).toContain(
        '<meta property="og:url" content="https://example.com/products/">'
      );

      // Test contact page
      expect(contactNested).toContain(
        '<link rel="canonical" href="https://example.com/contact/">'
      );
      expect(contactNested).toContain(
        '<meta property="og:url" content="https://example.com/contact/">'
      );

      // Contact flat should have canonical pointing to trailing slash version
      expect(contactFlat).toContain(
        '<link rel="canonical" href="https://example.com/contact/">'
      );
      expect(contactFlat).toContain(
        '<meta property="og:url" content="https://example.com/contact/">'
      );

      // Root page should only have one file with canonical
      const indexHtml = fs.readFileSync(
        path.join(distDir, "index.html"),
        "utf8"
      );
      expect(indexHtml).toContain(
        '<link rel="canonical" href="https://example.com/">'
      );
      expect(indexHtml).toContain(
        '<meta property="og:url" content="https://example.com/">'
      );
      // Root page should only have canonical, no redirects
    });
  });

  it("should verify all pages have proper canonical and og:url tags", () => {
    // Test that every generated page has matching canonical and og:url tags
    const pages = [
      { path: "index.html", url: "https://example.com/" },
      { path: "about.html", url: "https://example.com/about/" },
      {
        path: path.join("about", "index.html"),
        url: "https://example.com/about/",
      },
      { path: "products.html", url: "https://example.com/products/" },
      {
        path: path.join("products", "index.html"),
        url: "https://example.com/products/",
      },
      { path: "contact.html", url: "https://example.com/contact/" },
      {
        path: path.join("contact", "index.html"),
        url: "https://example.com/contact/",
      },
    ];

    pages.forEach(({ path: pagePath, url }) => {
      const html = fs.readFileSync(path.join(distDir, pagePath), "utf8");
      expect(html).toContain(`<link rel="canonical" href="${url}">`);
      expect(html).toContain(`<meta property="og:url" content="${url}">`);
    });
  });

  it("should generate correct canonical URLs for deep nested routes", () => {
    // Test two-level deep route
    const docsFlat = fs.readFileSync(path.join(distDir, "docs.html"), "utf8");
    const docsNested = fs.readFileSync(
      path.join(distDir, "docs", "index.html"),
      "utf8"
    );
    const gettingStartedFlat = fs.readFileSync(
      path.join(distDir, "docs", "getting-started.html"),
      "utf8"
    );
    const gettingStartedNested = fs.readFileSync(
      path.join(distDir, "docs", "getting-started", "index.html"),
      "utf8"
    );

    // Test three-level deep route
    const apiReferenceFlat = fs.readFileSync(
      path.join(distDir, "docs", "api", "reference.html"),
      "utf8"
    );
    const apiReferenceNested = fs.readFileSync(
      path.join(distDir, "docs", "api", "reference", "index.html"),
      "utf8"
    );

    // With default useTrailingSlash: true, nested versions should be canonical

    // /docs/ route
    expect(docsNested).toContain(
      '<link rel="canonical" href="https://example.com/docs/">'
    );
    expect(docsNested).toContain(
      '<meta property="og:url" content="https://example.com/docs/">'
    );
    // Docs nested should be canonical

    expect(docsFlat).toContain(
      '<link rel="canonical" href="https://example.com/docs/">'
    );
    expect(docsFlat).toContain(
      '<meta property="og:url" content="https://example.com/docs/">'
    );
    // Docs flat should have canonical pointing to trailing slash version

    // /docs/getting-started/ route (two levels deep)
    expect(gettingStartedNested).toContain(
      '<link rel="canonical" href="https://example.com/docs/getting-started/">'
    );
    expect(gettingStartedNested).toContain(
      '<meta property="og:url" content="https://example.com/docs/getting-started/">'
    );
    // Getting started nested should be canonical

    expect(gettingStartedFlat).toContain(
      '<link rel="canonical" href="https://example.com/docs/getting-started/">'
    );
    expect(gettingStartedFlat).toContain(
      '<meta property="og:url" content="https://example.com/docs/getting-started/">'
    );
    // Getting started flat should have canonical pointing to trailing slash version

    // /docs/api/reference/ route (three levels deep)
    expect(apiReferenceNested).toContain(
      '<link rel="canonical" href="https://example.com/docs/api/reference/">'
    );
    expect(apiReferenceNested).toContain(
      '<meta property="og:url" content="https://example.com/docs/api/reference/">'
    );
    // API reference nested should be canonical

    expect(apiReferenceFlat).toContain(
      '<link rel="canonical" href="https://example.com/docs/api/reference/">'
    );
    expect(apiReferenceFlat).toContain(
      '<meta property="og:url" content="https://example.com/docs/api/reference/">'
    );
    // API reference flat should have canonical pointing to trailing slash version
  });

  describe("SSG Content Rendering", () => {
    it("should render React components to HTML in home page", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      // Check for rendered content
      expect(html).toContain("<h1>Home Page</h1>");
      expect(html).toContain("<p>Welcome to the test app!</p>");
      expect(html).toContain("Featured: <!-- -->Works with Props!");

      // Check navigation links
      expect(html).toContain('<a href="/about/">About</a>');
      expect(html).toContain('<a href="/products/">Products</a>');
      expect(html).toContain('<a href="/contact/">Contact</a>');
    });

    it("should render React components to HTML in about page", () => {
      const html = fs.readFileSync(
        path.join(distDir, "about", "index.html"),
        "utf8"
      );

      expect(html).toContain("<h1>About Us</h1>");
      expect(html).toContain(
        "<p>This is the about page of our test application.</p>"
      );
      expect(html).toContain('<a href="/">Back to Home</a>');
    });

    it("should render React components to HTML in products page", () => {
      const html = fs.readFileSync(
        path.join(distDir, "products", "index.html"),
        "utf8"
      );

      expect(html).toContain("<h1>Products</h1>");
      expect(html).toContain("<p>Browse our products:</p>");
      expect(html).toContain('<a href="/products/1">Product 1</a>');
      expect(html).toContain('<a href="/products/2">Product 2</a>');
    });

    it("should render React components to HTML in contact page", () => {
      const html = fs.readFileSync(
        path.join(distDir, "contact", "index.html"),
        "utf8"
      );

      expect(html).toContain("<h1>Contact Us</h1>");
      expect(html).toContain("<p>Get in touch with us!</p>");
      expect(html).toContain("<p>Email: test@example.com</p>");
    });

    it("should preserve component props through SSG", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      // The HomePage component receives featured="Works with Props!"
      expect(html).toContain("Featured: <!-- -->Works with Props!");
    });
  });

  describe("Meta Tags Generation", () => {
    it("should generate proper meta tags for home page", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      expect(html).toContain("<title>Home | Routerino Test App</title>");
      expect(html).toContain(
        '<meta name="description" content="Welcome to our test application">'
      );
      expect(html).toContain('<meta property="og:title" content="Home">');
      expect(html).toContain(
        '<meta property="og:description" content="Welcome to our test application">'
      );
      expect(html).toContain(
        '<meta property="og:image" content="https://example.com/images/home-og.jpg">'
      );
      expect(html).toContain(
        '<meta name="twitter:card" content="summary_large_image">'
      );
    });

    it("should generate proper meta tags for about page", () => {
      const html = fs.readFileSync(
        path.join(distDir, "about", "index.html"),
        "utf8"
      );

      expect(html).toContain("<title>About Us | Routerino Test App</title>");
      expect(html).toContain(
        '<meta name="description" content="Learn more about our company">'
      );
      expect(html).toContain('<meta property="og:title" content="About Us">');

      // Should NOT have keywords anymore
      expect(html).not.toContain('<meta name="keywords"');
    });

    it("should generate proper meta tags for contact page with imageUrl", () => {
      const html = fs.readFileSync(
        path.join(distDir, "contact", "index.html"),
        "utf8"
      );

      expect(html).toContain("<title>Contact Us | Routerino Test App</title>");
      expect(html).toContain(
        '<meta property="og:image" content="https://example.com/images/contact-og.jpg">'
      );
    });

    it("should include custom tags from route configuration", () => {
      const html = fs.readFileSync(
        path.join(distDir, "about", "index.html"),
        "utf8"
      );

      // Check that custom tags from the route are included
      expect(html).toContain('<meta property="og:type" content="website">');
      expect(html).toContain('<meta name="author" content="Test Author">');
      expect(html).toContain(
        '<meta property="article:published_time" content="2024-01-15">'
      );
    });
  });

  describe("Image Component Processing", () => {
    it("should process <Image> components with LQIP and responsive images", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      // Check for the Image component wrapper
      expect(html).toContain('<div class="routerino-img-');

      // Check that LQIP styles are present
      expect(html).toContain("::before");
      expect(html).toMatch(/background-image:\s*url\('data:image\/png;base64/);
      expect(html).toContain("filter: blur(4px)");
      expect(html).toContain("z-index: -1"); // Background is behind
      expect(html).toContain("aspect-ratio:"); // Prevent layout shift

      // Check that picture element is present with data attributes
      expect(html).toContain('<picture data-routerino-image="true"');
      expect(html).toContain('data-original-src="/test-image.jpg"');

      // Check for WebP source
      expect(html).toContain('type="image/webp"');
      expect(html).toMatch(/srcSet="[^"]*\.webp/);

      // Check that img has priority loading (hero-image class triggers this)
      const imgMatch = html.match(/<img[^>]*>/);
      expect(imgMatch).toBeTruthy();
      const imgTag = imgMatch[0];
      expect(imgTag).toContain('src="/test-image.jpg"');
      expect(imgTag).toContain('alt="Test Image"');
      expect(imgTag).toContain('loading="eager"'); // Priority detected
      expect(imgTag).toContain('fetchPriority="high"');
      expect(imgTag).toContain('style="opacity: 0"'); // Prevent flash
    });

    it("should generate responsive image files", () => {
      // Check that responsive images were actually generated
      expect(fs.existsSync(path.join(distDir, "test-image-480w.jpg"))).toBe(
        true
      );
      expect(fs.existsSync(path.join(distDir, "test-image-480w.webp"))).toBe(
        true
      );
      // Note: Other widths may not be generated if original image is smaller
    });
  });

  describe("HTML Structure", () => {
    it("should maintain proper HTML5 structure", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<meta charset="UTF-8" />');
      expect(html).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
      );
      expect(html).toContain('<div id="root">');
      expect(html).toMatch(/<script[^>]*type="module"[^>]*>/);
    });

    it("should have SSG content inside the root div", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      // Extract content inside <div id="root">...</div>
      const rootMatch = html.match(/<div id="root">(.*?)<\/div>/s);
      expect(rootMatch).toBeTruthy();

      const rootContent = rootMatch[1];
      expect(rootContent).toContain("<h1>Home Page</h1>");
      expect(rootContent).not.toBe(""); // Should not be empty
    });
  });

  describe("Sitemap Generation", () => {
    it("should generate sitemap.xml with proper XML schema declarations", () => {
      const sitemapPath = path.join(distDir, "sitemap.xml");
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const sitemap = fs.readFileSync(sitemapPath, "utf8");

      // Check XML declaration and schema
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain(
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
      );
      expect(sitemap).toContain(
        'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9'
      );
      expect(sitemap).toContain(
        'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
      );

      // Check URLs (should have trailing slashes with default useTrailingSlash: true)
      expect(sitemap).toContain("https://example.com/");
      expect(sitemap).toContain("https://example.com/about/");
      expect(sitemap).toContain("https://example.com/products/");
      expect(sitemap).toContain("https://example.com/contact/");
      expect(sitemap).toContain("https://example.com/docs/");
      expect(sitemap).toContain("https://example.com/docs/getting-started/");
      expect(sitemap).toContain("https://example.com/docs/api/reference/");

      // Should NOT include dynamic routes
      expect(sitemap).not.toContain("/products/:id");
      expect(sitemap).not.toContain("/products/1");
    });

    it("should generate robots.txt with sitemap reference", () => {
      const robotsPath = path.join(distDir, "robots.txt");
      expect(fs.existsSync(robotsPath)).toBe(true);

      const robots = fs.readFileSync(robotsPath, "utf8");

      // Check robots.txt content
      expect(robots).toContain("User-agent: *");
      expect(robots).toContain("Allow: /");
      expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
    });
  });

  describe("Build Output Messages", () => {
    it("should correctly count static vs dynamic routes", () => {
      // Should report 8 routes total (7 static + 1 dynamic)
      expect(buildOutput).toContain("Found 8 routes (7 static, 1 dynamic)");

      // Should report generating 13 HTML files (7 routes) + 404
      expect(buildOutput).toContain(
        "Generated 13 HTML files (7 routes) + 404.html"
      );

      // Should report 7 URLs in sitemap (dynamic routes excluded)
      expect(buildOutput).toContain("Generated sitemap.xml with 7 URLs");
    });
  });

  describe("404 Page Generation", () => {
    it("should generate a 404.html page with notFoundTemplate content", () => {
      const notFoundPath = path.join(distDir, "404.html");
      expect(fs.existsSync(notFoundPath)).toBe(true);

      const html = fs.readFileSync(notFoundPath, "utf8");

      // Check title
      expect(html).toContain(
        "<title>404 Not Found | Routerino Test App</title>"
      );

      // Check meta tags
      expect(html).toContain('<meta name="robots" content="noindex">');
      expect(html).toContain(
        '<meta name="twitter:card" content="summary_large_image">'
      );

      // Check rendered content - now includes App wrapper with headers/footers
      expect(html).toContain("<h2>Route Not Found</h2>");
      expect(html).toContain("This is a not found example component.");

      // Should have the main script
      expect(html).toMatch(/<script[^>]*type="module"[^>]*>/);

      // Should have proper HTML structure
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<div id="root">');
    });
  });

  describe("Build Output Messages", () => {
    it("should show Image component processing stats in build output", () => {
      expect(buildOutput).toMatch(
        /\[Routerino Image\].*Processed \d+ <Image> components/
      );
    });
  });
});
