import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import Routerino from "../routerino.jsx";

describe("Deprecation Warnings", () => {
  beforeEach(() => {
    // Reset window location
    delete window.location;
    window.location = new URL("http://localhost/");

    // Mock console
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("warns when titlePrefix is used", () => {
    const warnSpy = vi.spyOn(console, "warn");

    const routes = [{ path: "/", element: <div>Home</div> }];

    render(<Routerino routes={routes} titlePrefix="DEPRECATED - " />);

    expect(warnSpy).toHaveBeenCalledWith(
      "Routerino: titlePrefix is deprecated and will be removed in v2.0. Use the title and separator props instead."
    );
  });

  it("warns when titlePostfix is used", () => {
    const warnSpy = vi.spyOn(console, "warn");

    const routes = [{ path: "/", element: <div>Home</div> }];

    render(<Routerino routes={routes} titlePostfix=" - DEPRECATED" />);

    expect(warnSpy).toHaveBeenCalledWith(
      "Routerino: titlePostfix is deprecated and will be removed in v2.0. Use the title and separator props instead."
    );
  });

  it("warns when both titlePrefix and titlePostfix are used", () => {
    const warnSpy = vi.spyOn(console, "warn");

    const routes = [{ path: "/", element: <div>Home</div> }];

    render(
      <Routerino routes={routes} titlePrefix="PRE - " titlePostfix=" - POST" />
    );

    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("titlePrefix is deprecated")
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("titlePostfix is deprecated")
    );
  });

  it("does not warn when titlePrefix/titlePostfix are not used", () => {
    const warnSpy = vi.spyOn(console, "warn");

    const routes = [{ path: "/", element: <div>Home</div> }];

    render(<Routerino routes={routes} title="My Site" separator=" | " />);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("deprecated props still work correctly", () => {
    const routes = [{ path: "/", element: <div>Home</div>, title: "Page" }];

    render(
      <Routerino routes={routes} titlePrefix="Site - " title="Fallback" />
    );

    expect(document.title).toBe("Site - Page | Fallback");
  });
});
