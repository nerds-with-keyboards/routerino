import fs from "fs";
import path from "path";

/**
 * Vite plugin for generating static HTML files from Routerino routes
 *
 * @param {Object} options
 * @param {string} options.routesFile - Path to routes file
 * @param {string} options.baseUrl - Base URL for meta tags
 * @param {Object} options.globalMeta - Global meta tags to apply to all pages
 * @returns {Object} Vite plugin
 */
export function routerinoStatic(options = {}) {
  const {
    routesFile = "./src/routes.js",
    baseUrl = "",
    globalMeta = {},
  } = options;

  let routes = [];
  let viteConfig;

  return {
    name: "routerino-static-plugin",

    configResolved(config) {
      viteConfig = config;
    },

    async buildStart() {
      // Load routes
      try {
        const routesPath = path.resolve(viteConfig.root, routesFile);
        // Add timestamp to force fresh import
        const routesModule = await import(`${routesPath}?t=${Date.now()}`);
        routes = routesModule.default || routesModule.routes || [];

        console.log(`📍 Loaded ${routes.length} routes from ${routesFile}`);
      } catch (error) {
        console.error(`❌ Failed to load routes from ${routesFile}:`, error);
        routes = [];
      }
    },

    // We'll handle all HTML generation in closeBundle instead
    // to avoid double-processing

    // Generate HTML files for each route
    async closeBundle() {
      if (viteConfig.command !== "build") return;

      const outDir = viteConfig.build.outDir;
      const indexPath = path.join(outDir, "index.html");

      if (!fs.existsSync(indexPath)) {
        console.warn("⚠️  No index.html found in output directory");
        return;
      }

      const templateHtml = fs.readFileSync(indexPath, "utf-8");
      let generatedCount = 0;

      for (const route of routes) {
        // Skip dynamic routes
        if (route.path.includes(":")) {
          console.log(`⏭️  Skipping dynamic route: ${route.path}`);
          continue;
        }

        // Generate HTML for this route
        let html = templateHtml;
        html = applyMetaTags(html, route, baseUrl, globalMeta);
        html = html.replace(
          /<div\s+id="root">/,
          `<div id="root" data-route="${escapeHtml(route.path)}">`
        );

        // Determine output path
        const routePath = route.path === "/" ? "/index" : route.path;
        const htmlPath = path.join(outDir, `${routePath}.html`);
        const htmlDir = path.dirname(htmlPath);

        if (!fs.existsSync(htmlDir)) {
          fs.mkdirSync(htmlDir, { recursive: true });
        }

        fs.writeFileSync(htmlPath, html);
        console.log(`✅ Generated: ${htmlPath}`);
        generatedCount++;
      }

      console.log(
        `\n🎉 Generated ${generatedCount} additional static HTML files`
      );
    },
  };
}

function applyMetaTags(html, route, baseUrl, globalMeta) {
  // Update title
  const title = route.title || globalMeta.title || "";
  if (title) {
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHtml(title)}</title>`
    );
  }

  // Helper function to update or add a tag in HTML string
  function updateHeadTagInHtml(html, { tag = "meta", ...attrs }) {
    const attrKeys = Object.keys(attrs);
    if (attrKeys.length < 1) return html;

    // Find existing tag
    let tagRegex;
    for (let i = 0; i < attrKeys.length; i++) {
      if (attrKeys[i] !== "content") {
        // Create regex to find existing tag with this attribute
        const escapedValue = attrs[attrKeys[i]].replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        tagRegex = new RegExp(
          `<${tag}[^>]*${attrKeys[i]}=["']${escapedValue}["'][^>]*>`,
          "i"
        );
        if (tagRegex.test(html)) {
          // Update existing tag
          const newTag = `<${tag} ${attrKeys
            .map((key) => `${key}="${escapeHtml(attrs[key])}"`)
            .join(" ")}>`;
          html = html.replace(tagRegex, newTag);
          return html;
        }
      }
    }

    // If no existing tag found, add new one before </head>
    const newTag = `<${tag} ${attrKeys
      .map((key) => `${key}="${escapeHtml(attrs[key])}"`)
      .join(" ")}>`;
    html = html.replace("</head>", `  ${newTag}\n</head>`);
    return html;
  }

  // Apply meta tags using the updateHeadTagInHtml function
  // Description
  const description = route.description || globalMeta.description;
  if (description) {
    html = updateHeadTagInHtml(html, {
      name: "description",
      content: description,
    });
    html = updateHeadTagInHtml(html, {
      property: "og:description",
      content: description,
    });
  }

  // OG Title
  if (title) {
    html = updateHeadTagInHtml(html, { property: "og:title", content: title });
  }

  // OG Type
  html = updateHeadTagInHtml(html, { property: "og:type", content: "website" });

  // OG URL and canonical
  if (baseUrl) {
    html = updateHeadTagInHtml(html, {
      property: "og:url",
      content: `${baseUrl}${route.path}`,
    });
    html = updateHeadTagInHtml(html, {
      tag: "link",
      rel: "canonical",
      href: `${baseUrl}${route.path}`,
    });
  }

  // OG Image
  const imageUrl = route.imageUrl || globalMeta.imageUrl;
  if (imageUrl) {
    html = updateHeadTagInHtml(html, {
      property: "og:image",
      content: imageUrl,
    });
  }

  // Site name
  if (globalMeta.siteName) {
    html = updateHeadTagInHtml(html, {
      property: "og:site_name",
      content: globalMeta.siteName,
    });
  }

  // Custom tags from route
  if (route.tags) {
    route.tags.forEach((tag) => {
      html = updateHeadTagInHtml(html, tag);
    });
  }

  // Custom tags from global
  if (globalMeta.tags) {
    globalMeta.tags.forEach((tag) => {
      html = updateHeadTagInHtml(html, tag);
    });
  }

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
