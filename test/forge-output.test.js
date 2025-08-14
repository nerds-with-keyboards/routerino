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
      expect(fs.existsSync(path.join(distDir, "index.html"))).toBe(true);
      expect(fs.existsSync(path.join(distDir, "about", "index.html"))).toBe(
        true
      );
      expect(fs.existsSync(path.join(distDir, "products", "index.html"))).toBe(
        true
      );
      expect(fs.existsSync(path.join(distDir, "contact", "index.html"))).toBe(
        true
      );
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
  });

  describe("SSR Content Rendering", () => {
    it("should render React components to HTML in home page", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      // Check for rendered content
      expect(html).toContain("<h1>Home Page</h1>");
      expect(html).toContain("<p>Welcome to the test app!</p>");
      expect(html).toContain("Featured: <!-- -->SSR Works with Props!");

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

    it("should preserve component props through SSR", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      // The HomePage component receives featured="SSR Works with Props!"
      expect(html).toContain("Featured: <!-- -->SSR Works with Props!");
    });
  });

  describe("Meta Tags Generation", () => {
    it("should generate proper meta tags for home page", () => {
      const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

      expect(html).toContain("<title>Home - Test App</title>");
      expect(html).toContain(
        '<meta name="description" content="Welcome to our test application">'
      );
      expect(html).toContain(
        '<meta property="og:title" content="Home - Test App">'
      );
      expect(html).toContain(
        '<meta property="og:description" content="Welcome to our test application">'
      );
      expect(html).toContain(
        '<meta property="og:image" content="https://example.com/images/home-og.jpg">'
      );
      expect(html).toContain(
        '<meta name="twitter:image" content="https://example.com/images/home-og.jpg">'
      );
      expect(html).toContain(
        '<meta name="twitter:card" content="summary_large_image">'
      );
      expect(html).toContain(
        '<meta name="prerender-status-code" content="200">'
      );
    });

    it("should generate proper meta tags for about page", () => {
      const html = fs.readFileSync(
        path.join(distDir, "about", "index.html"),
        "utf8"
      );

      expect(html).toContain("<title>About Us - Test App</title>");
      expect(html).toContain(
        '<meta name="description" content="Learn more about our company">'
      );
      expect(html).toContain(
        '<meta property="og:title" content="About Us - Test App">'
      );

      // Should NOT have keywords anymore
      expect(html).not.toContain('<meta name="keywords"');
    });

    it("should generate proper meta tags for contact page with imageUrl", () => {
      const html = fs.readFileSync(
        path.join(distDir, "contact", "index.html"),
        "utf8"
      );

      expect(html).toContain("<title>Contact Us - Test App</title>");
      expect(html).toContain(
        '<meta property="og:image" content="https://example.com/images/contact-og.jpg">'
      );
      expect(html).toContain(
        '<meta name="twitter:image" content="https://example.com/images/contact-og.jpg">'
      );
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

    it("should have SSR content inside the root div", () => {
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

      // Check URLs
      expect(sitemap).toContain("https://example.com/");
      expect(sitemap).toContain("https://example.com/about/");
      expect(sitemap).toContain("https://example.com/products/");
      expect(sitemap).toContain("https://example.com/contact/");

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
      // Should report 5 routes total (4 static + 1 dynamic)
      expect(buildOutput).toContain("Found 5 routes (4 static, 1 dynamic)");

      // Should report generating 4 static pages + 404
      expect(buildOutput).toContain("Generated 4 static pages + 404.html");

      // Should report 4 URLs in sitemap (dynamic routes excluded)
      expect(buildOutput).toContain("Generated sitemap.xml with 4 URLs");
    });
  });

  describe("404 Page Generation", () => {
    it("should generate a 404.html page with notFoundTemplate content", () => {
      const notFoundPath = path.join(distDir, "404.html");
      expect(fs.existsSync(notFoundPath)).toBe(true);

      const html = fs.readFileSync(notFoundPath, "utf8");

      // Check title
      expect(html).toContain("<title>404 Not Found - Test App</title>");

      // Check meta tags
      expect(html).toContain('<meta name="robots" content="noindex">');
      expect(html).toContain(
        '<meta name="prerender-status-code" content="404">'
      );
      expect(html).toContain(
        '<meta name="twitter:card" content="summary_large_image">'
      );

      // Check rendered content
      expect(html).toContain("<h2>Route Not Found</h2>");
      expect(html).toContain("This is a not found example component.");
      expect(html).toContain("Lorem ipsum dolor");

      // Should have the main script
      expect(html).toMatch(/<script[^>]*type="module"[^>]*>/);

      // Should have proper HTML structure
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<div id="root">');
    });
  });
});
