import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Skip integration tests in CI or if SKIP_INTEGRATION is set
// Integration tests require starting actual servers which may not be practical in all environments
const skipIntegration =
  process.env.CI === "true" || process.env.SKIP_INTEGRATION !== "false";

describe.skipIf(skipIntegration)("Prerender Server Integration", () => {
  let prerenderProcess;
  let testServerProcess;
  const PRERENDER_PORT = 3100;
  const TEST_APP_PORT = 3101;
  const PRERENDER_URL = `http://localhost:${PRERENDER_PORT}`;
  const TEST_APP_URL = `http://localhost:${TEST_APP_PORT}`;

  beforeAll(async () => {
    // Start a simple test server with Routerino
    testServerProcess = spawn("node", [
      path.join(__dirname, "fixtures", "test-server.js"),
      TEST_APP_PORT,
    ]);

    // Start prerender server
    prerenderProcess = spawn(
      "node",
      [path.join(__dirname, "..", "prerender", "server.js")],
      {
        env: {
          ...process.env,
          PORT: PRERENDER_PORT,
          PRERENDER_USER_AGENTS: "all",
          STRIP_JS_USER_AGENTS: "googlebot|testbot",
          LOG_REQUESTS: "false",
        },
      }
    );

    // Wait for servers to start
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, 10000);

  afterAll(async () => {
    // Clean up processes
    if (prerenderProcess) {
      prerenderProcess.kill();
    }
    if (testServerProcess) {
      testServerProcess.kill();
    }

    // Wait for cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe("Health Check", () => {
    it("should respond to health check endpoint", async () => {
      const response = await fetch(`${PRERENDER_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("healthy");
      expect(data.config).toBeDefined();
    });
  });

  describe("Prerendering", () => {
    it("should prerender a page with proper meta tags", async () => {
      const response = await fetch(`${PRERENDER_URL}/${TEST_APP_URL}/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        },
      });

      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain("<title>Home | Test Site</title>");
      expect(html).toContain('content="Welcome to the test site"');
      expect(html).toContain('property="og:title"');

      // Should strip JS for Googlebot
      expect(html).not.toContain("<script");
    });

    it("should preserve JavaScript for non-search bots", async () => {
      const response = await fetch(`${PRERENDER_URL}/${TEST_APP_URL}/`, {
        headers: {
          "User-Agent": "facebookexternalhit/1.1",
        },
      });

      const html = await response.text();

      expect(response.status).toBe(200);
      // Should keep JS for Facebook
      expect(html).toContain("<script");
    });

    it("should handle 404 pages correctly", async () => {
      const response = await fetch(
        `${PRERENDER_URL}/${TEST_APP_URL}/non-existent`,
        {
          headers: {
            "User-Agent": "Googlebot",
          },
        }
      );

      const html = await response.text();

      expect(response.status).toBe(404);
      expect(html).toContain("404");
      expect(html).toContain("prerender-status-code");
    });

    it("should handle redirects", async () => {
      const response = await fetch(
        `${PRERENDER_URL}/${TEST_APP_URL}/redirect`,
        {
          headers: {
            "User-Agent": "Googlebot",
          },
          redirect: "manual",
        }
      );

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        `${TEST_APP_URL}/redirected`
      );
    });
  });

  describe("User Agent Filtering", () => {
    it("should prerender for all agents when configured", async () => {
      const response = await fetch(`${PRERENDER_URL}/${TEST_APP_URL}/`, {
        headers: {
          "User-Agent": "Regular Browser Mozilla/5.0",
        },
      });

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("<title>");
    });

    it("should strip JS only for configured bots", async () => {
      // Test custom bot that should have JS stripped
      const response1 = await fetch(`${PRERENDER_URL}/${TEST_APP_URL}/`, {
        headers: {
          "User-Agent": "testbot/1.0",
        },
      });

      const html1 = await response1.text();
      expect(html1).not.toContain("<script");

      // Test bot that should keep JS
      const response2 = await fetch(`${PRERENDER_URL}/${TEST_APP_URL}/`, {
        headers: {
          "User-Agent": "discordbot/1.0",
        },
      });

      const html2 = await response2.text();
      expect(html2).toContain("<script");
    });
  });

  describe("Caching", () => {
    it("should cache prerendered pages", async () => {
      // First request
      const start1 = Date.now();
      await fetch(`${PRERENDER_URL}/${TEST_APP_URL}/cached-test`, {
        headers: { "User-Agent": "Googlebot" },
      });
      const time1 = Date.now() - start1;

      // Second request (should be cached)
      const start2 = Date.now();
      const response = await fetch(
        `${PRERENDER_URL}/${TEST_APP_URL}/cached-test`,
        {
          headers: { "User-Agent": "Googlebot" },
        }
      );
      const time2 = Date.now() - start2;

      expect(response.status).toBe(200);
      // Cached response should be much faster
      expect(time2).toBeLessThan(time1 / 2);
    });
  });
});
