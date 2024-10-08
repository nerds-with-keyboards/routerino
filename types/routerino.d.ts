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
  titlePrefix?: string;
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
  titlePrefix?: string;
  titlePostfix?: string;
  imageUrl?: string;
  touchIconUrl?: string;
  debug?: boolean;
}

declare function Routerino(props: RouterinoProps): JSX.Element;

export default Routerino;
