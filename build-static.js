#!/usr/bin/env node

import fs from "fs";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { pathToFileURL } from "url";

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split("=");
  acc[key] = value;
  return acc;
}, {});

const {
  routesFile,
  outputDir = "./dist",
  template = "./index.html",
  baseUrl = "",
} = args;

if (!routesFile) {
  console.error(
    "Usage: node build-static.js routesFile=./src/routes.js outputDir=./dist template=./index.html baseUrl=https://example.com"
  );
  process.exit(1);
}

async function buildStaticSite() {
  try {
    console.log("🏗️  Building static site with SSR...\n");

    // Check if routes file exists
    const routesPath = path.resolve(routesFile);
    if (!fs.existsSync(routesPath)) {
      throw new Error(`Routes file not found: ${routesPath}`);
    }

    let routes;
    let Routerino;

    // Import Routerino - check if we have a built version first
    const distRouterinoPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "dist/routerino.js"
    );
    if (fs.existsSync(distRouterinoPath)) {
      const routerinoModule = await import(pathToFileURL(distRouterinoPath));
      Routerino = routerinoModule.default;
    } else {
      // Fallback to node_modules
      try {
        const routerinoModule = await import("routerino");
        Routerino = routerinoModule.default;
      } catch {
        throw new Error(
          "Could not find Routerino component. Please run 'npm run build' first."
        );
      }
    }

    // Try to import as a module first (for .js/.mjs files)
    const ext = path.extname(routesPath);
    if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
      try {
        // Use file URL to ensure proper import
        const routesModule = await import(pathToFileURL(routesPath));
        routes = routesModule.default || routesModule.routes;
      } catch (error) {
        console.warn(
          `⚠️  Could not import routes file as module, falling back to regex parsing`
        );
        console.warn(`   Error: ${error.message}`);
        routes = parseRoutesFromFile(routesPath);
      }
    } else {
      // For JSX/TSX files, use regex parsing like build-sitemap does
      routes = parseRoutesFromFile(routesPath);
    }

    if (!Array.isArray(routes)) {
      throw new Error("Routes must be an array");
    }

    // Read the HTML template
    const templatePath = path.resolve(template);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    const templateHtml = fs.readFileSync(templatePath, "utf-8");

    // Create output directory
    const outputPath = path.resolve(outputDir);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Process each route
    let generatedCount = 0;

    for (const route of routes) {
      // Skip dynamic routes (with parameters)
      if (route.path.includes(":")) {
        console.log(`⏭️  Skipping dynamic route: ${route.path}`);
        continue;
      }

      // Generate HTML for this route
      const html = await generateHtmlForRoute(
        route,
        templateHtml,
        baseUrl,
        routes,
        Routerino
      );

      // Determine output file path
      const routePath = route.path === "/" ? "/index" : route.path;
      const filePath = path.join(outputPath, `${routePath}.html`);

      // Create directory if needed
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Write the HTML file
      fs.writeFileSync(filePath, html);
      console.log(`✅ Generated: ${filePath}`);
      generatedCount++;
    }

    // Generate 404.html
    // Create a default 404 route for proper meta tags
    const notFoundRoute = {
      path: "/404",
      title: "404 - Page Not Found",
      description: "The page you are looking for could not be found.",
    };

    // Generate 404.html with proper meta tags
    // The actual notFoundTemplate component will be rendered
    const notFoundHtml = await generateHtmlForRoute(
      notFoundRoute,
      templateHtml,
      baseUrl,
      routes,
      Routerino
    );
    const notFoundPath = path.join(outputPath, "404.html");
    fs.writeFileSync(notFoundPath, notFoundHtml);
    console.log(`✅ Generated: ${notFoundPath}`);

    console.log(
      `\n🎉 Generated ${generatedCount + 1} static HTML files in ${outputDir}`
    );
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

async function generateHtmlForRoute(
  route,
  templateHtml,
  baseUrl,
  allRoutes,
  Routerino
) {
  let html = templateHtml;

  // Mock window.location for SSR
  global.window = {
    location: {
      href: baseUrl ? `${baseUrl}${route.path}` : route.path,
      pathname: route.path,
      search: "",
      host: baseUrl ? new URL(baseUrl).host : "localhost",
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    history: {
      pushState: () => {},
      replaceState: () => {},
    },
  };

  // Track created elements for better mocking
  const createdElements = new Map();
  const headElements = [];

  // Mock document for SSR
  global.document = {
    title: "",
    querySelector: (selector) => {
      if (selector === "head") {
        return {
          appendChild: (element) => {
            headElements.push(element);
            return element;
          },
          querySelector: () => null,
        };
      }
      // Return existing elements if they match
      for (const element of createdElements.values()) {
        if (selector.includes(element.tagName) && selector.includes("=")) {
          // Simple attribute matching
          const attrMatch = selector.match(/\[(\w+)=['"]([^'"]+)['"]\]/);
          if (attrMatch) {
            const [, attr, value] = attrMatch;
            if (element.attributes && element.attributes[attr] === value) {
              return element;
            }
          }
        }
      }
      return null;
    },
    querySelectorAll: () => [],
    createElement: (tag) => {
      const element = {
        tagName: tag.toUpperCase(),
        attributes: {},
        setAttribute: function (name, value) {
          this.attributes[name] = value;
        },
        appendChild: () => {},
        removeChild: () => {},
        style: {},
      };
      createdElements.set(Date.now() + Math.random(), element);
      return element;
    },
    head: {
      querySelector: () => null,
      appendChild: (element) => {
        headElements.push(element);
        return element;
      },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  // Render the React app with Routerino
  let renderedHtml = "";
  try {
    const app = React.createElement(Routerino, {
      routes: allRoutes,
      title: route.title || "",
      separator: " | ",
      description: route.description,
    });

    renderedHtml = ReactDOMServer.renderToString(app);
  } catch (error) {
    console.warn(`⚠️  Failed to render route ${route.path}: ${error.message}`);
    // Fallback to empty div if rendering fails
    renderedHtml = "";
  }

  // Update title
  if (route.title) {
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHtml(route.title)}</title>`
    );
  }

  // Add/update meta tags
  const metaTags = [];

  if (route.description) {
    metaTags.push(
      `<meta name="description" content="${escapeHtml(route.description)}">`
    );
    metaTags.push(
      `<meta property="og:description" content="${escapeHtml(route.description)}">`
    );
  }

  if (route.title) {
    metaTags.push(
      `<meta property="og:title" content="${escapeHtml(route.title)}">`
    );
  }

  metaTags.push(`<meta property="og:type" content="website">`);

  if (baseUrl) {
    metaTags.push(`<meta property="og:url" content="${baseUrl}${route.path}">`);
  }

  if (route.imageUrl) {
    metaTags.push(
      `<meta property="og:image" content="${escapeHtml(route.imageUrl)}">`
    );
  }

  // Add custom tags
  if (route.tags) {
    route.tags.forEach((tag) => {
      const attrs = Object.entries(tag)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(" ");
      metaTags.push(`<meta ${attrs}>`);
    });
  }

  // Insert meta tags before closing </head>
  const metaTagsHtml = metaTags.join("\n  ");
  html = html.replace("</head>", `  ${metaTagsHtml}\n</head>`);

  // Replace the root div with rendered content
  html = html.replace(
    /<div\s+id="root"[^>]*>.*?<\/div>/,
    `<div id="root" data-route="${escapeHtml(route.path)}">${renderedHtml}</div>`
  );

  return html;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseRoutesFromFile(filePath) {
  // Read file contents and strip comments
  const fileContent = fs
    .readFileSync(filePath, "utf-8")
    .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

  // Find routes array in the file
  // Matches: routes = [...], Routes = [...], export default [...], routes: [...], etc.
  const arrayMatch = fileContent.match(
    /(?:[rR]outes\s*[=:]\s*\{?\s*|\bexport\s+default\s+)(\[[\s\S]*?\])/
  );

  if (!arrayMatch || !arrayMatch[1]) {
    throw new Error("Could not find routes array in file");
  }

  const routesArrayString = arrayMatch[1];

  // Parse routes from the array string
  // This is a simplified parser that extracts route objects
  const routes = [];

  // Match route objects: { path: "...", title: "...", ... }
  const routeMatches = routesArrayString.matchAll(/\{([^{}]*)\}/g);

  for (const match of routeMatches) {
    const routeContent = match[1];
    const route = {};

    // Extract path (required)
    const pathMatch = routeContent.match(/path\s*:\s*(["'`])(.*?)\1/);
    if (pathMatch) {
      route.path = pathMatch[2];
    } else {
      continue; // Skip routes without paths
    }

    // Extract title
    const titleMatch = routeContent.match(/title\s*:\s*(["'`])(.*?)\1/);
    if (titleMatch) {
      route.title = titleMatch[2];
    }

    // Extract description
    const descMatch = routeContent.match(/description\s*:\s*(["'`])(.*?)\1/);
    if (descMatch) {
      route.description = descMatch[2];
    }

    // Extract imageUrl
    const imageMatch = routeContent.match(/imageUrl\s*:\s*(["'`])(.*?)\1/);
    if (imageMatch) {
      route.imageUrl = imageMatch[2];
    }

    routes.push(route);
  }

  console.log(
    `📝 Parsed ${routes.length} routes from ${path.basename(filePath)}`
  );
  return routes;
}

// Run the build
buildStaticSite();
