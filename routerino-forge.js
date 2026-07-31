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

// Helper to check if a route is dynamic (contains :param)
const isDynamicRoute = (path) =>
  path.split("/").some((segment) => segment.startsWith(":"));

function validateBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.length === 0) {
    throw new Error(
      '[Routerino Forge] baseUrl is required and must be an absolute HTTP(S) origin, such as "https://example.com".'
    );
  }

  const hasWhitespaceOrControl = [...baseUrl].some((character) => {
    const codePoint = character.codePointAt(0);
    return character.trim() === "" || codePoint <= 0x1f || codePoint === 0x7f;
  });

  if (
    baseUrl !== baseUrl.trim() ||
    hasWhitespaceOrControl ||
    !/^https?:\/\/[^/?#]+$/i.test(baseUrl)
  ) {
    throw new Error(
      `[Routerino Forge] Invalid baseUrl "${baseUrl}". Use an absolute HTTP(S) origin with no path, query, hash, or trailing slash.`
    );
  }

  let parsedBaseUrl;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new Error(
      `[Routerino Forge] Invalid baseUrl "${baseUrl}". Use an absolute HTTP(S) origin with no path, query, hash, or trailing slash.`
    );
  }

  if (
    !["http:", "https:"].includes(parsedBaseUrl.protocol) ||
    parsedBaseUrl.username ||
    parsedBaseUrl.password ||
    parsedBaseUrl.pathname !== "/" ||
    parsedBaseUrl.search ||
    parsedBaseUrl.hash
  ) {
    throw new Error(
      `[Routerino Forge] Invalid baseUrl "${baseUrl}". Use an absolute HTTP(S) origin with no path, query, hash, or trailing slash.`
    );
  }
}

function validateRoutePath(route, index) {
  const routePath = route?.path;
  const routeLabel = routePath === undefined ? `at index ${index}` : routePath;

  if (typeof routePath !== "string" || routePath.length === 0) {
    throw new Error(
      `[Routerino Forge] Invalid route path ${routeLabel}: expected a non-empty string.`
    );
  }

  if (
    !routePath.startsWith("/") ||
    routePath.startsWith("//") ||
    routePath.includes("\\") ||
    routePath.includes("?") ||
    routePath.includes("#") ||
    routePath.includes("\0")
  ) {
    throw new Error(
      `[Routerino Forge] Unsafe route path "${routePath}". Route paths must be root-relative URL paths without queries, hashes, or backslashes.`
    );
  }

  const segments = routePath === "/" ? [] : routePath.slice(1).split("/");
  if (segments.at(-1) === "") segments.pop();

  for (const segment of segments) {
    if (segment.length === 0) {
      throw new Error(
        `[Routerino Forge] Unsafe route path "${routePath}": empty path segments are not allowed.`
      );
    }

    let decodedSegment;
    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      throw new Error(
        `[Routerino Forge] Unsafe route path "${routePath}": invalid percent encoding.`
      );
    }

    if (
      decodedSegment === "." ||
      decodedSegment === ".." ||
      decodedSegment.includes("/") ||
      decodedSegment.includes("\\") ||
      decodedSegment.includes("\0")
    ) {
      throw new Error(
        `[Routerino Forge] Unsafe route path "${routePath}": path traversal and encoded separators are not allowed.`
      );
    }
  }
}

function hasInvalidRouteElement(route) {
  return (
    !route.element ||
    typeof route.element === "boolean" ||
    typeof route.element === "function" ||
    typeof route.element === "symbol"
  );
}

function resolveOutputPath(outputDir, ...segments) {
  const outputRoot = path.resolve(outputDir);
  const outputPath = path.resolve(outputRoot, ...segments);
  const relativePath = path.relative(outputRoot, outputPath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(
      `[Routerino Forge] Refusing to write outside outputDir: ${outputPath}`
    );
  }

  return outputPath;
}

function resolveSsgCacheRoot(projectRoot, cacheDirectory) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  return resolveOutputPath(resolvedProjectRoot, cacheDirectory);
}

function getRouteOutputFiles(routePath, outputDir) {
  if (routePath === "/") {
    return [{ path: resolveOutputPath(outputDir, "index.html") }];
  }

  const relativeRoutePath = routePath.slice(1).replace(/\/$/, "");
  const routeSegments = relativeRoutePath.split("/");
  const lastSegment = routeSegments.at(-1);
  const parentSegments = routeSegments.slice(0, -1);
  const canonicalPath = `/${relativeRoutePath}`;

  return [
    {
      path: resolveOutputPath(
        outputDir,
        ...parentSegments,
        `${lastSegment}.html`
      ),
      urlPath: canonicalPath,
    },
    {
      path: resolveOutputPath(outputDir, ...routeSegments, "index.html"),
      urlPath: `${canonicalPath}/`,
    },
  ];
}

function validateStaticOutputPaths(routes, outputDir) {
  const outputOwners = new Map();

  const reserveOutput = (filePath, owner) => {
    const portablePath = path.resolve(filePath).toLowerCase();
    const existingOwner = outputOwners.get(portablePath);

    if (existingOwner) {
      throw new Error(
        `[Routerino Forge] Static output collision: ${owner} and ${existingOwner} both generate ${filePath}`
      );
    }

    outputOwners.set(portablePath, owner);
  };

  reserveOutput(
    resolveOutputPath(outputDir, "404.html"),
    "the reserved 404 page"
  );

  for (const route of routes) {
    for (const file of getRouteOutputFiles(route.path, outputDir)) {
      reserveOutput(file.path, `route "${route.path}"`);
    }
  }
}

function getNotFoundProbePath(routes) {
  const maximumSegmentCount = routes.reduce((maximum, route) => {
    const segmentCount = route.path.split("/").filter(Boolean).length;
    return Math.max(maximum, segmentCount);
  }, 0);
  const probeSegments = Array.from(
    { length: maximumSegmentCount + 1 },
    (_, index) => `__routerino-forge-404-${index + 1}__`
  );

  return `/${probeSegments.join("/")}`;
}

async function verifyGeneratedHtmlFiles(routes, outputDir) {
  const expectedFiles = [resolveOutputPath(outputDir, "404.html")];

  for (const route of routes) {
    expectedFiles.push(
      ...getRouteOutputFiles(route.path, outputDir).map((file) => file.path)
    );
  }

  for (const filePath of expectedFiles) {
    let fileStats;
    try {
      fileStats = await fs.stat(filePath);
    } catch {
      throw new Error(
        `[Routerino Forge] Expected HTML output was not generated: ${filePath}`
      );
    }

    if (!fileStats.isFile() || fileStats.size === 0) {
      throw new Error(
        `[Routerino Forge] Expected non-empty HTML output: ${filePath}`
      );
    }
  }
}

export function routerinoForge(options = {}) {
  // Configuration with defaults
  const config = {
    routes: options.routes || "./src/routes.jsx",
    template: options.template || "index.html", // Built HTML path relative to outputDir
    outputDir: options.outputDir || "dist",
    baseUrl: options.baseUrl || "",
    generateSitemap: options.generateSitemap ?? true,
    verbose: options.verbose ?? false,
    useTrailingSlash: options.useTrailingSlash ?? true, // Default to trailing slashes
    ssgCacheDir:
      options.ssgCacheDir || "node_modules/.cache/routerino-forge/ssg",
  };

  let viteConfig;
  let hasRun = false;

  return {
    name: "routerino-forge",

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async closeBundle() {
      // Only run during build, not during dev server
      if (viteConfig.command !== "build") return;

      if (hasRun || viteConfig.build.ssr) return; // Skip if already run or if this IS the SSG build
      hasRun = true;

      validateBaseUrl(config.baseUrl);

      const ssgCacheRoot = resolveSsgCacheRoot(
        viteConfig.root,
        config.ssgCacheDir
      );

      let tempEntryPath = null;
      let ssgOutDir = null;

      try {
        await fs.mkdir(ssgCacheRoot, { recursive: true });
        ssgOutDir = await fs.mkdtemp(
          path.join(ssgCacheRoot, "routerino-forge-build-")
        );

        // Step 1: Build bundle for static generation
        let ssgEntryPath = path.resolve(
          viteConfig.root,
          "src/entry-server.jsx"
        );
        // Check if user has custom entry-server, otherwise create temp one
        try {
          await fs.access(ssgEntryPath);
        } catch {
          // Create temp entry-server in the user's build directory (already gitignored)
          const buildDir = viteConfig.build.outDir || "dist";
          const tempDir = path.resolve(
            viteConfig.root,
            buildDir,
            ".forge-temp"
          );
          tempEntryPath = path.resolve(tempDir, "entry-server.jsx");
          ssgEntryPath = tempEntryPath;

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

// Check if App component is exported from routes file
// App can be: named export, default export, or App property on default export
const App = routesModule.App || 
            (typeof routesModule.default === 'function' ? routesModule.default : routesModule.default?.App);

if (!routes) {
  throw new Error('Could not find routes export. Expected "export const routes" or "export default" from ${relativePath}');
}

// Helper to check if a route is dynamic (contains :param)
const isDynamicRoute = (path) => path.split("/").some(segment => segment.startsWith(":"));
export { routes, App };

// Mock minimal window object for SSG
function mockWindow(url, baseUrl) {
  const urlObj = new URL(url, baseUrl || 'http://localhost');
  global.window = {
    location: {
      href: urlObj.href,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      origin: urlObj.origin,
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port
    },
    history: {
      pushState: () => {},
      replaceState: () => {}
    },
    scrollTo: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
  // Mock for document with more complete implementation
  const mockElements = [];
  global.document = {
    title: '', // Mock title property for SSG
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: (selector) => {
      // Return mock head for head selector
      if (selector === 'head') {
        return {
          appendChild: (elem) => {
            mockElements.push(elem);
            return elem;
          }
        };
      }
      // For meta tag queries, return null (tag not found)
      return null;
    },
    createElement: (tagName) => {
      const elem = {
        tagName,
        attributes: {},
        setAttribute: function(name, value) {
          this.attributes[name] = value;
        },
        appendChild: () => {}
      };
      return elem;
    },
    head: {
      appendChild: (elem) => {
        mockElements.push(elem);
        return elem;
      },
      querySelector: () => null,
      querySelectorAll: () => []
    }
  };
  // Signal to the Image component that we're running in SSG mode
  global.document.__ROUTERINO_SSG__ = true;
}

export function render(url, baseUrl) {
  // Check if we should render the full App or just the route element
  if (App) {
    // Find the route to render
    const route = routes.find(r => {
      if (r.path === url) return true;
      if (r.path === '/' && url === '/') return true;
      if (isDynamicRoute(r.path)) return false;
      return r.path === url;
    });
    
    // Mock window for the current route
    mockWindow(url, baseUrl);
    
    try {
      // Render the App with Routerino SSG-aware
      const html = ReactDOMServer.renderToString(React.createElement(App));

      return {
        html,
        title: route?.title,
        description: route?.description,
        imageUrl: route?.imageUrl,
        notFound: !route
      };
    } finally {
      // Clean up global mocks
      delete global.window;
      delete global.document;
    }
  }

  // Fall back to route-only rendering when App is not defined.
  const route = routes.find(r => {
    if (r.path === url) return true;
    if (r.path === '/' && url === '/') return true;
    if (isDynamicRoute(r.path)) return false;
    return r.path === url;
  });
  
  if (!route) {
    if (notFoundTemplate) {
      const notFoundHTML = ReactDOMServer.renderToString(notFoundTemplate);
      return { html: notFoundHTML, notFound: true };
    }
    return { html: '<div><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p></div>', notFound: true };
  }
  
  const html = ReactDOMServer.renderToString(route.element);
  return {
    html,
    title: route.title,
    description: route.description,
    imageUrl: route.imageUrl
  };
}`.trim();

          // Ensure temp directory exists
          await fs.mkdir(tempDir, { recursive: true });
          await fs.writeFile(tempEntryPath, entryContent);

          if (config.verbose) {
            console.log("[Routerino Forge] Using auto-generated entry for SSG");
          }
        }

        console.log("[Routerino Forge] Forging SSG bundle...");
        await build({
          root: viteConfig.root,
          configFile: viteConfig.configFile,
          build: {
            ssr: ssgEntryPath,
            outDir: ssgOutDir,
            rollupOptions: {
              output: {
                format: "es",
                entryFileNames: "entry-server.mjs",
                manualChunks: () => null,
              },
            },
          },
          logLevel: "error",
        });

        // Step 2: Load the built module
        const ssgModulePath = path.join(ssgOutDir, "entry-server.mjs");
        try {
          await fs.access(ssgModulePath);
        } catch {
          throw new Error(
            `[Routerino Forge] SSG build did not generate ${ssgModulePath}`
          );
        }
        const ssgModule = await import(pathToFileURL(ssgModulePath).href);
        const { render, routes } = ssgModule;

        // Validate routes
        if (!routes || !Array.isArray(routes)) {
          throw new Error(`Routes must be an array. Got: ${typeof routes}`);
        }

        if (typeof render !== "function") {
          throw new Error(
            `SSG entry must export a render function. Got: ${typeof render}`
          );
        }

        routes.forEach((route, index) => validateRoutePath(route, index));

        // Count only static routes (excluding dynamic routes with parameters)
        const staticRoutes =
          routes?.filter((route) => !isDynamicRoute(route.path)) || [];

        if (routes.length === 0) {
          throw new Error(
            "[Routerino Forge] No routes found - check your routes export"
          );
        }

        const invalidStaticRoutes = staticRoutes.filter(hasInvalidRouteElement);
        if (invalidStaticRoutes.length > 0) {
          throw new Error(
            `[Routerino Forge] Static routes must provide a renderable JSX element. Invalid routes: ${invalidStaticRoutes
              .map((route) => route.path)
              .join(", ")}`
          );
        }

        const invalidDynamicRoutes = routes.filter(
          (route) => isDynamicRoute(route.path) && hasInvalidRouteElement(route)
        );
        for (const route of invalidDynamicRoutes) {
          console.warn(
            `[Routerino Forge] Dynamic route ${route.path} has an invalid element and will not be statically generated`
          );
        }

        const outputDirectory = path.resolve(viteConfig.root, config.outputDir);
        validateStaticOutputPaths(staticRoutes, outputDirectory);
        console.log(
          `[Routerino Forge] Found ${routes?.length || 0} routes (${staticRoutes.length} static, ${(routes?.length || 0) - staticRoutes.length} dynamic)`
        );

        // Read the selected built HTML file from inside outputDir.
        if (path.isAbsolute(config.template)) {
          throw new Error(
            "[Routerino Forge] template must be a path relative to outputDir"
          );
        }
        const templatePath = resolveOutputPath(
          outputDirectory,
          config.template
        );

        let template;
        try {
          template = await fs.readFile(templatePath, "utf-8");
          if (config.verbose) {
            console.log(`[Routerino Forge] Using template: ${templatePath}`);
          }
        } catch (e) {
          console.error("[Routerino Forge] Template read error:", e);
          throw new Error(
            `Failed to read template at ${templatePath}. Make sure the build has completed and created the HTML file.`,
            { cause: e }
          );
        }

        // Check if template has the root div
        if (!/<div[^>]*\sid=["']root["'][^>]*>/i.test(template)) {
          throw new Error(
            '[Routerino Forge] Template missing <div id="root">. The plugin needs this to inject rendered HTML.'
          );
        }

        // Generate static HTML for each route
        await generateStaticPages({
          routes,
          template,
          outputDir: outputDirectory,
          config,
          render, // Pass the render function
        });

        // Generate 404.html page
        await generate404Page({
          template: template,
          outputDir: outputDirectory,
          config,
          render, // Pass the render function
          routes,
        });

        await verifyGeneratedHtmlFiles(staticRoutes, outputDirectory);

        // Generate sitemap if enabled
        if (config.generateSitemap) {
          await generateSitemap(routes, {
            ...config,
            outputDir: outputDirectory,
          });
        }

        // Count generated files (2 per route except root which has 1)
        const fileCount = staticRoutes.reduce(
          (count, route) => count + (route.path === "/" ? 1 : 2),
          0
        );
        console.log(
          `[Routerino Forge] ✓ Generated ${fileCount} HTML files (${staticRoutes.length} routes) + 404.html`
        );
      } catch (error) {
        console.error(
          "[Routerino Forge] Failed to generate static pages:",
          error.message
        );
        if (config.verbose) {
          console.error("[Routerino Forge] Stack trace:", error.stack);
        }
        throw error;
      } finally {
        // Clean up SSG cache directory
        if (ssgOutDir) {
          try {
            await fs.rm(ssgOutDir, { recursive: true, force: true });
          } catch {
            // Ignore if the dedicated temporary directory is already gone.
          }
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
    if (isDynamicRoute(route.path)) {
      if (config.verbose) {
        console.log(`[Routerino Forge] Skipped dynamic route: ${route.path}`);
      }
      continue;
    }

    try {
      // Use the render function to generate HTML (pass baseUrl for window mocking)
      const renderResult = await render(route.path, config.baseUrl);

      if (!renderResult || typeof renderResult !== "object") {
        throw new Error("render() did not return a result object");
      }

      if (renderResult.notFound) {
        throw new Error("render() reported the configured route as not found");
      }

      if (
        typeof renderResult.html !== "string" ||
        renderResult.html.trim() === ""
      ) {
        throw new Error("render() did not return a non-empty HTML string");
      }

      const renderedHTML = renderResult.html;
      console.log(`[Routerino Forge] ✓ Rendered ${route.path}`);

      // Override metadata with render result if available
      if (renderResult.title) route.title = renderResult.title;
      if (renderResult.description)
        route.description = renderResult.description;
      if (renderResult.imageUrl) route.imageUrl = renderResult.imageUrl;

      // Generate files for both URL patterns (with and without trailing slash)
      const filesToGenerate = getRouteOutputFiles(route.path, outputDir);

      // Write files with appropriate meta tags
      for (const file of filesToGenerate) {
        // Generate meta tags with canonical URL
        const metaTags = generateMetaTags(
          route,
          config,
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
          const escapedRouteTitle = escapeHtmlText(route.title);
          const finalTitle = existingTitle
            ? `${escapedRouteTitle} | ${existingTitle}`
            : escapedRouteTitle;

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
        const rootDivRegex =
          /(<div[^>]*\sid=["']root["'][^>]*>)(.*?)(<\/div>)/is;
        if (rootDivRegex.test(html)) {
          html = html.replace(
            rootDivRegex,
            (_match, openingTag, _existingContent, closingTag) =>
              `${openingTag}${renderedHTML}${closingTag}`
          );
        } else {
          throw new Error(
            `[Routerino Forge] Could not find <div id="root"> for ${route.path}`
          );
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(file.path), { recursive: true });

        // Write file
        await fs.writeFile(file.path, html);

        if (config.verbose) {
          console.log(`[Routerino Forge] Generated: ${file.path}`);
        }
      }
    } catch (error) {
      throw new Error(
        `[Routerino Forge] Failed to generate route "${route.path}": ${error.message}`,
        { cause: error }
      );
    }
  }
}

function escapeHtmlAttribute(content) {
  return String(content)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlText(content) {
  return escapeHtmlAttribute(content);
}

function formatMetaAttribute(attrName, content) {
  if (content === undefined || content === null) return "";

  if (!/^[A-Za-z][A-Za-z0-9:._-]*$/.test(attrName)) {
    throw new Error(
      `[Routerino Forge] Invalid HTML attribute name: ${attrName}`
    );
  }

  return `${attrName}="${escapeHtmlAttribute(content)}"`;
}

function resolveImageUrl(imageUrl, baseUrl) {
  const imageUrlString = String(imageUrl);

  try {
    return new URL(imageUrlString, `${baseUrl}/`).href;
  } catch (error) {
    throw new Error(
      `[Routerino Forge] Invalid imageUrl "${imageUrlString}": ${error.message}`,
      { cause: error }
    );
  }
}

// Generate meta tags
function generateMetaTags(route, config, urlPath) {
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
  tags.push(
    `<link rel="canonical" ${formatMetaAttribute("href", canonicalUrl)}>`
  );

  if (route.description) {
    tags.push(
      `<meta name="description" ${formatMetaAttribute("content", route.description)}>`
    );
  }

  // Open Graph tags
  if (route.title) {
    tags.push(
      `<meta property="og:title" ${formatMetaAttribute("content", route.title)}>`
    );
  }

  if (route.description) {
    tags.push(
      `<meta property="og:description" ${formatMetaAttribute("content", route.description)}>`
    );
  }

  // Add og:url with canonical URL
  tags.push(
    `<meta property="og:url" ${formatMetaAttribute("content", canonicalUrl)}>`
  );

  if (route.imageUrl) {
    const imageUrl = resolveImageUrl(route.imageUrl, config.baseUrl);
    tags.push(
      `<meta property="og:image" ${formatMetaAttribute("content", imageUrl)}>`
    );
  }

  // Twitter card
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);

  // Add custom tags from route.tags array
  if (route.tags && Array.isArray(route.tags)) {
    route.tags.forEach((tag) => {
      const tagName = tag.tag || "meta";
      const innerHTML = tag.innerHTML;
      if (!/^[A-Za-z][A-Za-z0-9:-]*$/.test(tagName)) {
        throw new Error(`[Routerino Forge] Invalid HTML tag name: ${tagName}`);
      }
      const attrs = Object.entries(tag)
        .filter(
          ([key]) => key !== "tag" && key !== "soft" && key !== "innerHTML"
        )
        .map(([key, value]) => formatMetaAttribute(key, value))
        .filter(Boolean)
        .join(" ");

      if (attrs || innerHTML !== undefined) {
        if (innerHTML !== undefined) {
          tags.push(`<${tagName} ${attrs}>${innerHTML}</${tagName}>`);
        } else {
          tags.push(`<${tagName} ${attrs}>`);
        }
      }
    });
  }

  return tags.join("\n");
}

// Generate 404.html page
async function generate404Page({
  template,
  outputDir,
  config,
  render,
  routes,
}) {
  console.log("[Routerino Forge] ✓ Generating 404.html");

  try {
    // Render a non-existent route to get the notFoundTemplate content
    const renderResult = await render(
      getNotFoundProbePath(routes),
      config.baseUrl
    );

    if (!renderResult || typeof renderResult !== "object") {
      throw new Error("render() did not return a result object");
    }

    if (
      typeof renderResult.html !== "string" ||
      renderResult.html.trim() === ""
    ) {
      throw new Error("render() did not return a non-empty HTML string");
    }

    if (renderResult.notFound !== true) {
      throw new Error("render() did not report the 404 probe as not found");
    }

    // The render function returns the notFoundTemplate HTML (already includes App wrapper if App exists)
    const renderedHTML = renderResult.html;

    // Generate meta tags for 404 page
    const metaTags = [];
    metaTags.push(`<meta name="robots" content="noindex">`);
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
    const rootDivRegex = /(<div[^>]*\sid=["']root["'][^>]*>)(.*?)(<\/div>)/is;
    if (rootDivRegex.test(html)) {
      html = html.replace(
        rootDivRegex,
        (_match, openingTag, _existingContent, closingTag) =>
          `${openingTag}${renderedHTML}${closingTag}`
      );
    } else {
      throw new Error(
        '[Routerino Forge] Could not find <div id="root"> for 404.html'
      );
    }

    // Write 404.html
    const filePath = resolveOutputPath(outputDir, "404.html");
    await fs.writeFile(filePath, html);

    if (config.verbose) {
      console.log(`[Routerino Forge] Generated: ${filePath}`);
    }
  } catch (error) {
    throw new Error(
      `[Routerino Forge] Failed to generate 404.html: ${error.message}`,
      { cause: error }
    );
  }
}

// Generate sitemap and robots.txt
async function generateSitemap(routes, config) {
  // Filter out dynamic routes
  const staticRoutes = routes.filter((route) => !isDynamicRoute(route.path));

  const urls = staticRoutes
    .map((route) => {
      // Apply trailing slash preference to sitemap URLs
      let urlPath = route.path;
      if (urlPath !== "/") {
        const cleanPath = urlPath.replace(/\/$/, "");
        urlPath = config.useTrailingSlash ? cleanPath + "/" : cleanPath;
      }
      const url = config.baseUrl + urlPath;
      return `  <url>\n    <loc>${escapeHtmlText(url)}</loc>\n  </url>`;
    })
    .join("\n");

  // Generate sitemap with full XML schema declarations
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" 
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const sitemapPath = resolveOutputPath(config.outputDir, "sitemap.xml");
  await fs.writeFile(sitemapPath, sitemap);

  console.log(
    `[Routerino Forge] ✓ Generated sitemap.xml with ${staticRoutes.length} URLs`
  );

  if (config.verbose) {
    console.log(`[Routerino Forge] Output: ${sitemapPath}`);
  }

  // Generate robots.txt if it doesn't exist
  const robotsPath = resolveOutputPath(config.outputDir, "robots.txt");
  try {
    await fs.access(robotsPath);
    if (config.verbose) {
      console.log("[Routerino Forge] ✓ robots.txt already exists (skipped)");
    }
  } catch {
    // File doesn't exist, create it
    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${config.baseUrl}/sitemap.xml`;

    await fs.writeFile(robotsPath, robotsContent);
    console.log("[Routerino Forge] ✓ Generated robots.txt");

    if (config.verbose) {
      console.log(`[Routerino Forge] Output: ${robotsPath}`);
    }
  }
}

export default routerinoForge;
