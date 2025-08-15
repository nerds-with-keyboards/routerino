import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Routerino, { useRouterino } from "../routerino.jsx";

describe("Routerino", () => {
  beforeEach(() => {
    // Reset window location
    delete window.location;
    window.location = new URL("http://localhost/");

    // Mock console methods
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  });

  describe("Basic Rendering", () => {
    it("renders matching route", () => {
      const routes = [
        { path: "/", element: <div>Home Page</div> },
        { path: "/about", element: <div>About Page</div> },
      ];

      render(<Routerino routes={routes} />);
      expect(screen.getByText("Home Page")).toBeTruthy();
    });

    it("renders 404 for non-matching route", () => {
      window.location = new URL("http://localhost/unknown");
      const routes = [{ path: "/", element: <div>Home Page</div> }];

      render(<Routerino routes={routes} />);
      expect(screen.getByText(/No page found/)).toBeTruthy();
    });

    it("uses custom notFoundTemplate", () => {
      window.location = new URL("http://localhost/unknown");
      const routes = [{ path: "/", element: <div>Home Page</div> }];
      const notFoundTemplate = <div>Custom 404</div>;

      render(<Routerino routes={routes} notFoundTemplate={notFoundTemplate} />);
      expect(screen.getByText("Custom 404")).toBeTruthy();
    });
  });

  describe("Route Matching", () => {
    it("matches exact paths", () => {
      window.location = new URL("http://localhost/about");
      const routes = [
        { path: "/", element: <div>Home</div> },
        { path: "/about", element: <div>About</div> },
      ];

      render(<Routerino routes={routes} />);
      expect(screen.getByText("About")).toBeTruthy();
    });

    it("matches paths with parameters", () => {
      window.location = new URL("http://localhost/user/123");
      const UserComponent = () => {
        const { params } = useRouterino();
        return <div>User ID: {params.id}</div>;
      };
      const routes = [{ path: "/user/:id", element: <UserComponent /> }];

      render(<Routerino routes={routes} />);
      expect(screen.getByText("User ID: 123")).toBeTruthy();
    });

    it("matches multiple parameters", () => {
      window.location = new URL("http://localhost/blog/2024/hello-world");
      const BlogPost = () => {
        const { params } = useRouterino();
        return (
          <div>
            Year: {params.year}, Slug: {params.slug}
          </div>
        );
      };
      const routes = [{ path: "/blog/:year/:slug", element: <BlogPost /> }];

      render(<Routerino routes={routes} />);
      expect(screen.getByText("Year: 2024, Slug: hello-world")).toBeTruthy();
    });

    it("handles trailing slashes when useTrailingSlash is true", () => {
      window.location = new URL("http://localhost/about/");
      const routes = [{ path: "/about", element: <div>About</div> }];

      render(<Routerino routes={routes} useTrailingSlash={true} />);
      expect(screen.getByText("About")).toBeTruthy();
    });

    it("handles trailing slashes when useTrailingSlash is false", () => {
      window.location = new URL("http://localhost/about/");
      const routes = [{ path: "/about/", element: <div>About</div> }];

      render(<Routerino routes={routes} useTrailingSlash={false} />);
      expect(screen.getByText("About")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("navigates without page reload on click", () => {
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/about">Go to About</a>
            </div>
          ),
        },
        { path: "/about", element: <div>About Page</div> },
      ];

      const { rerender } = render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      fireEvent.click(link);

      expect(pushStateSpy).toHaveBeenCalledWith(
        {},
        "",
        expect.stringMatching(/^http:\/\/localhost(:\d+)?\/about$/)
      );

      // Simulate the state change
      window.location = new URL("http://localhost/about");
      rerender(<Routerino routes={routes} />);
      expect(screen.getByText("About Page")).toBeTruthy();
    });

    it("does not intercept external links", () => {
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="https://example.com">External</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("External");

      // Clicking an external link should not call pushState
      fireEvent.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe("Title Management", () => {
    it("sets document title from route with separator and empty global title", () => {
      const routes = [
        { path: "/", element: <div>Home</div>, title: "Home Page" },
      ];

      render(<Routerino routes={routes} title="" />);
      expect(document.title).toBe("Home Page |");
    });

    it("applies separator and global title", () => {
      const routes = [{ path: "/", element: <div>Home</div>, title: "Home" }];

      render(<Routerino routes={routes} title="My Site" separator=" | " />);
      expect(document.title).toBe("Home | My Site");
    });

    it("does not update title when route has no title", () => {
      const routes = [{ path: "/", element: <div>Home</div> }];

      // Set initial title
      document.title = "Initial Title";

      render(<Routerino routes={routes} title="My Site" />);
      // Title should remain unchanged since route has no title
      expect(document.title).toBe("Initial Title");
    });
  });
});
