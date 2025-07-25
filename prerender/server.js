#!/usr/bin/env node

import prerender from "prerender";

// Default search engine crawlers (these typically don't need JavaScript)
const DEFAULT_SEARCH_ENGINE_BOTS =
  "googlebot|bingbot|yandex|yandexbot|baiduspider|duckduckbot|slurp|ia_archiver|applebot|ahrefsbot|seznambot|dotbot|msnbot|semrushbot|blexbot|sogou|exabot|facebot";

// Note: We intentionally keep JS for social media bots like:
// - facebookexternalhit, twitterbot, linkedinbot (may need JS for rich previews)
// - whatsapp, discordbot, telegrambot, slackbot (may execute JS for link previews)
// - pinterest, tumblr (may need dynamic content)
// - pingdom, uptimerobot (monitoring tools that might check JS functionality)

// Configuration from environment variables
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0",
  allowedDomains: process.env.ALLOWED_DOMAINS
    ? process.env.ALLOWED_DOMAINS.split(",")
    : null,
  prerenderUserAgents: process.env.PRERENDER_USER_AGENTS || "all", // Who to prerender for
  stripJsUserAgents:
    process.env.STRIP_JS_USER_AGENTS || DEFAULT_SEARCH_ENGINE_BOTS, // Who to strip JS for
  cacheMaxAge: parseInt(process.env.CACHE_MAXAGE || "3600"), // 1 hour default
  waitAfterLastRequest: parseInt(process.env.WAIT_AFTER_LAST_REQUEST || "500"),
  followRedirects: process.env.FOLLOW_REDIRECTS !== "false",
  chromeFlags: [
    "--no-sandbox",
    "--headless",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    "--hide-scrollbars",
    "--disable-dev-shm-usage",
  ],
  logRequests: process.env.LOG_REQUESTS !== "false",
};

console.log("Starting Routerino Prerender Server with config:", {
  ...config,
  allowedDomains: config.allowedDomains || "all domains allowed",
  prerenderUserAgents:
    config.prerenderUserAgents === "all"
      ? "all user agents"
      : "specific pattern",
  stripJsUserAgents:
    config.stripJsUserAgents === "none"
      ? "keep JS for all"
      : config.stripJsUserAgents === DEFAULT_SEARCH_ENGINE_BOTS
        ? "strip JS for search engines only"
        : "strip JS for custom pattern",
});

// Create the prerender server
const server = prerender({
  port: config.port,
  host: config.host,
  chromeFlags: config.chromeFlags,
  waitAfterLastRequest: config.waitAfterLastRequest,
  followRedirects: config.followRedirects,
  chromeLocation: process.env.PUPPETEER_EXECUTABLE_PATH,
});

// Use plugins
server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
// Don't use the global removeScriptTags - we'll handle it conditionally
server.use(prerender.httpHeaders());

// Add memory cache
if (config.cacheMaxAge > 0) {
  // TODO: Fix memory cache import for ES modules
  console.log(`Memory cache disabled temporarily - ES module import issue`);
}

// Prerender user agent checking middleware
if (config.prerenderUserAgents !== "all") {
  server.use({
    beforePhantomRequest: (req, res, next) => {
      // Check user agent
      const userAgent = req.headers["user-agent"] || "";
      const shouldPrerender = new RegExp(config.prerenderUserAgents, "i").test(
        userAgent
      );

      if (!shouldPrerender) {
        // Not a bot we prerender for
        res.statusCode = 404;
        res.end("Not a prerender request");
        return;
      }

      next();
    },
  });
  console.log("Prerender filtering enabled for specific user agents");
}

// Conditional script tag removal based on user agent
if (config.stripJsUserAgents !== "none") {
  server.use({
    pageLoaded: (req, _res, next) => {
      const userAgent = req.headers["user-agent"] || "";
      const shouldStripJs = new RegExp(config.stripJsUserAgents, "i").test(
        userAgent
      );

      if (shouldStripJs && req.prerender.content) {
        // Remove script tags for this user agent
        req.prerender.content = req.prerender.content
          .toString()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<link[^>]*rel="preload"[^>]*as="script"[^>]*>/gi, "")
          .replace(/<link[^>]*as="script"[^>]*rel="preload"[^>]*>/gi, "");

        if (config.logRequests) {
          console.log(
            `[${new Date().toISOString()}] Stripped JS for user agent: ${userAgent}`
          );
        }
      }

      next();
    },
  });
  console.log(
    "Script removal enabled for:",
    config.stripJsUserAgents === DEFAULT_SEARCH_ENGINE_BOTS
      ? "search engines only"
      : "custom pattern"
  );
}

// Domain whitelist middleware
if (config.allowedDomains && config.allowedDomains.length > 0) {
  server.use({
    requestReceived: (req, res, next) => {
      const parsed = new URL(req.prerender.url);
      const hostname = parsed.hostname;

      // Check if domain is allowed
      const isAllowed = config.allowedDomains.some((domain) => {
        // Support wildcards like *.example.com
        if (domain.startsWith("*.")) {
          const baseDomain = domain.slice(2);
          return hostname === baseDomain || hostname.endsWith("." + baseDomain);
        }
        return hostname === domain;
      });

      if (!isAllowed) {
        console.log(`Blocked request for unauthorized domain: ${hostname}`);
        res.statusCode = 403;
        res.end("Domain not authorized");
        return;
      }

      next();
    },
  });
  console.log("Domain whitelist enabled:", config.allowedDomains);
}

// Request logging
if (config.logRequests) {
  server.use({
    requestReceived: (req, _res, next) => {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.prerender.url}`
      );
      next();
    },
    pageLoaded: (req, _res, next) => {
      if (req.prerender.statusCode) {
        console.log(
          `[${new Date().toISOString()}] Rendered ${req.prerender.url} - Status: ${req.prerender.statusCode}`
        );
      }
      next();
    },
  });
}

// Custom plugin to handle Routerino-specific meta tags
server.use({
  pageLoaded: (req, _res, next) => {
    // Ensure Routerino meta tags are properly set
    if (req.prerender.content) {
      // The page should already have the correct meta tags from Routerino
      // This is just a hook point if we need to do any post-processing
    }
    next();
  },
});

// Health check endpoint
server.use({
  requestReceived: (req, res, next) => {
    if (req.url === "/health" || req.url === "/_health") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          status: "healthy",
          timestamp: new Date().toISOString(),
          config: {
            allowedDomains: config.allowedDomains || "all",
            cacheEnabled: config.cacheMaxAge > 0,
            cacheMaxAge: config.cacheMaxAge,
          },
        })
      );
      return;
    }
    next();
  },
});

// Start the server
server.start();

console.log(
  `Prerender server listening on http://${config.host}:${config.port}`
);
console.log("Health check available at: /health");

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});
