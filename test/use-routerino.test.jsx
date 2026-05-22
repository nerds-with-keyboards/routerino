import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Routerino, { useRouterino } from "../routerino.jsx";

// Test component that uses the hook
const TestComponent = () => {
  const { currentRoute, params, routePattern, updateHeadTag } = useRouterino();

  return (
    <div>
      <p>Current Route: {currentRoute}</p>
      <p>Route Pattern: {routePattern}</p>
      <p>Params: {JSON.stringify(params)}</p>
      <button onClick={() => updateHeadTag({ name: "test", content: "value" })}>
        Update Meta
      </button>
    </div>
  );
};

// Component that tries to use hook outside router
const BrokenComponent = () => {
  useRouterino(); // This will throw
  return <div>Should not render</div>;
};

describe("useRouterino hook", () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = "";
    document.head.innerHTML = "";

    // Reset window location
    delete window.location;
    window.location = new URL("http://localhost/test/123");

    // Mock history API
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should provide router context to components", () => {
    const routes = [
      {
        path: "/test/:id",
        element: <TestComponent />,
      },
    ];

    render(<Routerino routes={routes} />);

    expect(screen.getByText("Current Route: /test/123")).toBeTruthy();
    expect(screen.getByText("Route Pattern: /test/:id")).toBeTruthy();
    expect(screen.getByText('Params: {"id":"123"}')).toBeTruthy();
  });

  it("should provide updateHeadTag function", () => {
    const routes = [
      {
        path: "/test/:id",
        element: <TestComponent />,
      },
    ];

    render(<Routerino routes={routes} />);

    const button = screen.getByText("Update Meta");
    button.click();

    // Check that meta tag was created
    const metaTag = document.querySelector('meta[name="test"]');
    expect(metaTag).toBeTruthy();
    expect(metaTag.getAttribute("content")).toBe("value");
  });

  it("should create a tag with innerHTML for structured data", () => {
    const StructuredDataComponent = () => {
      const { updateHeadTag } = useRouterino();
      return (
        <button
          onClick={() =>
            updateHeadTag({
              tag: "script",
              type: "application/ld+json",
              innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Test Site",
                url: "https://example.com/",
              }),
            })
          }
        >
          Add Structured Data
        </button>
      );
    };

    const routes = [
      { path: "/test/:id", element: <StructuredDataComponent /> },
    ];

    render(<Routerino routes={routes} />);

    const button = screen.getByText("Add Structured Data");
    button.click();

    const scriptTag = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptTag).toBeTruthy();
    const data = JSON.parse(scriptTag.innerHTML);
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe("Test Site");
  });

  it("should respect soft mode when tag with innerHTML already exists", () => {
    // Pre-create a script tag in the head
    const existingScript = document.createElement("script");
    existingScript.type = "application/ld+json";
    existingScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Original",
    });
    document.head.appendChild(existingScript);

    const OverwriteComponent = () => {
      const { updateHeadTag } = useRouterino();
      return (
        <button
          onClick={() =>
            updateHeadTag({
              tag: "script",
              type: "application/ld+json",
              soft: true,
              innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Overwritten",
              }),
            })
          }
        >
          Try Overwrite
        </button>
      );
    };

    const routes = [{ path: "/test/:id", element: <OverwriteComponent /> }];

    render(<Routerino routes={routes} />);

    const button = screen.getByText("Try Overwrite");
    button.click();

    const scriptTags = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scriptTags.length).toBe(1);
    const data = JSON.parse(scriptTags[0].innerHTML);
    expect(data.name).toBe("Original");
  });

  it("should throw error when used outside Routerino", () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<BrokenComponent />)).toThrow();

    consoleSpy.mockRestore();
  });

  it("should work with nested components", () => {
    const NestedChild = () => {
      const { currentRoute } = useRouterino();
      return <span>Nested: {currentRoute}</span>;
    };

    const ParentComponent = () => (
      <div>
        <h1>Parent</h1>
        <NestedChild />
      </div>
    );

    const routes = [
      {
        path: "/test/:id",
        element: <ParentComponent />,
      },
    ];

    render(<Routerino routes={routes} />);

    expect(screen.getByText("Nested: /test/123")).toBeTruthy();
  });

  it("should update context when route changes", () => {
    const routes = [
      {
        path: "/",
        element: <TestComponent />,
      },
      {
        path: "/other",
        element: <TestComponent />,
      },
    ];

    // Start at root
    delete window.location;
    window.location = new URL("http://localhost/");

    const { rerender } = render(<Routerino routes={routes} />);
    expect(screen.getByText("Current Route: /")).toBeTruthy();

    // Simulate route change
    delete window.location;
    window.location = new URL("http://localhost/other");

    // Force re-render
    rerender(<Routerino routes={routes} key="rerender" />);

    expect(screen.getByText("Current Route: /other")).toBeTruthy();
  });
});
