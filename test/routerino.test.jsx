import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    it("navigates without page reload on click", async () => {
      const user = userEvent.setup();
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

      await user.click(link);

      expect(pushStateSpy).toHaveBeenCalledWith(
        {},
        "",
        expect.stringMatching(/^http:\/\/localhost(:\d+)?\/about$/)
      );

      // Manually restore the spy to ensure test isolation
      pushStateSpy.mockRestore();

      // Simulate the state change
      window.location = new URL("http://localhost/about");
      rerender(<Routerino routes={routes} />);
      expect(screen.getByText("About Page")).toBeTruthy();
    });

    it("does not intercept external links", async () => {
      const user = userEvent.setup();
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
      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();

      // Manually restore the spy to ensure test isolation
      pushStateSpy.mockRestore();
    });
  });

  describe("Link Interception Guards", () => {
    it("does not intercept right-clicks", () => {
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
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      fireEvent.click(link, { button: 2 });

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept ctrl+click", () => {
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
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      fireEvent.click(link, { ctrlKey: true });

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept meta+click (cmd+click on Mac)", () => {
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
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      fireEvent.click(link, { metaKey: true });

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept shift+click", () => {
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
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      fireEvent.click(link, { shiftKey: true });

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept alt+click", () => {
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
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      fireEvent.click(link, { altKey: true });

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links with target=_blank", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/about" target="_blank">
                Go to About
              </a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links with download attribute", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/files/report.pdf" download>
                Download
              </a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Download");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links with rel=external", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/about" rel="external">
                Go to About
              </a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links to PDF files", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/files/report.pdf">View PDF</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("View PDF");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links to ZIP files", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/files/archive.zip">Download ZIP</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Download ZIP");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links to image files", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/images/photo.png">View Image</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("View Image");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links to JSON files", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/data/config.json">View JSON</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("View JSON");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links to XML files", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/feeds/rss.xml">RSS Feed</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("RSS Feed");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links to font files", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/fonts/custom.woff2">Font File</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Font File");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links matching ignorePatterns", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/api/users">API Users</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} ignorePatterns={["/api/"]} />);
      const link = screen.getByText("API Users");

      await user.click(link);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("does not intercept links matching regex in ignorePatterns", async () => {
      const user = userEvent.setup();
      const pushStateSpy = vi.spyOn(window.history, "pushState");
      const routes = [
        {
          path: "/",
          element: (
            <div>
              <a href="/docs/some-file.PDF">View PDF (uppercase)</a>
            </div>
          ),
        },
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("View PDF (uppercase)");

      await user.click(link);

      // The built-in SKIPPED_FILE_EXTENSIONS check is case-insensitive
      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it("still intercepts normal same-origin links", async () => {
      const user = userEvent.setup();
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
      ];

      render(<Routerino routes={routes} />);
      const link = screen.getByText("Go to About");

      await user.click(link);

      expect(pushStateSpy).toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });
  });

  describe("Title Management", () => {
    it("sets document title from route title only when global title is empty", () => {
      const routes = [
        { path: "/", element: <div>Home</div>, title: "Home Page" },
      ];

      render(<Routerino routes={routes} title="" />);
      expect(document.title).toBe("Home Page");
    });

    it("applies separator and global title", () => {
      const routes = [{ path: "/", element: <div>Home</div>, title: "Home" }];

      render(<Routerino routes={routes} title="My Site" separator=" | " />);
      expect(document.title).toBe("Home | My Site");
    });

    it("falls back to global title when route has no title", () => {
      const routes = [{ path: "/", element: <div>Home</div> }];

      render(<Routerino routes={routes} title="My Site" />);
      expect(document.title).toBe("My Site");
    });

    it("does not update title when neither route nor global title are set", () => {
      const routes = [{ path: "/", element: <div>Home</div> }];

      document.title = "Initial Title";

      render(<Routerino routes={routes} title="" />);
      expect(document.title).toBe("Initial Title");
    });

    it("omits separator when only route title is set", () => {
      const routes = [
        { path: "/", element: <div>Home</div>, title: "About Us" },
      ];

      render(<Routerino routes={routes} title="" />);
      expect(document.title).toBe("About Us");
    });

    it("omits separator when only global title is set", () => {
      const routes = [{ path: "/", element: <div>Home</div> }];

      render(<Routerino routes={routes} title="My Site" />);
      expect(document.title).toBe("My Site");
    });
  });
});
