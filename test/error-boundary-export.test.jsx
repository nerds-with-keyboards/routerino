import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ErrorBoundary } from "../routerino.jsx";

describe("ErrorBoundary Export", () => {
  beforeEach(() => {
    // Mock console
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  });

  it("can be imported as a named export", () => {
    expect(ErrorBoundary).toBeDefined();
    expect(typeof ErrorBoundary).toBe("function");
  });

  it("works independently of Routerino", () => {
    const ErrorComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary
        fallback={<div>Error caught!</div>}
        errorTitleString="Error Test"
      >
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Error caught!")).toBeTruthy();
    expect(document.title).toBe("Error Test");
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary fallback={<div>Error!</div>} errorTitleString="Error">
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal content")).toBeTruthy();
  });

  it("sets prerender tag when usePrerenderTags is true", () => {
    const ErrorComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary
        fallback={<div>Error</div>}
        errorTitleString="Error"
        usePrerenderTags={true}
      >
        <ErrorComponent />
      </ErrorBoundary>
    );

    const statusTag = document.querySelector(
      'meta[name="prerender-status-code"]'
    );
    expect(statusTag).toBeTruthy();
    expect(statusTag.getAttribute("content")).toBe("500");
  });
});
