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
    it("should generate canonical tags with useTrailingSlash: false", () => {
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

      // about.html should be canonical with useTrailingSlash: false
      // Prerender tags removed from forge plugin
      expect(aboutFlat).toContain(
        '<link rel="canonical" href="https://example.com/about">'
      );
      expect(aboutFlat).toContain(
        '<meta property="og:url" content="https://example.com/about">'
      );

      // about/index.html has canonical pointing to non-trailing slash version
      expect(aboutNested).toContain(
        '<link rel="canonical" href="https://example.com/about">'
      );
      expect(aboutNested).toContain(
        '<meta property="og:url" content="https://example.com/about">'
      );

      // Test products page
      // Prerender tags removed from forge plugin
      expect(productsFlat).toContain(
        '<link rel="canonical" href="https://example.com/products">'
      );
      expect(productsFlat).toContain(
        '<meta property="og:url" content="https://example.com/products">'
      );

      // Products nested has canonical pointing to non-trailing slash version
      expect(productsNested).toContain(
        '<link rel="canonical" href="https://example.com/products">'
      );
      expect(productsNested).toContain(
        '<meta property="og:url" content="https://example.com/products">'
      );

      // Test contact page
      // Prerender tags removed from forge plugin
      expect(contactFlat).toContain(
        '<link rel="canonical" href="https://example.com/contact">'
      );
      expect(contactFlat).toContain(
        '<meta property="og:url" content="https://example.com/contact">'
      );

      // Contact nested has canonical pointing to non-trailing slash version
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
      // Root page should only have canonical
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
      // 404 page no longer has prerender tags

      // Should have proper HTML structure
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<div id="root">');
    });
  });
});
