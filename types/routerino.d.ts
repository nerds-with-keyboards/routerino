import React from "react";

export interface HeadTag {
  tag?: string;
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
  [attribute: string]: string | number | boolean | object | undefined;
}

export interface RouteConfig {
  path: `/${string}/`;
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
  separator?: string;
  imageUrl?: string;
  touchIconUrl?: string;
  debug?: boolean;
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

declare function Routerino(props: RouterinoProps): JSX.Element;

export default Routerino;
