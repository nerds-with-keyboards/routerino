#!/usr/bin/env node

import { execSync } from "child_process";

console.log("🧪 Routerino Node.js compatibility matrix\n");

const compatibilityMatrix = [
  { node: "18", vite: "4" },
  { node: "20", vite: "5" },
  { node: "20", vite: "6" },
  { node: "20", vite: "7" },
  { node: "22", vite: "7" },
  { node: "24", vite: "8" },
];

console.log("📋 Current Node.js version:");
execSync("node --version", { stdio: "inherit" });

console.log("\nPacked-package consumer builds run in GitHub Actions for:\n");

for (const { node, vite } of compatibilityMatrix) {
  console.log(`- Node.js ${node} with Vite ${vite}`);
}

console.log(
  "\nThe full source-quality suite runs separately on the Volta-pinned development toolchain."
);
