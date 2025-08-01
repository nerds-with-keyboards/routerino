import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import Routerino from "../routerino.jsx";

describe("Meta Tag Management", () => {
  beforeEach(() => {
    // Reset window location
    delete window.location;
    window.location = new URL("http://localhost/");

    // Clear all meta tags
    document.querySelectorAll("meta").forEach((tag) => tag.remove());
    document.querySelectorAll("link").forEach((tag) => tag.remove());

    // Mock console
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  });

  it("sets description meta tag from route", () => {
    const routes = [
      {
        path: "/",
        element: <div>Home</div>,
        description: "Welcome to our homepage",
      },
    ];

    render(<Routerino routes={routes} />);

    const descTag = document.querySelector('meta[name="description"]');
    expect(descTag).toBeTruthy();
    expect(descTag.getAttribute("content")).toBe("Welcome to our homepage");
  });

  it("sets og:description from route description", () => {
    const routes = [
      {
        path: "/",
        element: <div>Home</div>,
        description: "Welcome to our homepage",
      },
    ];

    render(<Routerino routes={routes} />);

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    expect(ogDescTag).toBeTruthy();
    expect(ogDescTag.getAttribute("content")).toBe("Welcome to our homepage");
  });

  it("sets custom meta tags from route", () => {
    const routes = [
      {
        path: "/",
        element: <div>Home</div>,
        tags: [
          { property: "og:type", content: "article" },
          { name: "author", content: "John Doe" },
        ],
      },
    ];

    render(<Routerino routes={routes} />);

    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    expect(ogTypeTag.getAttribute("content")).toBe("article");

    const authorTag = document.querySelector('meta[name="author"]');
    expect(authorTag.getAttribute("content")).toBe("John Doe");
  });

  it("sets default og:type to website when no custom tags", () => {
    const routes = [{ path: "/", element: <div>Home</div> }];

    render(<Routerino routes={routes} />);

    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    expect(ogTypeTag).toBeTruthy();
    expect(ogTypeTag.getAttribute("content")).toBe("website");
  });

  it("sets og:image from global imageUrl", () => {
    const routes = [{ path: "/", element: <div>Home</div> }];

    render(
      <Routerino routes={routes} imageUrl="https://example.com/image.jpg" />
    );

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    expect(ogImageTag).toBeTruthy();
    expect(ogImageTag.getAttribute("content")).toBe(
      "https://example.com/image.jpg"
    );
  });

  it("prioritizes route imageUrl over global imageUrl", () => {
    const routes = [
      {
        path: "/",
        element: <div>Home</div>,
        imageUrl: "https://example.com/route-image.jpg",
      },
    ];

    render(
      <Routerino
        routes={routes}
        imageUrl="https://example.com/global-image.jpg"
      />
    );

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    expect(ogImageTag.getAttribute("content")).toBe(
      "https://example.com/route-image.jpg"
    );
  });

  it("sets apple touch icon from touchIconUrl", () => {
    const routes = [{ path: "/", element: <div>Home</div> }];

    render(
      <Routerino routes={routes} touchIconUrl="https://example.com/icon.png" />
    );

    const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    expect(touchIcon).toBeTruthy();
    expect(touchIcon.getAttribute("href")).toBe("https://example.com/icon.png");
  });

  it("sets prerender status code for 404", () => {
    window.location = new URL("http://localhost/nonexistent");
    const routes = [{ path: "/", element: <div>Home</div> }];

    render(<Routerino routes={routes} />);

    const statusTag = document.querySelector(
      'meta[name="prerender-status-code"]'
    );
    expect(statusTag).toBeTruthy();
    expect(statusTag.getAttribute("content")).toBe("404");
  });

  it("does not set prerender tags when usePrerenderTags is false", () => {
    window.location = new URL("http://localhost/nonexistent");
    const routes = [{ path: "/", element: <div>Home</div> }];

    render(<Routerino routes={routes} usePrerenderTags={false} />);

    const statusTag = document.querySelector(
      'meta[name="prerender-status-code"]'
    );
    expect(statusTag).toBeFalsy();
  });
});
