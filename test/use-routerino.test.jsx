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
    global.window = {
      location: {
        href: "http://localhost/test/123",
        pathname: "/test/123",
        search: "",
        host: "localhost",
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
    };
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

    global.window.location.pathname = "/";
    const { rerender } = render(<Routerino routes={routes} />);
    expect(screen.getByText("Current Route: /")).toBeTruthy();

    // Simulate route change
    global.window.location.pathname = "/other";
    global.window.location.href = "http://localhost/other";

    // Force re-render
    rerender(<Routerino routes={routes} key="rerender" />);

    expect(screen.getByText("Current Route: /other")).toBeTruthy();
  });
});
