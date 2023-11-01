import PropTypes from "prop-types";

// update a head tag
function updateHeadTag({ tag = "meta", ...attrs }) {
  // input check
  const attrKeys = Object.keys(attrs);
  if (attrKeys.length < 1) {
    return console.error(
      `updateHeadTag() received no attributes to set for ${tag} tag`
    );
  }

  // use existing tag if available, or create it
  let tagToUpdate = null;

  // iterate to find the first match (excluding the content attribute)
  for (let i = 0; i < attrKeys.length; i++) {
    if (attrKeys[i] !== "content") {
      tagToUpdate = document.querySelector(
        `${tag}[${attrKeys[i]}='${attrs[attrKeys[i]]}']`
      );
    }
    if (tagToUpdate) break;
  }

  // if no matching tag is found, create a new one
  if (!tagToUpdate) {
    tagToUpdate = document.createElement(tag);
  }

  // set the tag attrs
  Object.keys(attrs).forEach((attr) =>
    tagToUpdate.setAttribute(attr, attrs[attr])
  );

  // append the tag
  document.querySelector("head").appendChild(tagToUpdate);
}

// Routerino Component
export default function Routerino({
  routes,
  notFoundTemplate,
  notFoundTitle,
  errorTemplate,
  errorTitle,
  useTrailingSlash,
  usePrerenderTags,
  titlePrefix,
  titlePostfix,
}) {
  try {
    let currentRoute = window?.location?.pathname ?? "/";
    // use the root route for index.html requests
    if (currentRoute === "/index.html") currentRoute = "/";
    // console.debug({ msg: "router called", currentRoute });

    // locate the route if it matches exactly
    const exactMatch = routes.find((route) => route.path === currentRoute);

    // locate the route if either part is missing a trailing slash
    const addSlashMatch = routes.find(
      (route) =>
        `${route.path}/` === currentRoute || route.path === `${currentRoute}/`
    );

    const match = exactMatch ?? addSlashMatch;

    if (Boolean(match)) {
      // set the title
      if (Boolean(match.title)) {
        const fullTitle = `${match.titlePrefix ?? titlePrefix}${match.title}${
          match.titlePostfix ?? titlePostfix
        }`;
        document.title = fullTitle;
      }

      // set the description
      if (Boolean(match.description)) {
        updateHeadTag({ name: "description", content: match.description });
        updateHeadTag({
          property: "og:description",
          content: match.description,
        });
        // set og:title
        let ogTitle = `${match.title ?? document.title} - ${match.description}`;
        if (ogTitle.length > 60) {
          ogTitle = `${ogTitle.slice(0, 60)}...`;
        }
        updateHeadTag({
          property: "og:title",
          content: ogTitle,
        });
      }

      // check if we need to provide prerender redirects
      if (usePrerenderTags) {
        if (useTrailingSlash && !currentRoute.endsWith("/")) {
          updateHeadTag({ name: "prerender-status-code", content: "301" });
          updateHeadTag({
            name: "prerender-header",
            content: `Location: ${window.location.href}/`,
          });
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
      if (Boolean(match.element)) {
        return match.element;
      } else {
        // no element
        console.error(`No element found for ${currentRoute}`);
        document.title = `${titlePrefix}${notFoundTitle}${titlePostfix}`;
        if (usePrerenderTags) {
          updateHeadTag({ name: "prerender-status-code", content: "404" });
        }
        return notFoundTemplate;
      }
    }

    // no search result
    console.error(`No route found for ${currentRoute}`);
    document.title = `${titlePrefix}${notFoundTitle}${titlePostfix}`;
    if (usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "404" });
    }
    return notFoundTemplate;
  } catch (e) {
    // router threw up
    console.error(`Routerino error: ${e}`);
    if (usePrerenderTags) {
      updateHeadTag({ name: "prerender-status-code", content: "500" });
    }
    document.title = `${titlePrefix}${errorTitle}${titlePostfix}`;
    return errorTemplate;
  }
}

Routerino.defaultProps = {
  routes: [
    {
      path: "/",
      element: (
        <p>
          This is the default route. Pass an array of routes to the Routerino
          component in order to configure your own pages.
        </p>
      ),
      description: "The default route example description.",
      tags: [{ property: "og:locale", content: "en_US" }],
    },
  ],
  notFoundTemplate: (
    <>
      <p>No page found for this URL. [404]</p>
      <p>
        <a href="/">Home</a>
      </p>
    </>
  ),
  notFoundTitle: "Page not found [404]",
  errorTemplate: (
    <>
      <p>Page failed to load. [500]</p>
      <p>
        <a href="/">Home</a>
      </p>
    </>
  ),
  errorTitle: "Page error [500]",
  useTrailingSlash: true,
  usePrerenderTags: true,
  titlePrefix: "",
  titlePostfix: "",
};

const RouteProps = PropTypes.exact({
  path: PropTypes.string.isRequired,
  element: PropTypes.element.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.object),
  titlePrefix: PropTypes.string,
  titlePostfix: PropTypes.string,
});

Routerino.propTypes = {
  routes: PropTypes.arrayOf(RouteProps),
  notFoundTemplate: PropTypes.element,
  notFoundTitle: PropTypes.string,
  errorTemplate: PropTypes.element,
  errorTitle: PropTypes.string,
  useTrailingSlash: PropTypes.bool,
  usePrerenderTags: PropTypes.bool,
  titlePrefix: PropTypes.string,
  titlePostfix: PropTypes.string,
};
