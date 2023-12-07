import { useEffect, useState } from "react";
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
  const [href, setHref] = useState(window.location.href);
  useEffect(() => {
    const handleClick = (event) => {
      let target = event.target;
      while (target.tagName !== "A" && target.parentElement) {
        target = target.parentElement;
      }

      if (
        target.tagName === "A" &&
        target.hostname === window.location.hostname
      ) {
        setHref(target.href);
        event.preventDefault();
        window.history.pushState({}, "", target.href);
      }
    };
    document.addEventListener("click", handleClick);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [href]);

  try {
    let currentRoute = window.location?.pathname ?? "/";
    // use the root route for index.html requests
    if (currentRoute === "/index.html" || currentRoute === "")
      currentRoute = "/";
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
        // calculate the title
        const fullTitle = `${match.titlePrefix ?? titlePrefix}${match.title}${
          match.titlePostfix ?? titlePostfix
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
      if (Boolean(match.description)) {
        updateHeadTag({ name: "description", content: match.description });

        // create the og:description IFF user didn't supply their own
        if (
          !match.tags?.find(({ property }) => property === "og:description")
        ) {
          updateHeadTag({
            property: "og:description",
            content: match.description,
          });
        }
      }

      // set the og:image
      if (Boolean(imageUrl) || Boolean(match.imageUrl)) {
        // look for an image url to use
        const imageMatch = match.imageUrl ?? imageUrl;
        // check and account for possible relative urls
        // if the url includes http protocol then it isn't relative
        const includesHost =
          imageMatch.startsWith("http://") || imageMatch.startsWith("https://");
        const separator = imageMatch.startsWith("/") ? "" : "/";

        // set the tag
        updateHeadTag({
          property: "og:image",
          content: includesHost
            ? imageMatch
            : `${cleanedHost}${separator}${imageMatch}`,
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
