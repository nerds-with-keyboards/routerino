import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import Routerino from "../routerino.jsx";

describe("Social Media Preview Tags", () => {
  let originalLocation;

  beforeEach(() => {
    // Mock window.location
    originalLocation = window.location;
    delete window.location;
    window.location = {
      href: "https://example.com/",
      pathname: "/",
      search: "",
      host: "example.com",
    };

    // Clean up meta tags
    document
      .querySelectorAll(
        'meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]'
      )
      .forEach((tag) => tag.remove());
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe("Open Graph Tags", () => {
    it("should set complete OG tags for social sharing", () => {
      const routes = [
        {
          path: "/",
          element: <div>Home</div>,
          title: "Amazing Product",
          description: "The best product you will ever use",
          imageUrl: "https://example.com/product.jpg",
        },
      ];

      render(
        <Routerino routes={routes} title="Example Site">
          <div id="routerino-target"></div>
        </Routerino>
      );

      // Check all OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      const ogImage = document.querySelector('meta[property="og:image"]');

      expect(ogTitle.getAttribute("content")).toBe(
        "Amazing Product | Example Site"
      );
      expect(ogDescription.getAttribute("content")).toBe(
        "The best product you will ever use"
      );
      expect(ogImage.getAttribute("content")).toBe(
        "https://example.com/product.jpg"
      );
    });

    it("should use global imageUrl when route has none", () => {
      const routes = [
        {
          path: "/",
          element: <div>No Image</div>,
          title: "Page without image",
        },
      ];

      render(
        <Routerino routes={routes} imageUrl="https://example.com/default.jpg">
          <div id="routerino-target"></div>
        </Routerino>
      );

      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage.getAttribute("content")).toBe(
        "https://example.com/default.jpg"
      );
    });
  });

  describe("Twitter Cards", () => {
    it("should set Twitter card meta tags", () => {
      const routes = [
        {
          path: "/",
          element: <div>Tweet This</div>,
          title: "Great Article",
          description: "You should read this article",
          imageUrl: "https://example.com/article.jpg",
          tags: [
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:site", content: "@example" },
            { name: "twitter:creator", content: "@author" },
          ],
        },
      ];

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterSite = document.querySelector('meta[name="twitter:site"]');
      const twitterCreator = document.querySelector(
        'meta[name="twitter:creator"]'
      );

      expect(twitterCard.getAttribute("content")).toBe("summary_large_image");
      expect(twitterSite.getAttribute("content")).toBe("@example");
      expect(twitterCreator.getAttribute("content")).toBe("@author");
    });
  });

  describe("Canonical URLs", () => {
    it("should set canonical link tag", () => {
      const routes = [
        {
          path: "/products/item-1",
          element: <div>Product</div>,
          tags: [
            {
              tag: "link",
              rel: "canonical",
              href: "https://example.com/products/item-1",
            },
          ],
        },
      ];

      window.location.pathname = "/products/item-1";

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical.getAttribute("href")).toBe(
        "https://example.com/products/item-1"
      );
    });
  });

  describe("Social Platform Specific", () => {
    it("should handle Facebook specific tags", () => {
      const routes = [
        {
          path: "/",
          element: <div>FB Share</div>,
          tags: [
            { property: "fb:app_id", content: "123456789" },
            { property: "og:site_name", content: "Example Site" },
            {
              property: "article:publisher",
              content: "https://facebook.com/example",
            },
          ],
        },
      ];

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const fbAppId = document.querySelector('meta[property="fb:app_id"]');
      const siteName = document.querySelector('meta[property="og:site_name"]');
      const publisher = document.querySelector(
        'meta[property="article:publisher"]'
      );

      expect(fbAppId.getAttribute("content")).toBe("123456789");
      expect(siteName.getAttribute("content")).toBe("Example Site");
      expect(publisher.getAttribute("content")).toBe(
        "https://facebook.com/example"
      );
    });

    it("should handle LinkedIn specific tags", () => {
      const routes = [
        {
          path: "/",
          element: <div>LinkedIn Share</div>,
          title: "Professional Article",
          tags: [
            { property: "og:type", content: "article" },
            { name: "author", content: "John Doe" },
          ],
        },
      ];

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const ogType = document.querySelector('meta[property="og:type"]');
      const author = document.querySelector('meta[name="author"]');

      expect(ogType.getAttribute("content")).toBe("article");
      expect(author.getAttribute("content")).toBe("John Doe");
    });
  });

  describe("Preview Validation", () => {
    it("should have all required tags for rich previews", () => {
      const routes = [
        {
          path: "/",
          element: <div>Share Me</div>,
          title: "Shareable Content",
          description: "This content looks great when shared",
          imageUrl: "https://example.com/share.jpg",
        },
      ];

      render(
        <Routerino routes={routes} title="Site">
          <div id="routerino-target"></div>
        </Routerino>
      );

      // Validate required tags for most platforms
      const requiredTags = {
        title: document.title,
        description: document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content"),
        ogTitle: document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content"),
        ogDescription: document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute("content"),
        ogImage: document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content"),
      };

      // All required tags should be present
      expect(requiredTags.title).toBeTruthy();
      expect(requiredTags.description).toBeTruthy();
      expect(requiredTags.ogTitle).toBeTruthy();
      expect(requiredTags.ogDescription).toBeTruthy();
      expect(requiredTags.ogImage).toBeTruthy();

      // Content should match
      expect(requiredTags.title).toBe("Shareable Content | Site");
      expect(requiredTags.description).toBe(
        "This content looks great when shared"
      );
      expect(requiredTags.ogImage).toBe("https://example.com/share.jpg");
    });

    it("should handle special characters in meta content", () => {
      const routes = [
        {
          path: "/",
          element: <div>Special</div>,
          title: 'Title with "quotes" & <brackets>',
          description:
            "Description with 'apostrophes' & special chars: < > \" '",
        },
      ];

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const description = document.querySelector('meta[name="description"]');
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );

      // Should properly escape special characters
      expect(description.getAttribute("content")).toContain("apostrophes");
      expect(description.getAttribute("content")).toContain("special chars");
      expect(ogDescription.getAttribute("content")).toBe(
        description.getAttribute("content")
      );
    });
  });
});
