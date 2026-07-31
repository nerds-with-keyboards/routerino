import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const REQUIRED_PACKAGE_FILES = [
  "LICENSE",
  "README.md",
  "dist/routerino.js",
  "dist/routerino.umd.cjs",
  "package.json",
  "routerino-forge.js",
  "types/routerino-forge.d.ts",
  "types/routerino.d.ts",
];
const FORBIDDEN_PACKAGE_PREFIXES = [".husky/", "test/", "routerino.jsx"];

/**
 * Throw a readable package-contract failure.
 *
 * @param {unknown} condition - Passing condition.
 * @param {string} message - Failure detail.
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/** Import every published JavaScript entry and verify its public exports. */
async function verifyExports() {
  const rootModule = await import(
    pathToFileURL(path.join(PROJECT_ROOT, "dist/routerino.js")).href
  );
  assert(
    typeof rootModule.default === "function",
    "ESM default export missing"
  );
  assert(typeof rootModule.Routerino === "function", "ESM Routerino missing");
  assert(
    typeof rootModule.ErrorBoundary === "function",
    "ESM ErrorBoundary missing"
  );
  assert(
    typeof rootModule.updateHeadTag === "function",
    "ESM updateHeadTag missing"
  );

  const require = createRequire(import.meta.url);
  const commonJsModule = require(
    path.join(PROJECT_ROOT, "dist/routerino.umd.cjs")
  );
  assert(
    typeof commonJsModule.default === "function",
    "CommonJS default export missing"
  );
  assert(
    typeof commonJsModule.Routerino === "function",
    "CommonJS Routerino missing"
  );

  const forgeModule = await import(
    pathToFileURL(path.join(PROJECT_ROOT, "routerino-forge.js")).href
  );
  assert(
    typeof forgeModule.default === "function",
    "Forge default export missing"
  );
  assert(
    typeof forgeModule.routerinoForge === "function",
    "Forge named export missing"
  );
}

/** Pack the built library without lifecycle scripts and inspect its manifest. */
async function verifyPackedFiles() {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "routerino-package-check-")
  );

  try {
    const npmCli = process.env.npm_execpath;
    const command = npmCli ? process.execPath : "npm";
    const args = npmCli
      ? [
          npmCli,
          "pack",
          "--json",
          "--ignore-scripts",
          "--pack-destination",
          temporaryDirectory,
        ]
      : [
          "pack",
          "--json",
          "--ignore-scripts",
          "--pack-destination",
          temporaryDirectory,
        ];
    const result = spawnSync(command, args, {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: path.join(temporaryDirectory, "npm-cache"),
      },
    });

    assert(
      result.status === 0,
      `npm pack failed: ${result.stderr || result.stdout}`
    );

    const [packageResult] = JSON.parse(result.stdout);
    const packedFiles = new Set(
      packageResult.files.map((file) => file.path.replaceAll("\\", "/"))
    );

    for (const requiredFile of REQUIRED_PACKAGE_FILES) {
      assert(
        packedFiles.has(requiredFile),
        `Packed file missing: ${requiredFile}`
      );
    }

    for (const forbiddenPrefix of FORBIDDEN_PACKAGE_PREFIXES) {
      assert(
        ![...packedFiles].some(
          (file) => file === forbiddenPrefix || file.startsWith(forbiddenPrefix)
        ),
        `Packed artifact contains development source: ${forbiddenPrefix}`
      );
    }

    assert(packageResult.size > 0, "Packed tarball is empty");
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

await verifyExports();
await verifyPackedFiles();

console.log(
  "Package verified: ESM, CommonJS, Forge exports, declaration files, and tarball contents."
);
