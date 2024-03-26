import React from "react";

export interface HeadTag {
  tag?: string;
  name?: string;
  content?: string;
  property?: string;
  [attribute: string]: string | undefined;
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
  routes?: RouteConfig[];
  host?: string;
  notFoundTemplate?: React.ReactNode;
  notFoundTitle?: string;
  errorTemplate?: React.ReactNode;
  errorTitle?: string;
  useTrailingSlash?: boolean;
  usePrerenderTags?: boolean;
  titlePrefix?: string;
  titlePostfix?: string;
  imageUrl?: string;
}

declare function Routerino(props: RouterinoProps): JSX.Element | null;

declare namespace Routerino {
  var defaultProps: {
    routes: {
      path: string;
      element: JSX.Element;
      description: string;
      tags: {
        property: string;
        content: string;
      }[];
    }[];
    host: string;
    notFoundTemplate: JSX.Element;
    notFoundTitle: string;
    errorTemplate: JSX.Element;
    errorTitle: string;
    useTrailingSlash: boolean;
    usePrerenderTags: boolean;
    titlePrefix: string;
    titlePostfix: string;
  };
}

export default Routerino;
