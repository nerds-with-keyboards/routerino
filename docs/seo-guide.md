# SEO Guide

## Page Titles

- Keep page titles unique for each route. Avoid including the site name like "Foo.com" in individual page titles — Routerino adds that automatically.
- Aim for concise, descriptive titles that accurately represent the page content.
- Keep title length at a max of 50-60 characters. Longer text may be ignored or cut off, especially on mobile.

## URL Structure & Canonicalization

When multiple URLs show the same content (like `/about` vs `/about/`), search engines need to know which one is the "official" version to avoid duplicate content penalties. Routerino handles this automatically.

**With SSG:** Creates both `/about.html` and `/about/index.html` with canonical tags:

```html
<link rel="canonical" href="https://example.com/about/" />
<meta property="og:url" content="https://example.com/about/" />
```

**With Prerender (SPA):** Includes meta tags for correct status codes:

```html
<!-- For canonical URL (/about/) -->
<link rel="canonical" href="https://example.com/about/" />
<meta property="og:url" content="https://example.com/about/" />

<!-- For non-canonical URL (/about) -->
<meta name="prerender-status-code" content="301" />
<meta name="prerender-header" content="Location: https://example.com/about/" />
```

Use `useTrailingSlash={false}` if you prefer URLs without trailing slashes. Use `baseUrl` if your site is served from multiple domains:

```jsx
<Routerino baseUrl="https://example.com" routes={routes} />
```

## Social Previews & Open Graph

Routerino automatically sets core Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`) for every page.

### Image Best Practices

- Size: Use 1200x630 pixels (1.91:1 ratio) for maximum compatibility
- Add dimensions for faster first-share rendering:

```js
updateHeadTag({ property: "og:image:width", content: "1200" });
updateHeadTag({ property: "og:image:height", content: "630" });
```

### Branding

For site-wide branding, add `og:site_name`:

```js
updateHeadTag({ property: "og:site_name", content: "Your Brand" });
```

### Platform-Specific Enhancements

- Apple/iMessage: Set `touchIconUrl` prop for iMessage link previews
- Video content:

```js
updateHeadTag({
  property: "og:video",
  content: "https://example.com/video.mp4",
});
updateHeadTag({ property: "og:video:type", content: "video/mp4" });
```

### Testing Previews

Test how your links appear with platform-specific tools (platforms cache aggressively — use these to force a refresh):

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Twitter Cards

Routerino automatically includes `summary_large_image` for maximum engagement:

```html
<meta name="twitter:card" content="summary_large_image" />
```

## Meta Descriptions

- Provide unique, informative descriptions for each route.
- Keep them under ~150 characters to avoid truncation in search results.

## Structured Data (JSON-LD)

Use the `innerHTML` property on a `<script type="application/ld+json">` head tag:

```jsx
{
  path: "/about/",
  element: <AboutPage />,
  tags: [{
    tag: "script",
    type: "application/ld+json",
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
        { "@type": "ListItem", "position": 2, "name": "About", "item": "https://example.com/about/" },
      ],
    }),
  }],
}
```

This works both at runtime (via `updateHeadTag`) and during SSG (via the forge plugin).

## Hash Links

Routerino supports standard `<a href="/page#section">` links for SPA navigation. After React renders the new page, it finds the element with the matching `id` and scrolls it into view.

**Sticky headers:** Use [`scroll-margin-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top) to offset the scroll target:

```css
[id] {
  scroll-margin-top: 80px; /* match your header height */
}
```

This works for SPA navigation, native browser hash navigation, and direct page loads.

## Additional SEO Considerations

- Use semantic HTML elements in your components for better content structure.
- Implement structured data (JSON-LD) where applicable to enhance rich snippets.
- Ensure your site is mobile-friendly and loads quickly.
