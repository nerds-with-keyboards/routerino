import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Static Build (routerino-build-static)", () => {
  const fixturesDir = path.join(__dirname, "fixtures/static-build");
  const outputDir = path.join(__dirname, "fixtures/static-build/output");
  const buildScript = path.join(__dirname, "../build-static.js");

  beforeAll(async () => {
    // Clean output directory
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }

    // Run the static build
    const cmd = `node ${buildScript} routesFile=${fixturesDir}/routes.js outputDir=${outputDir} template=${fixturesDir}/template.html baseUrl=https://example.com`;
    await execAsync(cmd);
  });

  afterAll(() => {
    // Clean up output directory
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
  });

  it("should generate static HTML files for non-dynamic routes", () => {
    expect(fs.existsSync(path.join(outputDir, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "about.html"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "404.html"))).toBe(true);
    // Dynamic route should not be generated
    expect(fs.existsSync(path.join(outputDir, "blog"))).toBe(false);
  });

  describe("Home page", () => {
    let homeHtml;

    beforeAll(() => {
      homeHtml = fs.readFileSync(path.join(outputDir, "index.html"), "utf-8");
    });

    it("should have correct title", () => {
      expect(homeHtml).toContain("<title>Test Home</title>");
    });

    it("should have meta tags", () => {
      expect(homeHtml).toContain(
        '<meta name="description" content="Test home page description">'
      );
      expect(homeHtml).toContain(
        '<meta property="og:description" content="Test home page description">'
      );
      expect(homeHtml).toContain(
        '<meta property="og:title" content="Test Home">'
      );
      expect(homeHtml).toContain('<meta property="og:type" content="website">');
      expect(homeHtml).toContain(
        '<meta property="og:url" content="https://example.com/">'
      );
    });

    it("should have SSR-rendered content", () => {
      expect(homeHtml).toContain("<h1>Test Home Page</h1>");
      expect(homeHtml).toContain("<p>This is test content for SSR.</p>");
    });

    it("should have route data attribute", () => {
      expect(homeHtml).toContain('data-route="/"');
    });

    it("should not have spurious routerino attributes", () => {
      expect(homeHtml).not.toContain("routerino=");
      expect(homeHtml).not.toContain("Routerino=");
    });

    it("should use proper component wrapper", () => {
      expect(homeHtml).toContain('<article class="home-page">');
    });
  });

  describe("About page", () => {
    let aboutHtml;

    beforeAll(() => {
      aboutHtml = fs.readFileSync(path.join(outputDir, "about.html"), "utf-8");
    });

    it("should have correct title", () => {
      expect(aboutHtml).toContain("<title>Test About</title>");
    });

    it("should have custom meta tags", () => {
      expect(aboutHtml).toContain(
        '<meta property="og:image" content="https://example.com/about.jpg">'
      );
      expect(aboutHtml).toContain(
        '<meta name="twitter:card" content="summary_large_image">'
      );
    });

    it("should have SSR-rendered content", () => {
      expect(aboutHtml).toContain("<h1>Test About Page</h1>");
      expect(aboutHtml).toContain("<p>About page content for testing.</p>");
    });

    it("should have route data attribute", () => {
      expect(aboutHtml).toContain('data-route="/about"');
    });
  });

  describe("404 page", () => {
    let notFoundHtml;

    beforeAll(() => {
      notFoundHtml = fs.readFileSync(path.join(outputDir, "404.html"), "utf-8");
    });

    it("should have 404 title", () => {
      expect(notFoundHtml).toContain("<title>404 - Page Not Found</title>");
    });

    it("should have 404 meta description", () => {
      expect(notFoundHtml).toContain(
        "The page you are looking for could not be found."
      );
    });

    it("should have default 404 content", () => {
      expect(notFoundHtml).toContain("No page found for this URL. [404]");
      expect(notFoundHtml).toContain('<a href="/">Home</a>');
    });
  });

  describe("No spurious attributes with hook API", () => {
    it("should NOT have spurious attributes on plain DOM elements", async () => {
      const domOutputDir = path.join(outputDir, "dom-test");
      const cmd = `node ${buildScript} routesFile=${fixturesDir}/routes-with-dom.js outputDir=${domOutputDir} template=${fixturesDir}/template.html baseUrl=https://example.com`;

      await execAsync(cmd);

      const plainHtml = fs.readFileSync(
        path.join(domOutputDir, "plain.html"),
        "utf-8"
      );

      // With the new hook API, plain DOM elements should be clean
      expect(plainHtml).not.toContain("routerino=");
      expect(plainHtml).not.toContain("Routerino=");

      // Should have the expected content
      expect(plainHtml).toContain('<div class="plain">Plain DOM element</div>');

      // Clean up
      fs.rmSync(domOutputDir, { recursive: true });
    });
  });

  describe("Build process", () => {
    it("should handle routes without elements gracefully", async () => {
      // Create a routes file with missing element
      const badRoutesPath = path.join(outputDir, "bad-routes.js");
      fs.writeFileSync(
        badRoutesPath,
        `export default [{ path: "/test", title: "Test" }];`
      );

      const cmd = `node ${buildScript} routesFile=${badRoutesPath} outputDir=${outputDir}/bad template=${fixturesDir}/template.html`;

      // Should not throw
      await expect(execAsync(cmd)).resolves.not.toThrow();
    });

    it("should fail gracefully with missing routes file", async () => {
      const cmd = `node ${buildScript} routesFile=/nonexistent/routes.js outputDir=${outputDir}/fail template=${fixturesDir}/template.html`;

      await expect(execAsync(cmd)).rejects.toThrow();
    });

    it("should fail gracefully with missing template file", async () => {
      const cmd = `node ${buildScript} routesFile=${fixturesDir}/routes.js outputDir=${outputDir}/fail template=/nonexistent/template.html`;

      await expect(execAsync(cmd)).rejects.toThrow();
    });
  });
});
