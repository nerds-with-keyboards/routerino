import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Routerino from "../routerino.jsx";

describe("Error Boundary", () => {
  beforeEach(() => {
    // Reset window location
    delete window.location;
    window.location = new URL("http://localhost/");

    // Mock console
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  });

  it("catches component errors and displays error template", () => {
    const ErrorComponent = () => {
      throw new Error("Test component error");
    };

    const routes = [{ path: "/", element: <ErrorComponent /> }];

    render(<Routerino routes={routes} />);

    // Should show default error template
    expect(screen.getByText(/Page failed to load/)).toBeTruthy();
  });

  it("uses custom error template when component throws", () => {
    const ErrorComponent = () => {
      throw new Error("Test component error");
    };

    const routes = [{ path: "/", element: <ErrorComponent /> }];

    const customErrorTemplate = <div>Custom Error Message</div>;

    render(<Routerino routes={routes} errorTemplate={customErrorTemplate} />);

    expect(screen.getByText("Custom Error Message")).toBeTruthy();
  });

  it("sets error title when component throws", () => {
    const ErrorComponent = () => {
      throw new Error("Test component error");
    };

    const routes = [{ path: "/", element: <ErrorComponent /> }];

    render(<Routerino routes={routes} errorTitle="Error!" title="My Site" />);

    expect(document.title).toBe("Error! | My Site");
  });

  it("logs error to console when component throws", () => {
    const consoleSpy = vi.spyOn(console, "error");
    const consoleGroupSpy = vi.spyOn(console, "group");

    const ErrorComponent = () => {
      throw new Error("Test error");
    };

    const routes = [{ path: "/", element: <ErrorComponent /> }];

    render(<Routerino routes={routes} />);

    // Check that console.group was called with the error boundary message
    expect(consoleGroupSpy).toHaveBeenCalledWith(
      "🚨 Routerino Error Boundary Caught an Error"
    );

    // Check that the error was logged
    expect(consoleSpy).toHaveBeenCalledWith("Error:", expect.any(Error));
    expect(consoleSpy).toHaveBeenCalledWith("Failed Route:", "/");
  });

  it("sets prerender status code when component throws", () => {
    const ErrorComponent = () => {
      throw new Error("Test component error");
    };

    const routes = [{ path: "/", element: <ErrorComponent /> }];

    render(<Routerino routes={routes} usePrerenderTags={true} />);

    const statusTag = document.querySelector(
      'meta[name="prerender-status-code"]'
    );
    expect(statusTag).toBeTruthy();
    expect(statusTag.getAttribute("content")).toBe("500");
  });

  it("renders normally when no error occurs", () => {
    const routes = [{ path: "/", element: <div>Normal content</div> }];

    render(<Routerino routes={routes} />);

    expect(screen.getByText("Normal content")).toBeTruthy();
  });
});
