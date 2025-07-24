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
  path: string;
  element: React.ReactNode;
  title?: string;
  description?: string;
  tags?: HeadTag[];
  /** @deprecated Use title and separator props instead. Will be removed in v2.0 */
  titlePrefix?: string;
  /** @deprecated Use title and separator props instead. Will be removed in v2.0 */
  titlePostfix?: string;
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
  /** @deprecated Use title and separator props instead. Will be removed in v2.0 */
  titlePrefix?: string;
  /** @deprecated Use title and separator props instead. Will be removed in v2.0 */
  titlePostfix?: string;
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
}

export interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps);
  static getDerivedStateFromError(error: Error): ErrorBoundaryState;
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
  render(): React.ReactNode;
}

declare function Routerino(props: RouterinoProps): JSX.Element;

export default Routerino;
