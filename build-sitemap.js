#!/usr/bin/env node
import fs from "fs";

try {
  // parse the args
  const { routeFilePath, hostname, outputDir } = process.argv
    .filter((arg) => arg.includes("="))
    .reduce((acc, cur) => {
      const split = cur.split("=");
      acc[split[0]] = split[1];
      return acc;
    }, {});

  // input checks
  if (!(routeFilePath && hostname && outputDir)) {
    console.error(
      `Error: missing some args! Cannot create sitemap.\nRequired args:\n - routeFilePath: ${routeFilePath}\n - hostname: ${hostname}\n - outputDir: ${outputDir}`
    );
    process.exit(1);
  }

  function getPathsFromFile(routeFilePath) {
    // get file contents as a string, stripping comments
    const routeFileString =
      fs
        .readFileSync(routeFilePath)
        ?.toString()
        ?.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "") ?? "";

    // match the routes array regex breakdown
    // 1. match a routes array such as `Routes = ` or `routes: `, or
    // 2. match `export default `
    // 3. match group `[<any characters>]`
    //
    // examples:
    //  - Routes = [...]
    //  - routes = [...]
    //  - <Router routes={[...]} />
    //  - <Router {...{ routes: [...] }} />
    //  - export default [...]
    const arrayMatch = routeFileString.match(
      /(?:[rR]outes\s*[=:]\s*\{?\s*|\bexport\s+default\s+)(\[[\s\S]*\])/
    );
    const routeString = arrayMatch[0] ?? "";

    // match the paths
    const matches = routeString.match(/path:\s*(["'`]).*?\1/g);
    const paths =
      matches.length > 0
        ? matches.map((pathString) =>
            pathString.match(/(["'`]).*?\1/)[0].slice(1, -1)
          )
        : [];

    return paths;
  }

  /**
   * Creates a sitemap XML string.
   * @param {Object} options - The options for creating the sitemap.
   * @param {string} options.hostname - The base URL of the site.
   * @param {string[]} options.paths - An array of paths to include in the sitemap.
   * @returns {string} The generated sitemap XML string.
   *
   * @example
   * createSitemap({
   *   hostname: "https://example.com",
   *   paths: ["/", "/about", "/blog"]
   * });
   */
  function createSitemap({ hostname, paths }) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .filter(!path.split("/").some((segment) => segment.startsWith(":")))
  .map((path) => `  <url><loc>${hostname}${path}</loc></url>`)
  .join("\n")}
</urlset>`;
  }

  const paths = getPathsFromFile(routeFilePath);
  const sitemap = createSitemap({ hostname, paths });

  if (sitemap) {
    fs.writeFileSync(`${outputDir}/sitemap.xml`, sitemap);
    console.log(
      `✅ sitemap.xml with ${paths.length} URLs written to ${outputDir}`
    );
  }

  // next we want to check if the output dir does not contain a robots.txt file
  if (!fs.existsSync(`${outputDir}/robots.txt`)) {
    fs.writeFileSync(
      `${outputDir}/robots.txt`,
      `User-agent: *\nSitemap: ${hostname}/sitemap.xml`
    );
    console.log(`✅ robots.txt written to ${outputDir}`);
  } else {
    console.log(`✅ robots.txt already exists in ${outputDir} (skipped)`);
  }
} catch (err) {
  console.error(`❌ sitemap.xml or robots.txt failed to build.`);
  console.error(err);
}
