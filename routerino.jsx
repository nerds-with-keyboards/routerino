import {
  Component,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";

// Create RouterinoContext for sharing router state
const RouterinoContext = createContext(null);

/**
 * Hook to access Routerino router state
 * @returns {Object} Router state including currentRoute, params, routePattern, and updateHeadTag
 */
export function useRouterino() {
  const context = useContext(RouterinoContext);
  if (!context) {
    throw new Error(
      "useRouterino must be used within a Routerino router. Make sure your component is rendered inside a <Routerino> component."
    );
  }
  return context;
}

/**
 * Update a head tag, creating the tag if necessary
 *
 * @typedef {Object} HeadTag
 * @property {string} [tag] - The tag name to update (default: meta)
 * @property {boolean} [soft] - Whether to skip the update of an existing tag if already exists (default: false)
 * @property {string} [name] - The name attribute of the tag
 * @property {string} [property] - The property attribute of the tag
 * @property {string} [content] - The content attribute of the tag
 * @property {string} [charset] - The charset attribute of the tag
 * @property {string} [httpEquiv] - The http-equiv attribute of the tag
 * @property {string} [itemProp] - The itemProp attribute of the tag
 * @property {string} [rel] - The rel attribute of the tag
 * @property {string} [href] - The href attribute of the tag
 * @property {string} [src] - The src attribute of the tag
 * @property {string} [sizes] - The sizes attribute of the tag
 * @property {string} [type] - The type attribute of the tag
 * @property {string} [media] - The media attribute of the tag
 * @property {string} [hrefLang] - The hrefLang attribute of the tag
 * @property {string} [target] - The target attribute of the tag
 */
export function updateHeadTag({ tag = "meta", soft = false, ...attrs }) {
  // first, get an array of the attribute names
  const attrKeys = Object.keys(attrs);

  // do a quick input check
  if (attrKeys.length < 1) {
    return console.error(
      `updateHeadTag() received no attributes to set for ${tag} tag`
    );
  }

  // tag search/instantiate (3 steps)
  // we want to use existing tag if available (to prevent duplicate tags), or create it otherwise.
  // ------------------------------------------
  // 1. instantiate the variable here
  let tagToUpdate = null;

  // 2. iterate to find the first match (while excluding the content attribute)
  for (let i = 0; i < attrKeys.length; i++) {
    if (attrKeys[i] !== "content") {
      tagToUpdate = document.querySelector(
        `${tag}[${attrKeys[i]}='${attrs[attrKeys[i]]}']`
      );
    }
    if (tagToUpdate) break;
  }

  // 3. if no matching tag is found, create a new one
  // make sure we don't want a "soft" update (doesn't overwrite the value if set)
  if (!tagToUpdate && !soft) {
    tagToUpdate = document.createElement(tag);
  }

  // next, set the tag attributes
  attrKeys.forEach((attr) => tagToUpdate.setAttribute(attr, attrs[attr]));

  // finally, append the tag
  document.querySelector("head").appendChild(tagToUpdate);
}

function extractParams({ routePattern, currentRoute }) {
  // For simplicity, we just split by '/' and match :paramName
  let params = {};
  let routeSegments = routePattern.split("/");
  let currentRouteSegments = currentRoute.split("/");

  routeSegments.forEach((segment, index) => {
    if (segment.startsWith(":")) {
      params[segment.slice(1)] = currentRouteSegments[index];
    }
  });

  return params;
}

/**
 * A minimal error boundary component that catches React errors and displays a fallback UI.
 *
 * @component
 * @example
 * ```jsx
 * <ErrorBoundary
 *   fallback={<div>Something went wrong</div>}
 *   errorTitleString="Error | My Site"
 *   usePrerenderTags={true}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.debug) {
      console.group("Routerino Error Boundary Caught an Error", error);
      console.error("Component Stack:", errorInfo.componentStack);
      if (this.props.routePath)
        console.error("Failed Route:", this.props.routePath);
      console.error("Error occurred at:", new Date().toISOString());
      console.groupEnd();
    }
    // Set error title and meta tags
    document.title = this.props.errorTitleString;
    if (this.props.usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "500" });
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /** The child components to render when there's no error */
  children: PropTypes.node,
  /** The fallback UI to display when an error is caught */
  fallback: PropTypes.node,
  /** The document title to set when an error occurs */
  errorTitleString: PropTypes.string.isRequired,
  /** Whether to set prerender meta tags (status code 500) on error */
  usePrerenderTags: PropTypes.bool,
  /** The current route path for better error context (optional) */
  routePath: PropTypes.string,
  /** Whether to log debug messages to console (optional) */
  debug: PropTypes.bool,
};

// Routerino Component
export default function Routerino({
  routes = [
    {
      path: "/",
      element: (
        <p>
          This is the default route. Pass an array of routes to the Routerino
          component in order to configure your own pages. Each route is a
          dictionary with at least `path` and `element` defined.
        </p>
      ),
      title: "Routerino default route example",
      description: "The default route example description.",
      tags: [{ property: "og:locale", content: "en_US" }],
    },
  ],
  notFoundTemplate = (
    <>
      <p>No page found for this URL. [404]</p>
      <p>
        <a href="/">Home</a>
      </p>
    </>
  ),
  notFoundTitle = "Page not found [404]",
  errorTemplate = (
    <>
      <p>Page failed to load. [500]</p>
      <p>
        <a href="/">Home</a>
      </p>
    </>
  ),
  errorTitle = "Page error [500]",
  useTrailingSlash = true,
  usePrerenderTags = false,
  baseUrl = null,
  title = "",
  separator = " | ",
  imageUrl = null,
  touchIconUrl = null,
  debug = false,
}) {
  // Pre-compute title strings
  const errorTitleString = `${errorTitle}${separator}${title}`;
  const notFoundTitleString = `${notFoundTitle}${separator}${title}`;
  try {
    // Development-only checks
    if (debug) {
      // Check for duplicate routes
      const paths = routes.map((r) => r.path);
      const duplicates = paths.filter(
        (path, index) => paths.indexOf(path) !== index
      );
      if (duplicates.length > 0) {
        console.warn("⚠️ Routerino: Duplicate route paths detected:", [
          ...new Set(duplicates),
        ]);
        console.warn("The first matching route will be used");
      }
    }

    // we use this state to track the URL internally and control React updates
    const [href, setHref] = useState(window.location.href);

    // this useEffect manages reload-free page transitions via
    // the browser's history.pushState and window.scrollTo APIs
    useEffect(() => {
      const handleClick = (event) => {
        if (debug) {
          console.debug("click occurred");
        }
        let target = event.target;
        while (target.tagName !== "A" && target.parentElement) {
          target = target.parentElement;
        }
        if (target.tagName !== "A") {
          // no anchor tag, stop checking anything
          if (debug) {
            console.debug("no achor tag found during click");
          }
          return;
        }

        // Get the href from the anchor element
        const href = target.getAttribute("href") || target.href;
        if (!href) {
          if (debug) {
            console.debug("anchor tag has no href");
          }
          return;
        }

        if (debug) {
          console.debug(`click target href: ${href}`);
        }

        let targetUrl;
        try {
          targetUrl = new URL(href, window.location.href);
        } catch (e) {
          if (debug) {
            console.debug(`Invalid URL: ${href}`, e);
          }
          return;
        }

        if (debug) {
          console.debug(`targetUrl: ${targetUrl}, current: ${window.location}`);
        }
        // check for links to be updated without reloading (same origin)
        if (targetUrl && window.location.origin === targetUrl.origin) {
          if (debug) {
            console.debug(
              "target link is same origin, Routerino will use push-state transitioning"
            );
          }
          event.preventDefault();

          // update the history (for new locations)
          if (target.href !== window.location.href) {
            setHref(target.href);
            window.history.pushState({}, "", target.href);
          }

          // replicate a browser reload (by scrolling to top)
          window.scrollTo({
            top: 0,
            behavior: "auto",
          });
        } else if (debug) {
          console.debug(
            "target link does not share an origin, standard browser link handling applies (Routerino does nothing)"
          );
        }
      };
      document.addEventListener("click", handleClick);

      // handle browser back button state changes
      const handlePopState = () => {
        setHref(window.location.href);
      };
      window.addEventListener("popstate", handlePopState);

      // clean up the event listeners
      return () => {
        document.removeEventListener("click", handleClick);
        window.removeEventListener("popstate", handlePopState);
      };
    }, [href]);

    // START LOCATING MATCH
    let currentRoute = window.location?.pathname ?? "/";
    // use the root route for index.html requests
    if (currentRoute === "/index.html" || currentRoute === "")
      currentRoute = "/";
    // console.debug({ msg: "router called", currentRoute });

    // locate the route if it matches exactly
    const exactMatch = routes.find((route) => route.path === currentRoute);

    // locate the route if either part is missing a trailing slash
    const addSlashMatch = routes.find(
      (route) =>
        `${route.path}/` === currentRoute || route.path === `${currentRoute}/`
    );

    // locate the route if using params matching
    const paramsMatch = routes.find((route) => {
      // Normalize the paths by removing trailing slashes
      const normalizedRoutePath = route.path.endsWith("/")
        ? route.path.slice(0, -1)
        : route.path;
      const normalizedCurrentRoute = currentRoute.endsWith("/")
        ? currentRoute.slice(0, -1)
        : currentRoute;

      // Split the paths into segments
      const routeSegments = normalizedRoutePath.split("/").filter(Boolean);
      const currentRouteSegments = normalizedCurrentRoute
        .split("/")
        .filter(Boolean);

      // Check if segments length match
      if (routeSegments.length !== currentRouteSegments.length) {
        return false;
      }

      // Compare each segment
      return routeSegments.every((segment, index) => {
        // If the segment starts with ':', it's a parameter, so it should match anything
        if (segment.startsWith(":")) {
          return true;
        }
        // If it's not a parameter, it should match the segment in the current route exactly
        return segment === currentRouteSegments[index];
      });
    });

    const match = exactMatch ?? addSlashMatch ?? paramsMatch;
    if (debug) {
      // matching debugging helper
      console.debug({ match, exactMatch, addSlashMatch, paramsMatch });
    }

    // START 404 HANDLING
    if (!match) {
      if (debug) {
        console.group("⚠️ Routerino 404 - No matching route");
        console.warn(`Requested path: ${currentRoute}`);
        console.warn(
          "Available routes:",
          routes.map((r) => r.path)
        );
        console.groupEnd();
      }

      document.title = notFoundTitleString;
      if (usePrerenderTags) {
        updateHeadTag({ name: "prerender-status-code", content: "404" });
      }
      return notFoundTemplate;
    }

    // START MATCH HANDLING
    // Clean up any prerender error/redirect tags from previous routes
    if (usePrerenderTags) {
      const prerenderStatusTag = document.querySelector(
        'meta[name="prerender-status-code"]'
      );
      if (prerenderStatusTag) {
        prerenderStatusTag.remove();
      }
      const prerenderHeaderTag = document.querySelector(
        'meta[name="prerender-header"]'
      );
      if (prerenderHeaderTag) {
        prerenderHeaderTag.remove();
      }
    }

    // Determine canonical path and whether current path needs redirect
    const needsTrailingSlash =
      useTrailingSlash && !currentRoute.endsWith("/") && currentRoute !== "/";
    const needsNoTrailingSlash =
      !useTrailingSlash && currentRoute.endsWith("/") && currentRoute !== "/";

    const canonicalPath = needsTrailingSlash
      ? `${currentRoute}/`
      : needsNoTrailingSlash
        ? currentRoute.slice(0, -1)
        : currentRoute;

    const canonicalUrl = `${baseUrl || window.location.origin}${canonicalPath}`;

    // set the title, og:title
    if (match.title) {
      // calculate the title
      const fullTitle = `${match.title}${separator}${title}`;

      // set the doc title
      document.title = fullTitle;

      // Set canonical URL
      updateHeadTag({
        tag: "link",
        rel: "canonical",
        href: canonicalUrl,
      });

      // create the og:title IFF user didn't supply their own
      if (!match.tags?.find(({ property }) => property === "og:title")) {
        updateHeadTag({
          property: "og:title",
          content: fullTitle,
        });
      }

      // Set og:url to canonical URL
      if (!match.tags?.find(({ property }) => property === "og:url")) {
        updateHeadTag({
          property: "og:url",
          content: canonicalUrl,
        });
      }
    }

    // set the description
    if (match.description) {
      updateHeadTag({ name: "description", content: match.description });

      // create the og:description IFF user didn't supply their own
      if (!match.tags?.find(({ property }) => property === "og:description")) {
        updateHeadTag({
          property: "og:description",
          content: match.description,
        });
      }
    }

    // set the og:image
    if (Boolean(imageUrl) || Boolean(match.imageUrl)) {
      // set the og:image tag
      updateHeadTag({
        property: "og:image",
        content: match.imageUrl ?? imageUrl,
      });
    }

    // set the twitter summary card to ensure rich previews
    if (!match.tags?.find(({ property }) => property === "twitter:card")) {
      updateHeadTag({
        name: "twitter:card",
        content: "summary_large_image",
      });
    }

    if (touchIconUrl) {
      updateHeadTag({
        tag: "link",
        rel: "apple-touch-icon",
        href: touchIconUrl,
      });
    }

    // check if we need to provide prerender redirects
    if (usePrerenderTags && (needsTrailingSlash || needsNoTrailingSlash)) {
      updateHeadTag({ name: "prerender-status-code", content: "301" });
      updateHeadTag({
        name: "prerender-header",
        content: `Location: ${canonicalUrl}`,
      });
    }

    // add any supplied meta tags (& default the og:type to website)
    if (Boolean(match.tags) && Boolean(match.tags.length)) {
      if (!match.tags.find(({ property }) => property === "og:type")) {
        updateHeadTag({ property: "og:type", content: "website" });
      }
      match.tags.forEach((tag) => updateHeadTag(tag));
    } else {
      updateHeadTag({ property: "og:type", content: "website" });
    }

    // check & return the element to render
    if (match.element) {
      // we need to extract the path parameters to give to components that need them
      const params = extractParams({
        routePattern: match.path,
        currentRoute,
      });

      const routerinoProps = {
        currentRoute,
        params,
        routePattern: match.path,
        updateHeadTag,
      };

      return (
        <RouterinoContext.Provider value={routerinoProps}>
          <ErrorBoundary
            fallback={errorTemplate}
            errorTitleString={errorTitleString}
            usePrerenderTags={usePrerenderTags}
            routePath={currentRoute}
            debug={debug}
          >
            {match.element}
          </ErrorBoundary>
        </RouterinoContext.Provider>
      );
    }

    // no match
    if (debug) console.error(`No route found for ${currentRoute}`);
    document.title = notFoundTitleString;
    if (usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "404" });
    }
    return notFoundTemplate;
  } catch (e) {
    // router code threw
    if (debug) {
      console.group("💥 Routerino Fatal Error");
      console.error(
        "An error occurred in the router itself (not in a route component)"
      );
      console.error("Error:", e);
      console.error(
        "This typically means an issue with route configuration or router setup"
      );
      console.groupEnd();
    }

    if (usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "500" });
    }
    document.title = errorTitleString;
    return errorTemplate;
  }
}

const RouteProps = PropTypes.exact({
  path: (props, propName, componentName) => {
    const value = props[propName];
    if (value == null) {
      return new Error(
        `The prop \`${propName}\` is marked as required in \`${componentName}\`, but its value is \`${value}\`.`
      );
    }
    if (typeof value !== "string") {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`string\`.`
      );
    }
    if (!value.startsWith("/")) {
      return new Error(
        `Invalid prop \`${propName}\` value \`${value}\` supplied to \`${componentName}\`. Route paths must start with a forward slash (/).`
      );
    }
    return null;
  },
  element: PropTypes.element.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.object),
  imageUrl: PropTypes.string,
});

Routerino.propTypes = {
  routes: PropTypes.arrayOf(RouteProps),
  title: PropTypes.string,
  separator: PropTypes.string,
  notFoundTemplate: PropTypes.element,
  notFoundTitle: PropTypes.string,
  errorTemplate: PropTypes.element,
  errorTitle: PropTypes.string,
  useTrailingSlash: PropTypes.bool,
  usePrerenderTags: PropTypes.bool,
  baseUrl: PropTypes.string,
  imageUrl: PropTypes.string,
  touchIconUrl: PropTypes.string,
  debug: PropTypes.bool,
};
