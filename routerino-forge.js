import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { build } from "vite";
import crypto from "crypto";
import { spawn } from "child_process";

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

// Helper to check if an image should be processed
const shouldProcessImage = (src) =>
  !src.startsWith("http") && !src.startsWith("data:") && !src.endsWith(".svg");

// Default configuration for Image component processing
const DEFAULT_IMAGE_CONFIG = {
  widths: [480, 800, 1200, 1920],
  formats: ["webp"], // WebP is sufficient for Lighthouse 100/100
  placeholderSize: 20,
  blur: 4,
  maxSize: 10485760, // 10MB
  minSize: 1024, // 1KB
  cacheDir: "node_modules/.cache/routerino-forge",
};

// Get image dimensions using ffprobe
function getImageDimensionsWithFfprobe(inputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "json",
      inputPath,
    ];

    const ffprobe = spawn("ffprobe", args);

    let output = "";
    let errorOutput = "";

    ffprobe.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    ffprobe.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ffprobe.on("error", (err) => {
      reject(new Error(`Failed to spawn ffprobe: ${err.message}`));
    });

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`ffprobe exited with code ${code}. Error: ${errorOutput}`)
        );
      }

      try {
        const result = JSON.parse(output);
        const stream = result.streams?.[0];
        if (stream?.width && stream?.height) {
          resolve({ width: stream.width, height: stream.height });
        } else {
          reject(new Error("Could not extract dimensions from ffprobe output"));
        }
      } catch (error) {
        reject(new Error(`Failed to parse ffprobe output: ${error.message}`));
      }
    });
  });
}

/**
 * Generate responsive image variants using ffmpeg
 * Creates WebP versions at multiple widths + LQIP placeholder
 */
async function generateResponsiveImages(
  inputPath,
  outputDir,
  config = DEFAULT_IMAGE_CONFIG
) {
  try {
    // Get base name for generating variants
    const inputFileName = path.basename(inputPath);
    const base = inputFileName.replace(/\.(jpe?g|png)$/i, "");
    const originalExtension =
      inputFileName.match(/\.(jpe?g|png)$/i)?.[0] || ".jpg";

    // Get dimensions using ffprobe
    const dimensions = await getImageDimensionsWithFfprobe(inputPath).catch(
      () => null
    );

    // Generate placeholder (LQIP)
    const placeholder = await generatePlaceholder(
      inputPath,
      config.placeholderSize
    );

    const results = {
      placeholder,
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
      variants: {},
    };

    // Filter widths to only include those applicable to this image
    const applicableWidths = config.widths.filter(
      (width) => !dimensions || dimensions.width >= width
    );

    // Generate responsive variants for applicable widths only
    for (const width of applicableWidths) {
      // Generate WebP version in output directory
      const webpPath = path.join(outputDir, `${base}-${width}w.webp`);
      await generateImageVariant(inputPath, webpPath, width, "webp");

      // Generate original format version in output directory
      const originalPath = path.join(
        outputDir,
        `${base}-${width}w${originalExtension}`
      );
      await generateImageVariant(
        inputPath,
        originalPath,
        width,
        originalExtension.slice(1)
      );

      results.variants[width] = {
        webp: `/${base}-${width}w.webp`, // Web-relative paths
        original: `/${base}-${width}w${originalExtension}`,
      };
    }

    return results;
  } catch (error) {
    console.warn(
      `[Routerino Image] Could not process ${inputPath}:`,
      error.message
    );
    return null;
  }
}

/**
 * Generate a single image variant at specified width
 */
async function generateImageVariant(inputPath, outputPath, width, format) {
  return new Promise((resolve, reject) => {
    // Build ffmpeg command based on format
    const args = ["-i", inputPath, "-vf", `scale=${width}:-2`];

    if (format === "webp") {
      args.push("-c:v", "libwebp", "-q:v", "80");
    } else {
      args.push("-q:v", "2"); // High quality JPEG
    }

    args.push("-y", outputPath); // Overwrite existing files

    const ffmpeg = spawn("ffmpeg", args);
    let errorOutput = "";

    ffmpeg.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on("error", (err) => {
      reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`ffmpeg exited with code ${code}. Error: ${errorOutput}`)
        );
      }
      resolve(outputPath);
    });
  });
}

/**
 * Generate LQIP placeholder using ffmpeg
 */
async function generatePlaceholder(inputPath, targetHeight = 20) {
  return new Promise((resolve, reject) => {
    const args = [
      "-i",
      inputPath,
      "-vf",
      `scale=-1:${targetHeight}`,
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "-loglevel",
      "error",
      "pipe:1",
    ];

    const ffmpeg = spawn("ffmpeg", args);
    let chunks = [];
    let errorOutput = "";

    ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
    ffmpeg.stderr.on("data", (data) => (errorOutput += data.toString()));

    ffmpeg.on("error", (err) => {
      reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`ffmpeg exited with code ${code}. Error: ${errorOutput}`)
        );
      }
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString("base64");
      resolve(`data:image/png;base64,${base64}`);
    });
  });
}

// Get cache key for responsive image processing
async function getImageCacheKey(imagePath, config = DEFAULT_IMAGE_CONFIG) {
  try {
    const stats = await fs.stat(imagePath);
    const hash = crypto.createHash("md5");
    hash.update(imagePath);
    hash.update(stats.mtime.toISOString());
    hash.update(stats.size.toString());
    hash.update(JSON.stringify(config.widths));
    hash.update("routerino-image-v1"); // Version the cache format
    return hash.digest("hex");
  } catch {
    return null;
  }
}

/**
 * Process <Image> components in HTML to add responsive images + LQIP
 * Only processes elements with data-routerino-image="true"
 */
async function processRouterInoImages(html, outputDir) {
  const stats = {
    processed: 0,
    skipped: 0,
    totalSize: 0,
    generated: 0,
    errors: [],
  };

  // Ensure cache directory exists
  const cacheDir = path.resolve(DEFAULT_IMAGE_CONFIG.cacheDir);
  await fs.mkdir(cacheDir, { recursive: true }).catch(() => {});

  // Find all <picture> elements with data-routerino-image attribute
  const pictureRegex =
    /<picture[^>]*data-routerino-image="true"[^>]*data-original-src="([^"]+)"[^>]*>(.*?)<\/picture>/gis;
  let processedHTML = html;
  let match;

  while ((match = pictureRegex.exec(html)) !== null) {
    const [fullMatch, originalSrc] = match;

    // Skip external URLs, data URLs, and SVGs
    if (!shouldProcessImage(originalSrc)) {
      stats.skipped++;
      continue;
    }

    try {
      // Resolve image path with security check
      const imagePath = path.resolve(outputDir, originalSrc.replace(/^\//, ""));
      const resolvedOutputDir = path.resolve(outputDir);

      if (!imagePath.startsWith(resolvedOutputDir)) {
        stats.skipped++;
        continue;
      }

      // Check if file exists and size
      const fileStats = await fs.stat(imagePath);
      if (
        fileStats.size < DEFAULT_IMAGE_CONFIG.minSize ||
        fileStats.size > DEFAULT_IMAGE_CONFIG.maxSize
      ) {
        stats.skipped++;
        continue;
      }

      stats.totalSize += fileStats.size;

      // Check cache
      const cacheKey = await getImageCacheKey(imagePath);
      if (!cacheKey) {
        stats.skipped++;
        continue;
      }

      const cacheFile = path.join(cacheDir, `${cacheKey}.json`);
      let imageData;

      try {
        // Try to read from cache
        const cached = JSON.parse(await fs.readFile(cacheFile, "utf-8"));
        imageData = cached;
      } catch {
        // Generate responsive images + placeholder
        imageData = await generateResponsiveImages(imagePath, outputDir);

        if (!imageData) {
          stats.skipped++;
          continue;
        }

        // Save to cache
        await fs
          .writeFile(cacheFile, JSON.stringify(imageData))
          .catch(() => {});
        stats.generated++;
      }

      // Transform the picture element with LQIP
      const transformedPicture = await transformPictureWithLQIP(
        fullMatch,
        originalSrc,
        imageData,
        DEFAULT_IMAGE_CONFIG
      );

      processedHTML = processedHTML.replace(fullMatch, transformedPicture);
      stats.processed++;
    } catch (error) {
      stats.errors.push({ src: originalSrc, error: error.message });
      stats.skipped++;
    }
  }

  return { html: processedHTML, stats };
}

/**
 * Transform a picture element to include LQIP background and update srcsets
 */
async function transformPictureWithLQIP(
  pictureHTML,
  originalSrc,
  imageData,
  config
) {
  // Create unique class for LQIP styling
  const uniqueClass = `routerino-img-${Math.random().toString(36).substring(2, 11)}`;

  // LQIP background styles
  const lqipStyle = `
    .${uniqueClass} {
      position: relative;
      display: inline-block;
      ${imageData.width && imageData.height ? `aspect-ratio: ${imageData.width / imageData.height};` : ""}
    }
    .${uniqueClass}::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url('${imageData.placeholder}');
      background-size: cover;
      background-position: center;
      filter: blur(${config.blur}px);
      z-index: -1;
    }
  `;

  // Update srcsets to point to generated responsive images
  let updatedPicture = pictureHTML;

  // Update WebP source srcset using actual generated paths
  const webpSrcSet = Object.entries(imageData.variants)
    .map(([width, paths]) => `${paths.webp} ${width}w`)
    .join(", ");

  if (webpSrcSet) {
    updatedPicture = updatedPicture.replace(
      /(<source[^>]*srcSet=")([^"]*)"([^>]*type="image\/webp"[^>]*)/i,
      `$1${webpSrcSet}"$3`
    );
  }

  // Update original format srcset using actual generated paths
  const originalSrcSet = Object.entries(imageData.variants)
    .map(([width, paths]) => `${paths.original} ${width}w`)
    .join(", ");

  if (originalSrcSet) {
    updatedPicture = updatedPicture.replace(
      /(<img[^>]*srcSet=")([^"]*)/i,
      `$1${originalSrcSet}`
    );
    // Also update any other source elements that aren't WebP
    updatedPicture = updatedPicture.replace(
      /(<source(?![^>]*type="image\/webp")[^>]*srcSet=")([^"]*)/i,
      `$1${originalSrcSet}`
    );
  }

  // Add opacity: 0 to img tag
  updatedPicture = updatedPicture.replace(
    /<img([^>]*?)\/?>/i,
    (match, attributes) => {
      // Add opacity: 0 to existing style or create new style attribute
      if (attributes.includes("style=")) {
        return match.replace(/style=["']([^"']*)/i, 'style="opacity: 0; $1');
      } else {
        return `<img${attributes} style="opacity: 0"/>`;
      }
    }
  );

  // Wrap the picture in a div with LQIP styling
  return `<style>${lqipStyle}</style><div class="${uniqueClass}">${updatedPicture}</div>`;
}

export function routerinoForge(options = {}) {
  // Configuration with defaults - simplified, no image optimization config needed
  const config = {
    routes: options.routes || "./src/routes.jsx",
    template: options.template || "index.html", // Default to source index.html
    outputDir: options.outputDir || "dist",
    baseUrl: options.baseUrl || "",
    generateSitemap: options.generateSitemap ?? true,
    verbose: options.verbose ?? false,
    useTrailingSlash: options.useTrailingSlash ?? true, // Default to trailing slashes
    ssgCacheDir:
      options.ssgCacheDir || "node_modules/.cache/routerino-forge/ssg",
  };

  // Normalize baseUrl: strip trailing slashes to ensure correct canonical composition
  if (typeof config.baseUrl === "string" && config.baseUrl.length > 0) {
    const normalized = config.baseUrl.replace(/\/+$/, "");
    if (normalized !== config.baseUrl) {
      console.warn(
        "[Routerino Forge] Normalized baseUrl by removing trailing slash:",
        config.baseUrl,
        "->",
        normalized
      );
      config.baseUrl = normalized;
    }
  }

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

      let tempEntryPath = null;

      try {
        // Step 1: Build bundle for static generation
        let ssgEntryPath = path.resolve(
          viteConfig.root,
          "src/entry-server.jsx"
        );
        const ssgOutDir = path.resolve(viteConfig.root, config.ssgCacheDir);

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
    } catch (error) {
      console.error(\`[Routerino Forge] Failed to render App for route \${url}:\`, error.message);
      console.error(\`[Routerino Forge] Stack trace:\`, error.stack);
      // Fall back to route-only rendering
    } finally {
      // Clean up global mocks
      delete global.window;
      delete global.document;
    }
  }
  
  // Original behavior: render just the route element
  // Need to find the route again if App path wasn't taken
  const route = App ? null : routes.find(r => {
    if (r.path === url) return true;
    if (r.path === '/' && url === '/') return true;
    if (isDynamicRoute(r.path)) return false;
    return r.path === url;
  });
  
  // If we get here and App was defined, it means the App render failed
  // Return early to avoid duplicate rendering
  if (App) return;
  
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
    console.error(\`[Routerino Forge] Failed to render route \${route.path}:\`, error.message);
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
            console.log("[Routerino Forge] Using auto-generated entry for SSG");
          }
        }

        console.log("[Routerino Forge] Forging SSG bundle...");
        await build({
          root: viteConfig.root,
          build: {
            ssr: ssgEntryPath,
            outDir: ssgOutDir,
            rollupOptions: {
              output: {
                format: "es",
                entryFileNames: "entry-server.mjs",
              },
            },
          },
          logLevel: "error",
        });

        // Step 2: Load the built module
        const ssgModule = await import(
          pathToFileURL(path.join(ssgOutDir, "entry-server.mjs")).href
        );
        let { render, routes } = ssgModule;

        // Validate routes
        if (!routes || !Array.isArray(routes)) {
          throw new Error(`Routes must be an array. Got: ${typeof routes}`);
        }

        if (routes.length === 0) {
          console.warn(
            "[Routerino Forge] No routes found - check your routes export"
          );
        }

        // Check for common issues
        const invalidRoutes = routes.filter((route) => {
          if (!route.element) {
            console.warn(
              `[Routerino Forge] Route ${route.path} has no element property`
            );
            return true;
          }
          if (typeof route.element === "function") {
            console.warn(
              `[Routerino Forge] Route ${route.path} element is a function - should be JSX element like <Component />`
            );
            return true;
          }
          return false;
        });

        if (invalidRoutes.length > 0) {
          console.warn(
            `[Routerino Forge] ${invalidRoutes.length} routes have issues - see warnings above`
          );
        }

        // Count only static routes (excluding dynamic routes with parameters)
        const staticRoutes =
          routes?.filter((route) => !isDynamicRoute(route.path)) || [];
        console.log(
          `[Routerino Forge] Found ${routes?.length || 0} routes (${staticRoutes.length} static, ${(routes?.length || 0) - staticRoutes.length} dynamic)`
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
            console.log(`[Routerino Forge] Using template: ${templatePath}`);
          }
        } catch (e) {
          console.error("[Routerino Forge] Template read error:", e);
          throw new Error(
            `Failed to read template at ${templatePath}. Make sure the build has completed and created the HTML file.`
          );
        }

        // Check if template has the root div
        if (!/<div[^>]*\sid=["']root["'][^>]*>/i.test(template)) {
          console.warn(
            '[Routerino Forge] Template missing <div id="root">. The plugin needs this to inject rendered HTML.'
          );
        }

        // Generate static HTML for each route
        const imageStats = await generateStaticPages({
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
          `[Routerino Forge] ✓ Generated ${fileCount} HTML files (${staticRoutes.length} routes) + 404.html`
        );

        // Display Image component processing stats
        if (imageStats && imageStats.processed > 0) {
          const totalSizeMB = (imageStats.totalSize / 1024 / 1024).toFixed(2);
          console.log(
            `[Routerino Image] ✓ Processed ${imageStats.processed} <Image> components (${totalSizeMB}MB total)`
          );

          if (imageStats.generated > 0) {
            console.log(
              `[Routerino Image] ✓ Generated ${imageStats.generated} responsive image sets`
            );
          }

          if (config.verbose && imageStats.skipped > 0) {
            console.log(
              `[Routerino Image] Skipped ${imageStats.skipped} images (external URLs, SVGs, or size limits)`
            );
          }

          if (imageStats.errors.length > 0) {
            console.warn(
              `[Routerino Image] ${imageStats.errors.length} images had processing errors`
            );
            if (config.verbose) {
              imageStats.errors.forEach(({ src, error }) => {
                console.warn(`[Routerino Image]   - ${src}: ${error}`);
              });
            }
          }
        }
      } catch (error) {
        console.error(
          "[Routerino Forge] Failed to generate static pages:",
          error.message
        );
        if (config.verbose) {
          console.error("[Routerino Forge] Stack trace:", error.stack);
        }
        // Don't throw to allow build to continue
      } finally {
        // Clean up SSG cache directory
        const ssgOutDir = path.resolve(viteConfig.root, config.ssgCacheDir);
        try {
          await fs.rm(ssgOutDir, { recursive: true, force: true });
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
  const allImageStats = {
    processed: 0,
    skipped: 0,
    totalSize: 0,
    placeholderSize: 0,
    errors: [],
  };

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
      const renderResult = render(route.path, config.baseUrl);

      let renderedHTML = "";
      if (renderResult.notFound) {
        console.log(`[Routerino Forge] Route not found: ${route.path}`);
        renderedHTML = `<div data-route="${route.path}" data-not-found="true"><!-- Route not found --></div>`;
      } else if (!renderResult.html || renderResult.html.trim() === "") {
        console.warn(
          `[Routerino Forge] Empty HTML for ${route.path} - check that route.element is a valid React element`
        );
        renderedHTML = `<div data-route="${route.path}" data-empty="true"><!-- Empty render result --></div>`;
      } else {
        renderedHTML = renderResult.html;
        console.log(`[Routerino Forge] ✓ Rendered ${route.path}`);

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
        });
      } else {
        // For all other routes, generate both formats
        const cleanPath = route.path.replace(/\/$/, ""); // Remove trailing slash if present

        // Determine which version is canonical based on useTrailingSlash
        filesToGenerate.push({
          path: path.join(outputDir, `${cleanPath}.html`),
          urlPath: cleanPath,
        });

        filesToGenerate.push({
          path: path.join(outputDir, cleanPath, "index.html"),
          urlPath: `${cleanPath}/`,
        });
      }

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
        const rootDivRegex =
          /(<div[^>]*\sid=["']root["'][^>]*>)(.*?)(<\/div>)/is;
        if (rootDivRegex.test(html)) {
          html = html.replace(rootDivRegex, `$1${renderedHTML}$3`);
        } else {
          console.warn(
            `[Routerino Forge] Could not find <div id="root"> for ${route.path}`
          );
        }

        // Process <Image> components in HTML
        const { html: processedHTML, stats } = await processRouterInoImages(
          html,
          outputDir,
          config
        );
        html = processedHTML;

        // Accumulate stats
        if (stats) {
          allImageStats.processed += stats.processed;
          allImageStats.skipped += stats.skipped;
          allImageStats.totalSize += stats.totalSize;
          allImageStats.placeholderSize += stats.placeholderSize;
          allImageStats.errors.push(...stats.errors);
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
      console.error(
        `[Routerino Forge] Failed to generate ${route.path}:`,
        error
      );
    }
  }

  return allImageStats;
}

// Helper to safely handle meta tag content
// If content has double quotes, use single quotes for the attribute
// If content has single quotes, use double quotes for the attribute
// If it has both, replace double quotes with smart quotes
function formatMetaAttribute(attrName, content) {
  if (!content) return "";

  const hasDoubleQuotes = content.includes('"');
  const hasSingleQuotes = content.includes("'");

  if (hasDoubleQuotes && hasSingleQuotes) {
    // Replace straight quotes with smart quotes which look better and don't break HTML
    const safeContent = content.replace(/"/g, '"'); // Replace " with smart quote
    return `${attrName}="${safeContent}"`;
  } else if (hasDoubleQuotes) {
    // Use single quotes for attribute
    return `${attrName}='${content}'`;
  } else {
    // Use double quotes (default)
    return `${attrName}="${content}"`;
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
  tags.push(`<link rel="canonical" href="${canonicalUrl}">`);

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
  tags.push(`<meta property="og:url" content="${canonicalUrl}">`);

  if (route.imageUrl) {
    const imageUrl = config.baseUrl
      ? config.baseUrl + route.imageUrl
      : route.imageUrl;
    tags.push(`<meta property="og:image" content="${imageUrl}">`);
  }

  // Twitter card
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);

  // Add custom tags from route.tags array
  if (route.tags && Array.isArray(route.tags)) {
    route.tags.forEach((tag) => {
      const tagName = tag.tag || "meta";
      const attrs = Object.entries(tag)
        .filter(([key]) => key !== "tag" && key !== "soft")
        .map(([key, value]) => formatMetaAttribute(key, value))
        .join(" ");

      if (attrs) {
        tags.push(`<${tagName} ${attrs}>`);
      }
    });
  }

  return tags.join("\n");
}

// Generate 404.html page
async function generate404Page({ template, outputDir, config, render }) {
  console.log("[Routerino Forge] ✓ Generating 404.html");

  try {
    // Render a non-existent route to get the notFoundTemplate content
    const renderResult = render(
      "/this-route-does-not-exist-404",
      config.baseUrl
    );

    // The render function will return the notFoundTemplate HTML (already includes App wrapper if App exists)
    const renderedHTML = renderResult.html || "404 - Page Not Found";

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
      html = html.replace(rootDivRegex, `$1${renderedHTML}$3`);
    } else {
      console.warn(
        '[Routerino Forge] Could not find <div id="root"> for 404.html'
      );
    }

    // Process <Image> components in 404 page
    const { html: processedHTML } = await processRouterInoImages(
      html,
      outputDir,
      config
    );
    html = processedHTML;

    // Write 404.html
    const filePath = path.join(outputDir, "404.html");
    await fs.writeFile(filePath, html);

    if (config.verbose) {
      console.log(`[Routerino Forge] Generated: ${filePath}`);
    }
  } catch (error) {
    console.error("[Routerino Forge] Failed to generate 404.html:", error);
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

  console.log(
    `[Routerino Forge] ✓ Generated sitemap.xml with ${staticRoutes.length} URLs`
  );

  if (config.verbose) {
    console.log(`[Routerino Forge] Output: ${sitemapPath}`);
  }

  // Generate robots.txt if it doesn't exist
  const robotsPath = path.join(config.outputDir, "robots.txt");
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
