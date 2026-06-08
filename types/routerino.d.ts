import React from "react";

export interface HeadTag {
  /**
   * Your production URL for canonical / sitemap generation (no trailing slash).
   * @example "https://example.com"
   */
  baseUrl?: string;
  /**
   * Path to your routes file.
   * @default "./src/routes.jsx"
   */
  routes?: string;
  /**
   * HTML template file to inject SSG content into.
   * @default "index.html"
   */
  template?: string;
  /**
   * Vite build output directory.
   * @default "dist"
   */
  outputDir?: string;
  /**
   * Whether to generate sitemap.xml.
   * @default true
   */
  generateSitemap?: boolean;
  /**
   * Whether to use trailing slashes in canonical URLs.
   * @default true
   */
  useTrailingSlash?: boolean;
  /**
   * Enable verbose build output.
   * @default false
   */
  verbose?: boolean;
  /**
   * SSG build cache directory.
   * @default "node_modules/.cache/routerino-forge/ssg"
   */
  ssgCacheDir?: string;
  /**
   * Transform CSS `<link>` tags to load asynchronously (non-blocking).
   * Converts stylesheets to use `media="print"` with `onload` swap,
   * `<link rel="preload">` hint, and `<noscript>` fallback.
   * @default true
   */
  nonBlockingCss?: boolean;
}

export interface HeadTag {
  /** The HTML tag name to update (default: "meta") */
  tag?: string;
  /** Whether to skip the update of an existing tag if already exists (default: false) */
  soft?: boolean;
  name?: string;
  property?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  itemProp?: string;
  rel?: string;
  href?: string;
  src?: string;
  sizes?: string;
  type?: string;
  media?: string;
  hrefLang?: string;
  target?: string;
  /** Inner HTML content for tags that require body content (e.g., &lt;script&gt;, &lt;style&gt;) */
  innerHTML?: string;
  [attribute: string]: string | number | boolean | object | undefined;
}

export interface RouteConfig {
  path: `/${string}`;
  element: React.ReactNode;
  title?: string;
  description?: string;
  tags?: HeadTag[];
  imageUrl?: string;
}

export interface RouterinoProps {
  title?: string;
  routes?: RouteConfig[];
  notFoundTemplate?: React.ReactNode;
  notFoundTitle?: string;
  errorTemplate?: React.ReactNode;
  errorTitle?: string;
  useTrailingSlash?: boolean;
  usePrerenderTags?: boolean;
  /**
   * Base URL for canonical tags. Must NOT end with a slash.
   * Validated at runtime by PropTypes.
   * @example baseUrl="https://example.com" ✅ Correct
   * @example baseUrl="https://example.com/" ❌ Wrong - will cause PropTypes warning
   */
  baseUrl?: string;
  separator?: string;
  imageUrl?: string;
  touchIconUrl?: string;
  debug?: boolean;
  /**
   * Array of regex pattern strings to match against link hrefs.
   * Matching links will NOT be intercepted by the SPA router and
   * will be handled natively by the browser instead.
   * Patterns are case-insensitive.
   * @example ignorePatterns={["/api/", "/admin/legacy/"]}
   */
  ignorePatterns?: string[];
}

export interface ErrorBoundaryProps {
  /** The child components to render when there's no error */
  children?: React.ReactNode;
  /** The fallback UI to display when an error is caught */
  fallback?: React.ReactNode;
  /** The document title to set when an error occurs */
  errorTitleString: string;
  /** Whether to set prerender meta tags (status code 500) on error */
  usePrerenderTags?: boolean;
  /** The current route path for better error context (optional) */
  routePath?: string;
  /** Whether to log debug messages to console (optional) */
  debug?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}

export interface RouterinoContextValue {
  currentRoute: string;
  params: Record<string, string>;
  routePattern: string;
  updateHeadTag: (tag: HeadTag) => void;
}

export function useRouterino(): RouterinoContextValue;

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps);
  static getDerivedStateFromError(error: Error): ErrorBoundaryState;
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
  render(): React.ReactNode;
}

// Named export (recommended)
export function Routerino(props: RouterinoProps): JSX.Element;

// Forge plugin Vite plugin constructor
export function routerinoForge(
  options?: RouterinoForgeOptions
): Record<string, any>;

// Default export for backward compatibility
export default Routerino;
