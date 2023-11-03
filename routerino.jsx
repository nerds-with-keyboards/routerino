import PropTypes from "prop-types";

// update a head tag
function updateHeadTag({ tag = "meta", ...attrs }) {
  // first, get an array of the attribute names
  const attrKeys = Object.keys(attrs);

  // do a quick input check
  if (attrKeys.length < 1) {
    return console.error(
      `updateHeadTag() received no attributes to set for ${tag} tag`
    );
  }

  // tag assignment (3 steps)
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
  if (!tagToUpdate) {
    tagToUpdate = document.createElement(tag);
  }

  // next, set the tag attributes
  attrKeys.forEach((attr) => tagToUpdate.setAttribute(attr, attrs[attr]));

  // finally, append the tag
  document.querySelector("head").appendChild(tagToUpdate);
}

// Routerino Component
export default function Routerino({
  routes,
  host,
  notFoundTemplate,
  notFoundTitle,
  errorTemplate,
  errorTitle,
  useTrailingSlash,
  usePrerenderTags,
  titlePrefix,
  titlePostfix,
  imageUrl,
}) {
  try {
    let currentRoute = window?.location?.pathname ?? "/";
    // use the root route for index.html requests
    if (currentRoute === "/index.html") currentRoute = "/";
    // console.debug({ msg: "router called", currentRoute });

    let cleanedHost = host.endsWith("/") ? host.slice(0, -1) : host;

    // locate the route if it matches exactly
    const exactMatch = routes.find((route) => route.path === currentRoute);

    // locate the route if either part is missing a trailing slash
    const addSlashMatch = routes.find(
      (route) =>
        `${route.path}/` === currentRoute || route.path === `${currentRoute}/`
    );

    const match = exactMatch ?? addSlashMatch;

    if (Boolean(match)) {
      // set the title, og:title
      if (Boolean(match.title)) {
        const fullTitle = `${match.titlePrefix ?? titlePrefix}${match.title}${
          match.titlePostfix ?? titlePostfix
        }`;
        document.title = fullTitle;

        // set the og:title IFF user didn't supply their own
        if (!match.tags.find(({ property }) => property === "og:title")) {
          updateHeadTag({
            property: "og:title",
            content:
              match.title.length > 60
                ? `${match.title.slice(0, 56)}...`
                : match.title,
          });
        }
      }

      // set the description
      if (Boolean(match.description)) {
        updateHeadTag({ name: "description", content: match.description });
        updateHeadTag({
          property: "og:description",
          content: match.description,
        });
      }

      // set the og:image
      if (Boolean(imageUrl) || Boolean(match.imageUrl)) {
        let imageMatch = match.imageUrl ?? imageUrl;
        let includesHost = imageMatch.startsWith(cleanedHost);
        let separator = imageMatch.startsWith("/") ? "" : "/";
        updateHeadTag({
          property: "og:image",
          content: includesHost
            ? imageMatch
            : `${cleanedHost}${separator}${imageMatch}`,
        });
      } else {
        // if we don't have a user-supplied image, default to the favicon
        updateHeadTag({
          property: "og:image",
          content: `${cleanedHost}/favicon.ico`,
        });
        updateHeadTag({
          tag: "link",
          rel: "apple-touch-icon",
          href: `${cleanedHost}/favicon.ico`,
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
  host: "",
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
  imageUrl: PropTypes.string,
});

Routerino.propTypes = {
  routes: PropTypes.arrayOf(RouteProps),
  host: PropTypes.string,
  notFoundTemplate: PropTypes.element,
  notFoundTitle: PropTypes.string,
  errorTemplate: PropTypes.element,
  errorTitle: PropTypes.string,
  useTrailingSlash: PropTypes.bool,
  usePrerenderTags: PropTypes.bool,
  titlePrefix: PropTypes.string,
  titlePostfix: PropTypes.string,
  imageUrl: PropTypes.string,
};
