import type { Plugin } from "vite";

export interface RouterinoForgeOptions {
  /**
   * Your production URL for canonical and sitemap generation.
   * Must be an HTTP(S) origin with no trailing slash.
   * @example "https://example.com"
   */
  baseUrl: string;
  /** Path to the module exporting the routes and optional App component. */
  routes?: string;
  /** Built HTML template path relative to outputDir. @default "index.html" */
  template?: string;
  /** Vite build output directory. @default "dist" */
  outputDir?: string;
  /** Whether to generate sitemap.xml and robots.txt. @default true */
  generateSitemap?: boolean;
  /** Whether canonical URLs use trailing slashes. @default true */
  useTrailingSlash?: boolean;
  /** Enable verbose build output. @default false */
  verbose?: boolean;
  /** Parent directory for isolated temporary SSG bundles. @default "node_modules/.cache/routerino-forge/ssg" */
  ssgCacheDir?: string;
}

export function routerinoForge(options: RouterinoForgeOptions): Plugin;

export default routerinoForge;
