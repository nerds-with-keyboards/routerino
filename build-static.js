#!/usr/bin/env node

import fs from "fs";
import path from "path";

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
    console.log("🏗️  Building static site...\n");

    // Check if routes file exists
    const routesPath = path.resolve(routesFile);
    if (!fs.existsSync(routesPath)) {
      throw new Error(`Routes file not found: ${routesPath}`);
    }

    let routes;

    // Try to import as a module first (for .js/.mjs files)
    const ext = path.extname(routesPath);
    if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
      try {
        const routesModule = await import(routesPath);
        routes = routesModule.default || routesModule.routes;
      } catch (error) {
        console.warn(
          `⚠️  Could not import routes file as module, falling back to regex parsing`
        );
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
      const html = generateHtmlForRoute(route, templateHtml, baseUrl);

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
    // The actual notFoundTemplate component will be rendered client-side
    const notFoundHtml = generateHtmlForRoute(
      notFoundRoute,
      templateHtml,
      baseUrl
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

function generateHtmlForRoute(route, templateHtml, baseUrl) {
  let html = templateHtml;

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

  // Add route info as data attribute for client-side hydration
  html = html.replace(
    '<div id="root">',
    `<div id="root" data-route="${escapeHtml(route.path)}">`
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
