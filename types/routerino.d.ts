import React from "react";

export interface RouteTag {
  property: string;
  content: string;
}

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  title?: string;
  description?: string;
  tags?: RouteTag[];
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
