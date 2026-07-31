import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";

vi.mock("vite", () => ({ build: vi.fn() }));

import { build } from "vite";
import { routerinoForge } from "../routerino-forge.js";

const template = `<!doctype html>
<html lang="en">
  <head><title>Base &amp; Site</title></head>
  <body><div id="root"></div></body>
</html>`;

const route = (routePath, metadata = {}) => ({
  path: routePath,
  element: {},
  ...metadata,
});

function createSsgModule(routes, renderBody) {
  return `
export const routes = ${JSON.stringify(routes)};

export function render(url) {
  const route = routes.find((candidate) => candidate.path === url);
  ${
    renderBody ||
    `if (!route) return { html: "<main>Not Found</main>", notFound: true };
  return { ...route, html: "<main>" + url + "</main>" };`
  }
}
`;
}

describe.sequential("Routerino Forge safety and failure handling", () => {
  let projectRoot;
  let moduleSource;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "routerino-forge-test-")
    );
    await fs.mkdir(path.join(projectRoot, "dist"), { recursive: true });
    await fs.writeFile(path.join(projectRoot, "dist", "index.html"), template);

    moduleSource = createSsgModule([route("/")]);
    build.mockReset();
    build.mockImplementation(async ({ build: buildConfig }) => {
      await fs.mkdir(buildConfig.outDir, { recursive: true });
      await fs.writeFile(
        path.join(buildConfig.outDir, "entry-server.mjs"),
        moduleSource
      );
    });

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(projectRoot, { recursive: true, force: true });
  });

  async function runForge(options = {}) {
    const plugin = routerinoForge({
      baseUrl: "https://example.com",
      generateSitemap: false,
      ...options,
    });

    plugin.configResolved({
      command: "build",
      root: projectRoot,
      configFile: false,
      build: { outDir: "dist", ssr: false },
    });

    await plugin.closeBundle();
  }

  it.each([
    undefined,
    "",
    "example.com",
    "ftp://example.com",
    "https://example.com/",
    "https://example.com/path",
    "https://example.com?preview=1",
    "https://example.com#preview",
    "https://user@example.com",
    "https://example.com\n.evil",
  ])("rejects a missing or invalid baseUrl: %s", async (baseUrl) => {
    await expect(runForge({ baseUrl })).rejects.toThrow(/baseUrl/i);
    expect(build).not.toHaveBeenCalled();
  });

  it("rejects an SSG cache parent outside the project", async () => {
    await expect(runForge({ ssgCacheDir: "../outside-cache" })).rejects.toThrow(
      /outside outputDir/i
    );
    await expect(fs.access(projectRoot)).resolves.toBeUndefined();
    expect(build).not.toHaveBeenCalled();
  });

  it.each([".", "dist", "src", ".git"])(
    "only cleans its unique build leaf inside cache parent on failure: %s",
    async (ssgCacheDir) => {
      const cacheRoot = path.resolve(projectRoot, ssgCacheDir);
      const sentinel = path.join(cacheRoot, "keep-me.txt");
      await fs.mkdir(cacheRoot, { recursive: true });
      await fs.writeFile(sentinel, "keep");
      build.mockRejectedValueOnce(new Error("intentional SSG build failure"));

      await expect(runForge({ ssgCacheDir })).rejects.toThrow(
        "intentional SSG build failure"
      );

      await expect(fs.readFile(sentinel, "utf8")).resolves.toBe("keep");
      const entries = await fs.readdir(cacheRoot);
      expect(
        entries.some((entry) => entry.startsWith("routerino-forge-build-"))
      ).toBe(false);
    }
  );

  it("escapes metadata attributes and resolves social image URLs", async () => {
    const unsafeDescription = `Tom & "Jerry" <friends> 'always'`;
    moduleSource = createSsgModule([
      route("/", {
        title: `Rock & "Roll" <Home>`,
        description: unsafeDescription,
        imageUrl: "https://cdn.example.com/card.png?x=1&y=2",
        tags: [{ name: "test-value", content: unsafeDescription }],
      }),
      route("/about/", {
        title: "About",
        imageUrl: "/images/about.png?x=1&y=2",
      }),
      route("/relative/", {
        title: "Relative",
        imageUrl: "images/relative.png",
      }),
    ]);

    await runForge();

    const homeHtml = await fs.readFile(
      path.join(projectRoot, "dist", "index.html"),
      "utf8"
    );
    const aboutHtml = await fs.readFile(
      path.join(projectRoot, "dist", "about", "index.html"),
      "utf8"
    );
    const relativeHtml = await fs.readFile(
      path.join(projectRoot, "dist", "relative", "index.html"),
      "utf8"
    );

    expect(homeHtml).toContain(
      "<title>Rock &amp; &quot;Roll&quot; &lt;Home&gt; | Base &amp; Site</title>"
    );
    expect(homeHtml).toContain(
      'content="Tom &amp; &quot;Jerry&quot; &lt;friends&gt; &#39;always&#39;"'
    );
    expect(homeHtml).toContain(
      'content="https://cdn.example.com/card.png?x=1&amp;y=2"'
    );
    expect(homeHtml).not.toContain(`content="${unsafeDescription}"`);
    expect(aboutHtml).toContain(
      'content="https://example.com/images/about.png?x=1&amp;y=2"'
    );
    expect(aboutHtml).toContain(
      '<link rel="canonical" href="https://example.com/about/">'
    );
    expect(relativeHtml).toContain(
      'content="https://example.com/images/relative.png"'
    );
  });

  it("uses a custom built template relative to outputDir", async () => {
    await fs.writeFile(
      path.join(projectRoot, "dist", "custom.html"),
      template.replace("Base &amp; Site", "Custom Template")
    );

    await runForge({ template: "custom.html" });

    const homeHtml = await fs.readFile(
      path.join(projectRoot, "dist", "index.html"),
      "utf8"
    );
    expect(homeHtml).toContain("<title>Custom Template</title>");
  });

  it.each(["traversal", "absolute"])(
    "rejects an unsafe or absolute built template path: %s",
    async (kind) => {
      const templatePath =
        kind === "absolute"
          ? path.join(projectRoot, "dist", "index.html")
          : "../secret.html";
      await expect(runForge({ template: templatePath })).rejects.toThrow(
        /template must be.*relative|outside outputDir/i
      );
    }
  );

  it("preserves dollar replacement tokens in rendered route and 404 HTML", async () => {
    const renderedHtml = "<main>$1 $2 $& $` $'</main>";
    moduleSource = createSsgModule(
      [route("/")],
      `return { html: ${JSON.stringify(renderedHtml)}, notFound: !route };`
    );

    await runForge();

    const homeHtml = await fs.readFile(
      path.join(projectRoot, "dist", "index.html"),
      "utf8"
    );
    const notFoundHtml = await fs.readFile(
      path.join(projectRoot, "dist", "404.html"),
      "utf8"
    );

    expect(homeHtml).toContain(renderedHtml);
    expect(notFoundHtml).toContain(renderedHtml);
  });

  it.each([
    "/../escaped/",
    "/safe/../../escaped/",
    "/safe\\..\\escaped/",
    "/%2e%2e/escaped/",
    "/safe/%2fescaped/",
  ])(
    "rejects an unsafe route before deriving output: %s",
    async (routePath) => {
      moduleSource = createSsgModule([route(routePath)]);

      await expect(runForge()).rejects.toThrow(/Unsafe route path/i);
      await expect(
        fs.access(path.join(projectRoot, "escaped.html"))
      ).rejects.toThrow();
    }
  );

  it.each([
    [[route("/"), route("/index/")]],
    [[route("/404/")]],
    [[route("/a/"), route("/a/index/")]],
    [[route("/a"), route("/a/")]],
    [[route("/About/"), route("/about/")]],
  ])("rejects static routes with colliding output files", async (routes) => {
    moduleSource = createSsgModule(routes);

    await expect(runForge()).rejects.toThrow(/Static output collision/i);
  });

  it.each([undefined, null, false, true, "", 0])(
    "fails before rendering a static route with an invalid element: %s",
    async (element) => {
      moduleSource = createSsgModule([
        { path: "/", element, title: "Invalid route" },
      ]);

      await expect(runForge()).rejects.toThrow(
        /Static routes must provide a renderable JSX element.*\//
      );
    }
  );

  it("fails when the route export is empty", async () => {
    moduleSource = createSsgModule([]);

    await expect(runForge()).rejects.toThrow(/No routes found/i);
  });

  it("fails the build when the SSG bundle fails", async () => {
    build.mockRejectedValueOnce(new Error("SSR bundle exploded"));

    await expect(runForge()).rejects.toThrow("SSR bundle exploded");
  });

  it("fails the build when the SSG bundle has no render export", async () => {
    moduleSource = `export const routes = ${JSON.stringify([route("/")])};`;

    await expect(runForge()).rejects.toThrow(/must export a render function/);
  });

  it("fails the build when a route render throws", async () => {
    moduleSource = createSsgModule(
      [route("/")],
      'throw new Error("route render exploded");'
    );

    await expect(runForge()).rejects.toThrow(
      /Failed to generate route.*route render exploded/
    );
  });

  it.each([
    ["no result", "return undefined;", /did not return a result object/],
    ["empty HTML", 'return { html: "" };', /non-empty HTML string/],
    [
      "not-found result",
      'return { html: "<main>Missing</main>", notFound: true };',
      /configured route as not found/,
    ],
  ])("fails the build for a route with %s", async (_label, body, message) => {
    moduleSource = createSsgModule([route("/")], body);

    await expect(runForge()).rejects.toThrow(message);
  });

  it("fails the build when the 404 render has no output", async () => {
    moduleSource = createSsgModule(
      [route("/")],
      `if (!route) return { html: "" };
  return { ...route, html: "<main>Home</main>" };`
    );

    await expect(runForge()).rejects.toThrow(
      /Failed to generate 404\.html.*non-empty HTML string/
    );
  });

  it("fails the build when the 404 probe is not reported as missing", async () => {
    moduleSource = createSsgModule(
      [route("/")],
      `if (!route) return { html: "<main>Wrong page</main>", notFound: false };
  return { ...route, html: "<main>Home</main>" };`
    );

    await expect(runForge()).rejects.toThrow(
      /Failed to generate 404\.html.*not report.*not found/
    );
  });

  it("chooses a 404 probe that cannot match a configured dynamic route", async () => {
    moduleSource = createSsgModule(
      [route("/"), route("/:slug")],
      `if (url === "/") return { html: "<main>Home</main>", notFound: false };
  const segmentCount = url.split("/").filter(Boolean).length;
  if (segmentCount === 1) {
    return { html: "<main>Dynamic route</main>", notFound: true };
  }
  return { html: "<main>Not Found</main>", notFound: true };`
    );

    await runForge();

    const notFoundHtml = await fs.readFile(
      path.join(projectRoot, "dist", "404.html"),
      "utf8"
    );
    expect(notFoundHtml).toContain("<main>Not Found</main>");
    expect(notFoundHtml).not.toContain("<main>Dynamic route</main>");
  });

  it("fails the build when an expected HTML file is missing", async () => {
    const expectedIndexPath = path.join(projectRoot, "dist", "index.html");
    const readFileStats = fs.stat.bind(fs);
    vi.spyOn(fs, "stat").mockImplementation(async (filePath, ...args) => {
      if (filePath === expectedIndexPath) {
        throw Object.assign(new Error("missing test output"), {
          code: "ENOENT",
        });
      }

      return readFileStats(filePath, ...args);
    });

    await expect(runForge()).rejects.toThrow(
      /Expected HTML output was not generated.*index\.html/
    );
  });
});
