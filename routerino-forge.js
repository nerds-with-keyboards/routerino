import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { build } from "vite";

/**
 * Routerino Forge - Static Site Generation for React with Vite
 *
 * Forge blazing-fast static HTML from your React routes with zero configuration.
 * Components are rendered at build time, creating clean JSX elements that
 * render identically on server and client.
 */

export function routerinoForge(options = {}) {
  // Configuration with defaults
  const config = {
    routes: options.routes || "./src/routes.jsx",
    template: options.template || "index.html", // Default to source index.html
    outputDir: options.outputDir || "dist",
    baseUrl: options.baseUrl || "",
    generateSitemap: options.generateSitemap ?? true,
    prerenderStatusCode: options.prerenderStatusCode ?? true,
    verbose: options.verbose ?? false,
    useTrailingSlash: options.useTrailingSlash ?? true, // Default to trailing slashes
  };

  let viteConfig;
  let hasRun = false;

  return {
    name: "routerino-forge",

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async closeBundle() {
      if (hasRun || viteConfig.build.ssr) return; // Skip if already run or if this IS the SSR build
      hasRun = true;

      let tempEntryPath = null;

      try {
        // Step 1: Build bundle for static generation
        let ssrEntryPath = path.resolve(
          viteConfig.root,
          "src/entry-server.jsx"
        );
        const ssrOutDir = path.resolve(viteConfig.root, "dist-ssr");

        // Check if user has custom entry-server, otherwise create temp one
        try {
          await fs.access(ssrEntryPath);
        } catch {
          // Create temp entry-server in the user's build directory (already gitignored)
          const buildDir = viteConfig.build.outDir || "dist";
          const tempDir = path.resolve(
            viteConfig.root,
            buildDir,
            ".forge-temp"
          );
          tempEntryPath = path.resolve(tempDir, "entry-server.jsx");
          ssrEntryPath = tempEntryPath;

          // Calculate relative path from temp location to routes
          const routesPath = path.resolve(viteConfig.root, config.routes);
          const relativePath = path
            .relative(path.dirname(tempEntryPath), routesPath)
            .replace(/\\/g, "/") // Windows path fix
            .replace(/\.jsx?$/, ""); // Remove extension for import

          // Auto-generate entry-server.jsx in temp directory
          const entryContent = `
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as routesModule from '${relativePath.startsWith(".") ? relativePath : "./" + relativePath}';
// Support different export patterns  
const routes = routesModule.routes || routesModule.default;
const notFoundTemplate = routesModule.notFoundTemplate;
if (!routes) {
  throw new Error('Could not find routes export. Expected "export const routes" or "export default" from ${relativePath}');
}
export { routes };
export function render(url) {
  const route = routes.find(r => {
    if (r.path === url) return true;
    if (r.path === '/' && url === '/') return true;
    if (r.path.split('/').some(segment => segment.startsWith(':'))) return false;
    return r.path === url;
  }); 
  if (!route) {
    if (notFoundTemplate) {
      const notFoundHTML = ReactDOMServer.renderToString(notFoundTemplate);
      return { html: notFoundHTML, notFound: true };
    }
    return { html: '<div><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p></div>', notFound: true };
  }
  try {
    const html = ReactDOMServer.renderToString(route.element);
    return {
      html,
      title: route.title,
      description: route.description,
      imageUrl: route.imageUrl
    };
  } catch (error) {
    console.error(\`Failed to render route \${route.path}:\`, error.message);
    return {
      html: \`<div>Error rendering route: \${error.message}</div>\`,
      title: route.title,
      description: route.description,
      imageUrl: route.imageUrl
    };
  }
}`.trim();

          // Ensure temp directory exists
          await fs.mkdir(tempDir, { recursive: true });
          await fs.writeFile(tempEntryPath, entryContent);

          if (config.verbose) {
            console.log("✨ Using auto-generated entry for SSG");
          }
        }

        console.log("Building SSG bundle...");
        await build({
          root: viteConfig.root,
          build: {
            ssr: ssrEntryPath,
            outDir: ssrOutDir,
            rollupOptions: {
              output: {
                format: "es",
              },
            },
          },
          logLevel: "error",
        });

        // Step 2: Load the built module
        const ssgModule = await import(
          pathToFileURL(path.join(ssrOutDir, "entry-server.js")).href
        );
        let { render, routes } = ssgModule;

        // Validate routes
        if (!routes || !Array.isArray(routes)) {
          throw new Error(`Routes must be an array. Got: ${typeof routes}`);
        }

        if (routes.length === 0) {
          console.warn("⚠️  No routes found - check your routes export");
        }

        // Check for common issues
        const invalidRoutes = routes.filter((route) => {
          if (!route.element) {
            console.warn(`  ⚠️  Route ${route.path} has no element property`);
            return true;
          }
          if (typeof route.element === "function") {
            console.warn(
              `  ⚠️  Route ${route.path} element is a function - should be JSX element like <Component />`
            );
            return true;
          }
          return false;
        });

        if (invalidRoutes.length > 0) {
          console.warn(
            `⚠️  ${invalidRoutes.length} routes have issues - see warnings above`
          );
        }

        // Count only static routes (excluding dynamic routes with parameters)
        const staticRoutes =
          routes?.filter(
            (route) =>
              !route.path.split("/").some((segment) => segment.startsWith(":"))
          ) || [];
        console.log(
          `Found ${routes?.length || 0} routes (${staticRoutes.length} static, ${(routes?.length || 0) - staticRoutes.length} dynamic)`
        );

        // Read the built HTML template
        // If template path doesn't start with outputDir, assume it's meant to be in outputDir
        let templatePath;
        if (config.template.includes(config.outputDir)) {
          templatePath = path.resolve(viteConfig.root, config.template);
        } else {
          // Use the built index.html in outputDir
          templatePath = path.resolve(
            viteConfig.root,
            config.outputDir,
            "index.html"
          );
        }

        let template;
        try {
          template = await fs.readFile(templatePath, "utf-8");
          if (config.verbose) {
            console.log(`  Using template: ${templatePath}`);
          }
        } catch (e) {
          console.error(e);
          throw new Error(
            `Failed to read template at ${templatePath}. Make sure the build has completed and created the HTML file.`
          );
        }

        // Check if template has the root div
        if (!template.includes('<div id="root">')) {
          console.warn(
            `⚠️  Template missing <div id="root">. The plugin needs this to inject rendered HTML.`
          );
        }

        // Generate static HTML for each route
        await generateStaticPages({
          routes,
          template,
          outputDir: path.resolve(viteConfig.root, config.outputDir),
          config,
          render, // Pass the render function
        });

        // Generate 404.html page
        await generate404Page({
          template: template,
          outputDir: path.resolve(viteConfig.root, config.outputDir),
          config,
          render, // Pass the render function
        });

        // Generate sitemap if enabled
        if (config.generateSitemap) {
          await generateSitemap(routes, {
            ...config,
            outputDir: path.resolve(viteConfig.root, config.outputDir),
          });
        }

        // Count generated files (2 per route except root which has 1)
        const fileCount = staticRoutes.reduce(
          (count, route) => count + (route.path === "/" ? 1 : 2),
          0
        );
        console.log(
          `  ✓ Generated ${fileCount} HTML files (${staticRoutes.length} routes) + 404.html`
        );
      } catch (error) {
        console.error("❌ Failed to generate static pages:", error.message);
        if (config.verbose) {
          console.error(error.stack);
        }
        // Don't throw to allow build to continue
      } finally {
        // Clean up dist-ssr directory
        const ssrOutDir = path.resolve(viteConfig.root, "dist-ssr");
        try {
          await fs.rm(ssrOutDir, { recursive: true, force: true });
        } catch {
          // Ignore if it doesn't exist or can't be removed
        }

        // Clean up temp directory if we created one
        if (tempEntryPath) {
          const buildDir = viteConfig.build.outDir || "dist";
          const tempDir = path.resolve(
            viteConfig.root,
            buildDir,
            ".forge-temp"
          );
          try {
            await fs.rm(tempDir, { recursive: true, force: true });
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    },
  };
}

// Generate static HTML pages
async function generateStaticPages({
  routes,
  template,
  outputDir,
  config,
  render,
}) {
  for (const route of routes) {
    // Skip dynamic routes with parameters
    if (route.path.split("/").some((segment) => segment.startsWith(":"))) {
      if (config.verbose) {
        console.log(`  Skipped dynamic route: ${route.path}`);
      }
      continue;
    }

    try {
      // Use the render function to generate HTML
      const renderResult = render(route.path);

      let renderedHTML = "";
      if (renderResult.notFound) {
        console.log(`  Route not found: ${route.path}`);
        renderedHTML = `<div data-route="${route.path}" data-not-found="true"><!-- Route not found --></div>`;
      } else if (!renderResult.html || renderResult.html.trim() === "") {
        console.warn(
          `  ⚠️  Empty HTML for ${route.path} - check that route.element is a valid React element`
        );
        renderedHTML = `<div data-route="${route.path}" data-empty="true"><!-- Empty render result --></div>`;
      } else {
        renderedHTML = renderResult.html;
        console.log(`  ✓ Rendered ${route.path}`);

        // Override metadata with render result if available
        if (renderResult.title) route.title = renderResult.title;
        if (renderResult.description)
          route.description = renderResult.description;
        if (renderResult.imageUrl) route.imageUrl = renderResult.imageUrl;
      }

      // Generate files for both URL patterns (with and without trailing slash)
      const filesToGenerate = [];

      if (route.path === "/") {
        // Root only needs index.html
        filesToGenerate.push({
          path: path.join(outputDir, "index.html"),
          isCanonical: true,
        });
      } else {
        // For all other routes, generate both formats
        const cleanPath = route.path.replace(/\/$/, ""); // Remove trailing slash if present

        // Determine which version is canonical based on useTrailingSlash
        filesToGenerate.push({
          path: path.join(outputDir, `${cleanPath}.html`),
          isCanonical: !config.useTrailingSlash,
          urlPath: cleanPath,
        });

        filesToGenerate.push({
          path: path.join(outputDir, cleanPath, "index.html"),
          isCanonical: config.useTrailingSlash,
          urlPath: `${cleanPath}/`,
        });
      }

      // Write files with appropriate meta tags
      for (const file of filesToGenerate) {
        // Generate meta tags (with canonical URL and potential redirect)
        const metaTags = generateMetaTags(
          route,
          config,
          file.isCanonical,
          file.urlPath || route.path
        );

        // Create HTML for this version
        let html = template;

        // Extract existing title from template and combine with route title
        const existingTitleMatch = html.match(/<title>([^<]*)<\/title>/);
        const existingTitle = existingTitleMatch
          ? existingTitleMatch[1].trim()
          : null;

        if (route.title) {
          // Combine route title with existing title (if any)
          const finalTitle = existingTitle
            ? `${route.title} | ${existingTitle}`
            : route.title;

          if (html.includes("<title>")) {
            // Replace existing title tag
            html = html.replace(
              /<title>[^<]*<\/title>/,
              `<title>${finalTitle}</title>`
            );
          } else {
            // Add title tag if missing
            html = html.replace(
              "</head>",
              `  <title>${finalTitle}</title>\n  </head>`
            );
          }
        }
        // If no route.title is specified, keep the existing title as-is

        // Add meta tags before </head>
        html = html.replace("</head>", `  ${metaTags}\n  </head>`);

        // Replace root div content with rendered HTML
        if (html.includes('<div id="root">')) {
          html = html.replace(
            /<div id="root">.*?<\/div>/s,
            `<div id="root">${renderedHTML}</div>`
          );
        } else {
          console.warn(
            `  ⚠️  Could not find <div id="root"> for ${route.path}`
          );
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(file.path), { recursive: true });

        // Write file
        await fs.writeFile(file.path, html);

        if (config.verbose) {
          console.log(
            `  Generated: ${file.path}${file.isCanonical ? " (canonical)" : ""}`
          );
        }
      }
    } catch (error) {
      console.error(`Failed to generate ${route.path}:`, error);
    }
  }
}

// Generate meta tags
function generateMetaTags(route, config, isCanonical, urlPath) {
  const tags = [];

  // Determine the canonical URL
  let canonicalPath;
  if (urlPath === "/" || urlPath === undefined) {
    canonicalPath = "/";
  } else {
    // Apply trailing slash preference to get canonical version
    const cleanPath = urlPath.replace(/\/$/, "");
    canonicalPath = config.useTrailingSlash ? cleanPath + "/" : cleanPath;
  }

  const canonicalUrl = config.baseUrl + canonicalPath;

  // Always add canonical URL tag
  tags.push(`<link rel="canonical" href="${canonicalUrl}">`);

  if (route.description) {
    tags.push(`<meta name="description" content="${route.description}">`);
  }

  // Open Graph tags
  if (route.title) {
    tags.push(`<meta property="og:title" content="${route.title}">`);
  }

  if (route.description) {
    tags.push(
      `<meta property="og:description" content="${route.description}">`
    );
  }

  // Add og:url with canonical URL
  tags.push(`<meta property="og:url" content="${canonicalUrl}">`);

  if (route.imageUrl) {
    const imageUrl = config.baseUrl
      ? config.baseUrl + route.imageUrl
      : route.imageUrl;
    tags.push(`<meta property="og:image" content="${imageUrl}">`);
    tags.push(`<meta name="twitter:image" content="${imageUrl}">`);
  }

  // Twitter card
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);

  if (config.prerenderStatusCode) {
    if (!isCanonical) {
      // For non-canonical versions, add redirect to canonical
      tags.push(`<meta name="prerender-status-code" content="301">`);
      tags.push(
        `<meta name="prerender-header" content="Location: ${canonicalUrl}">`
      );
    } else {
      // For canonical version, return 200
      tags.push(`<meta name="prerender-status-code" content="200">`);
    }
  }

  return tags.join("\n");
}

// Generate 404.html page
async function generate404Page({ template, outputDir, config, render }) {
  console.log("  ✓ Generating 404.html");

  try {
    // Render a non-existent route to get the notFoundTemplate content
    const renderResult = render("/this-route-does-not-exist-404");

    // The render function will return the notFoundTemplate HTML
    const renderedHTML = renderResult.html || "404 - Page Not Found";

    // Generate meta tags for 404 page
    const metaTags = [];
    metaTags.push(`<meta name="robots" content="noindex">`);
    if (config.prerenderStatusCode) {
      metaTags.push(`<meta name="prerender-status-code" content="404">`);
    }
    metaTags.push(`<meta name="twitter:card" content="summary_large_image">`);

    // Inject meta tags and content into template
    let html = template;

    // Extract existing title from template and combine with 404 title
    const existingTitleMatch = html.match(/<title>([^<]*)<\/title>/);
    const existingTitle = existingTitleMatch
      ? existingTitleMatch[1].trim()
      : null;

    // Create 404 title, combining with existing title if present
    const notFoundTitle = existingTitle
      ? `404 Not Found | ${existingTitle}`
      : "404 Not Found";

    if (html.includes("<title>")) {
      html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${notFoundTitle}</title>`
      );
    } else {
      html = html.replace(
        "</head>",
        `  <title>${notFoundTitle}</title>\n  </head>`
      );
    }

    // Add meta tags before </head>
    html = html.replace("</head>", `  ${metaTags.join("\n")}\n  </head>`);

    // Replace root div content with rendered HTML
    if (html.includes('<div id="root">')) {
      html = html.replace(
        /<div id="root">.*?<\/div>/s,
        `<div id="root">${renderedHTML}</div>`
      );
    } else {
      console.warn(`  ⚠️  Could not find <div id="root"> for 404.html`);
    }

    // Write 404.html
    const filePath = path.join(outputDir, "404.html");
    await fs.writeFile(filePath, html);

    if (config.verbose) {
      console.log(`  Generated: ${filePath}`);
    }
  } catch (error) {
    console.error("Failed to generate 404.html:", error);
  }
}

// Generate sitemap and robots.txt
async function generateSitemap(routes, config) {
  // Filter out dynamic routes
  const staticRoutes = routes.filter(
    (route) => !route.path.split("/").some((segment) => segment.startsWith(":"))
  );

  const urls = staticRoutes
    .map((route) => {
      // Apply trailing slash preference to sitemap URLs
      let urlPath = route.path;
      if (urlPath !== "/") {
        const cleanPath = urlPath.replace(/\/$/, "");
        urlPath = config.useTrailingSlash ? cleanPath + "/" : cleanPath;
      }
      const url = config.baseUrl + urlPath;
      return `  <url>\n    <loc>${url}</loc>\n  </url>`;
    })
    .join("\n");

  // Generate sitemap with full XML schema declarations
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" 
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const sitemapPath = path.join(config.outputDir, "sitemap.xml");
  await fs.writeFile(sitemapPath, sitemap);

  console.log(`  ✓ Generated sitemap.xml with ${staticRoutes.length} URLs`);

  if (config.verbose) {
    console.log(`    Output: ${sitemapPath}`);
  }

  // Generate robots.txt if it doesn't exist
  const robotsPath = path.join(config.outputDir, "robots.txt");
  try {
    await fs.access(robotsPath);
    if (config.verbose) {
      console.log(`  ✓ robots.txt already exists (skipped)`);
    }
  } catch {
    // File doesn't exist, create it
    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${config.baseUrl}/sitemap.xml`;

    await fs.writeFile(robotsPath, robotsContent);
    console.log(`  ✓ Generated robots.txt`);

    if (config.verbose) {
      console.log(`    Output: ${robotsPath}`);
    }
  }
}

// Default export
export default routerinoForge;
