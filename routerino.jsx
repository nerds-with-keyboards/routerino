import { cloneElement, useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * update a head tag
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
 *
 */
function updateHeadTag({ tag = "meta", soft = false, ...attrs }) {
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
  usePrerenderTags = true,
  title = "",
  separator = " | ",
  titlePrefix = "",
  titlePostfix = "",
  imageUrl = null,
  touchIconUrl = null,
  debug = false,
}) {
  try {
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
        if (debug) {
          console.debug(`click target ${target}`);
        }
        let targetUrl = new URL(target);

        if (debug) {
          console.debug(`targetUrl: ${targetUrl}, current: ${window.location}`);
        }
        // check for links to be updated without reloading (same origin)
        if (window.location.origin === targetUrl.origin) {
          if (debug) {
            console.debug(
              "target link is same origin, push-state transitioning"
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
            "target link does not share an origin, standard link handling applies"
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
      console.debug({ match, exactMatch, addSlashMatch, paramsMatch });
    }

    // START 404 HANDLING
    if (!match) {
      console.error(`No matching route found for ${currentRoute}`);
      document.title = `${titlePrefix}${notFoundTitle}${
        titlePostfix || `${separator}${title}`
      }`;
      if (usePrerenderTags) {
        updateHeadTag({ name: "prerender-status-code", content: "404" });
      }
      return notFoundTemplate;
    }

    // START MATCH HANDLING
    // set the title, og:title
    if (match.title) {
      // calculate the title
      const fullTitle = `${match.titlePrefix ?? titlePrefix}${match.title}${
        match.titlePostfix || titlePostfix || `${separator}${title}`
      }`;

      // set the doc title
      document.title = fullTitle;

      // create the og:title IFF user didn't supply their own
      if (!match.tags?.find(({ property }) => property === "og:title")) {
        updateHeadTag({
          property: "og:title",
          content: fullTitle,
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

    if (touchIconUrl) {
      updateHeadTag({
        tag: "link",
        rel: "apple-touch-icon",
        href: touchIconUrl,
      });
    }

    // check if we need to provide prerender redirects (while skipping redirects for the root route: `/` because that makes no sense)
    if (usePrerenderTags && currentRoute !== "/") {
      // check if we need to redirect to a trailing slash
      if (useTrailingSlash && !currentRoute.endsWith("/")) {
        updateHeadTag({ name: "prerender-status-code", content: "301" });
        updateHeadTag({
          name: "prerender-header",
          content: `Location: ${window.location.href}/`,
        });

        // check if we need to redirect to a non-trailing slash
      } else if (!useTrailingSlash && currentRoute.endsWith("/")) {
        updateHeadTag({ name: "prerender-status-code", content: "301" });
        updateHeadTag({
          name: "prerender-header",
          content: `Location: ${window.location.href.slice(0, -1)}`,
        });
      }
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

      // add the route params to the React component
      // nb: cloneElement won't re-trigger componentDidMount lifecycle
      const elementWithProps = cloneElement(match.element, {
        // we allow access via both uppercase and lowercase
        routerino: routerinoProps,
        Routerino: routerinoProps,
      });

      return elementWithProps;
    }

    // no search result
    console.error(`No route found for ${currentRoute}`);
    document.title = `${titlePrefix}${notFoundTitle}${
      titlePostfix || `${separator}${title}`
    }`;
    if (usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "404" });
    }

    return notFoundTemplate;
  } catch (e) {
    // router threw up (ಥ﹏ಥ)
    console.error(`Routerino error: ${e}`);
    if (usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "500" });
    }
    document.title = `${titlePrefix}${errorTitle}${
      titlePostfix || `${separator}${title}`
    }`;

    return errorTemplate;
  }
}

const RouteProps = PropTypes.exact({
  path: PropTypes.string.isRequired,
  element: PropTypes.element.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.object),
  titlePrefix: PropTypes.string,
  titlePostfix: PropTypes.string,
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
  titlePrefix: PropTypes.string,
  titlePostfix: PropTypes.string,
  imageUrl: PropTypes.string,
  touchIconUrl: PropTypes.string,
  debug: PropTypes.bool,
};
