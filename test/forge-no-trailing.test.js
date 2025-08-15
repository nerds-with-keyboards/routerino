import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testAppDir = path.join(
  __dirname,
  "..",
  "test-apps",
  "vite-app-no-trailing"
);
const distDir = path.join(testAppDir, "dist");

describe("Routerino Forge with useTrailingSlash: false", () => {
  beforeAll(() => {
    // Build the test app once before all tests
    console.log("Building test app with useTrailingSlash: false...");
    execSync("npm run build", {
      cwd: testAppDir,
      encoding: "utf8",
    });
  });

  describe("Canonical URLs and Redirects", () => {
    it("should generate canonical tags and redirects with useTrailingSlash: false", () => {
      // With useTrailingSlash: false, flat files (about.html) should be canonical
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

      // about.html should have status 200 (canonical)
      expect(aboutFlat).toContain(
        '<meta name="prerender-status-code" content="200">'
      );
      expect(aboutFlat).not.toContain(
        '<meta name="prerender-status-code" content="301">'
      );
      expect(aboutFlat).not.toContain('<meta name="prerender-header"');
      expect(aboutFlat).toContain(
        '<link rel="canonical" href="https://example.com/about">'
      );
      expect(aboutFlat).toContain(
        '<meta property="og:url" content="https://example.com/about">'
      );

      // about/index.html should redirect to canonical (without trailing slash)
      expect(aboutNested).toContain(
        '<meta name="prerender-status-code" content="301">'
      );
      expect(aboutNested).toContain(
        '<meta name="prerender-header" content="Location: https://example.com/about">'
      );
      expect(aboutNested).toContain(
        '<link rel="canonical" href="https://example.com/about">'
      );
      expect(aboutNested).toContain(
        '<meta property="og:url" content="https://example.com/about">'
      );

      // Test products page
      expect(productsFlat).toContain(
        '<meta name="prerender-status-code" content="200">'
      );
      expect(productsFlat).not.toContain('<meta name="prerender-header"');
      expect(productsFlat).toContain(
        '<link rel="canonical" href="https://example.com/products">'
      );
      expect(productsFlat).toContain(
        '<meta property="og:url" content="https://example.com/products">'
      );

      expect(productsNested).toContain(
        '<meta name="prerender-status-code" content="301">'
      );
      expect(productsNested).toContain(
        '<meta name="prerender-header" content="Location: https://example.com/products">'
      );
      expect(productsNested).toContain(
        '<link rel="canonical" href="https://example.com/products">'
      );
      expect(productsNested).toContain(
        '<meta property="og:url" content="https://example.com/products">'
      );

      // Test contact page
      expect(contactFlat).toContain(
        '<meta name="prerender-status-code" content="200">'
      );
      expect(contactFlat).not.toContain('<meta name="prerender-header"');
      expect(contactFlat).toContain(
        '<link rel="canonical" href="https://example.com/contact">'
      );
      expect(contactFlat).toContain(
        '<meta property="og:url" content="https://example.com/contact">'
      );

      expect(contactNested).toContain(
        '<meta name="prerender-status-code" content="301">'
      );
      expect(contactNested).toContain(
        '<meta name="prerender-header" content="Location: https://example.com/contact">'
      );
      expect(contactNested).toContain(
        '<link rel="canonical" href="https://example.com/contact">'
      );
      expect(contactNested).toContain(
        '<meta property="og:url" content="https://example.com/contact">'
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
      expect(indexHtml).toContain(
        '<meta name="prerender-status-code" content="200">'
      );
      expect(indexHtml).not.toContain(
        '<meta name="prerender-status-code" content="301">'
      );
      expect(indexHtml).not.toContain('<meta name="prerender-header"');
    });

    it("should verify all pages have proper canonical and og:url tags", () => {
      // Test that every generated page has matching canonical and og:url tags
      // With useTrailingSlash: false, all URLs should NOT have trailing slashes (except root)
      const pages = [
        { path: "index.html", url: "https://example.com/" },
        { path: "about.html", url: "https://example.com/about" },
        {
          path: path.join("about", "index.html"),
          url: "https://example.com/about",
        },
        { path: "products.html", url: "https://example.com/products" },
        {
          path: path.join("products", "index.html"),
          url: "https://example.com/products",
        },
        { path: "contact.html", url: "https://example.com/contact" },
        {
          path: path.join("contact", "index.html"),
          url: "https://example.com/contact",
        },
      ];

      pages.forEach(({ path: pagePath, url }) => {
        const html = fs.readFileSync(path.join(distDir, pagePath), "utf8");
        expect(html).toContain(`<link rel="canonical" href="${url}">`);
        expect(html).toContain(`<meta property="og:url" content="${url}">`);
      });
    });
  });

  describe("Sitemap Generation", () => {
    it("should generate sitemap.xml with non-trailing slash URLs", () => {
      const sitemapPath = path.join(distDir, "sitemap.xml");
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const sitemap = fs.readFileSync(sitemapPath, "utf8");

      // Check URLs (should NOT have trailing slashes with useTrailingSlash: false)
      expect(sitemap).toContain("https://example.com/");
      expect(sitemap).toContain("https://example.com/about");
      expect(sitemap).toContain("https://example.com/products");
      expect(sitemap).toContain("https://example.com/contact");

      // Should NOT contain trailing slash versions (except root)
      expect(sitemap).not.toContain("https://example.com/about/");
      expect(sitemap).not.toContain("https://example.com/products/");
      expect(sitemap).not.toContain("https://example.com/contact/");
    });
  });

  describe("404 Page Generation", () => {
    it("should generate a 404.html page with correct status code", () => {
      const notFoundPath = path.join(distDir, "404.html");
      expect(fs.existsSync(notFoundPath)).toBe(true);

      const html = fs.readFileSync(notFoundPath, "utf8");

      // Check prerender status code
      expect(html).toContain(
        '<meta name="prerender-status-code" content="404">'
      );
      expect(html).not.toContain(
        '<meta name="prerender-status-code" content="301">'
      );
      expect(html).not.toContain('<meta name="prerender-header"');

      // Should have proper HTML structure
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<div id="root">');
    });
  });
});
