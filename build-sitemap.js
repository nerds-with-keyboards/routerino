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

    // match the routes array
    //
    // 1: routes or Routes
    // 2: any spacing
    // 3: = or :
    // 4: any spacing
    // 5: optional open brace
    // 6: any spacing
    // 7: group capture start - open bracket
    // 8: any characters
    // 9: group capture end - close bracket
    //
    // examples:
    //  - Routes = [...]
    //  - routes = [...]
    //  - <Router routes={[...]} />
    //  - <Router {...{ routes: [...] }} />
    const arrayMatch = routeFileString.match(
      /[rR]outes\s*[=:]\s*\{?\s*(\[[\s\S]*\])/
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

  function createSitemap({ hostname, paths }) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${hostname}${path}</loc></url>`).join("\n")}
</urlset>`;
  }

  const paths = getPathsFromFile(routeFilePath).filter(
    (path) => !path.startsWith(":")
  );
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
  }
} catch (err) {
  console.error(`❌ sitemap.xml or robots.txt failed to build.`);
  console.error(err);
}
