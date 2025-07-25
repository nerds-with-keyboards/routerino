import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testOutputDir = path.join(__dirname, "test-static-output");
const testRoutesFile = path.join(__dirname, "test-routes.js");
const testTemplate = path.join(__dirname, "test-template.html");

describe("Static Build", () => {
  beforeEach(() => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }

    // Create test routes file
    const testRoutes = `
export default [
  {
    path: '/',
    title: 'Home',
    description: 'Welcome to our site',
    element: null
  },
  {
    path: '/about',
    title: 'About Us',
    description: 'Learn more about us',
    imageUrl: 'https://example.com/about.jpg',
    element: null
  },
  {
    path: '/blog/:id',
    title: 'Blog Post',
    description: 'Dynamic blog post',
    element: null
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Get in touch',
    tags: [
      { name: 'robots', content: 'noindex,follow' }
    ],
    element: null
  }
];`;
    fs.writeFileSync(testRoutesFile, testRoutes);

    // Create test template
    const template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Default Title</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    fs.writeFileSync(testTemplate, template);
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    if (fs.existsSync(testRoutesFile)) {
      fs.unlinkSync(testRoutesFile);
    }
    if (fs.existsSync(testTemplate)) {
      fs.unlinkSync(testTemplate);
    }
  });

  it("should generate static HTML files for non-dynamic routes", () => {
    const buildScript = path.join(__dirname, "..", "build-static.js");
    const command = `node ${buildScript} routesFile=${testRoutesFile} outputDir=${testOutputDir} template=${testTemplate} baseUrl=https://example.com`;

    execSync(command, { stdio: "pipe" });

    // Check that files were created
    expect(fs.existsSync(path.join(testOutputDir, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, "about.html"))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, "contact.html"))).toBe(true);

    // Dynamic route should not be generated
    expect(fs.existsSync(path.join(testOutputDir, "blog", ":id.html"))).toBe(
      false
    );
  });

  it("should apply correct meta tags to generated HTML", () => {
    const buildScript = path.join(__dirname, "..", "build-static.js");
    const command = `node ${buildScript} routesFile=${testRoutesFile} outputDir=${testOutputDir} template=${testTemplate} baseUrl=https://example.com`;

    execSync(command, { stdio: "pipe" });

    // Check home page
    const homeHtml = fs.readFileSync(
      path.join(testOutputDir, "index.html"),
      "utf-8"
    );
    expect(homeHtml).toContain("<title>Home</title>");
    expect(homeHtml).toContain(
      '<meta name="description" content="Welcome to our site">'
    );
    expect(homeHtml).toContain('<meta property="og:title" content="Home">');
    expect(homeHtml).toContain(
      '<meta property="og:url" content="https://example.com/">'
    );
    expect(homeHtml).toContain('data-route="/"');

    // Check about page
    const aboutHtml = fs.readFileSync(
      path.join(testOutputDir, "about.html"),
      "utf-8"
    );
    expect(aboutHtml).toContain("<title>About Us</title>");
    expect(aboutHtml).toContain(
      '<meta property="og:image" content="https://example.com/about.jpg">'
    );
    expect(aboutHtml).toContain('data-route="/about"');

    // Check contact page with custom tags
    const contactHtml = fs.readFileSync(
      path.join(testOutputDir, "contact.html"),
      "utf-8"
    );
    expect(contactHtml).toContain(
      '<meta name="robots" content="noindex,follow">'
    );
  });

  it("should handle missing template file gracefully", () => {
    const buildScript = path.join(__dirname, "..", "build-static.js");
    const command = `node ${buildScript} routesFile=${testRoutesFile} outputDir=${testOutputDir} template=./nonexistent.html baseUrl=https://example.com`;

    expect(() => {
      execSync(command, { stdio: "pipe" });
    }).toThrow();
  });

  it("should handle invalid routes file gracefully", () => {
    // Create invalid routes file
    fs.writeFileSync(testRoutesFile, 'export default "not an array"');

    const buildScript = path.join(__dirname, "..", "build-static.js");
    const command = `node ${buildScript} routesFile=${testRoutesFile} outputDir=${testOutputDir} template=${testTemplate} baseUrl=https://example.com`;

    expect(() => {
      execSync(command, { stdio: "pipe" });
    }).toThrow();
  });
});
