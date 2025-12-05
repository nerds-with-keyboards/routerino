import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Image } from "../routerino-image.jsx";

describe("Routerino Image Component", () => {
  it("renders a picture element with correct attributes", () => {
    const { container } = render(
      <Image src="/test-image.jpg" alt="Test image" />
    );

    const picture = container.querySelector("picture");
    expect(picture).toBeTruthy();
    expect(picture.getAttribute("data-routerino-image")).toBe("true");
    expect(picture.getAttribute("data-original-src")).toBe("/test-image.jpg");
  });

  it("generates correct WebP source element", () => {
    const { container } = render(
      <Image src="/test-image.jpg" alt="Test image" />
    );

    const webpSource = container.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeTruthy();

    const srcSet = webpSource.getAttribute("srcSet");
    expect(srcSet).toContain("/test-image-480w.webp 480w");
    expect(srcSet).toContain("/test-image-800w.webp 800w");
    expect(srcSet).toContain("/test-image-1200w.webp 1200w");
    expect(srcSet).toContain("/test-image-1920w.webp 1920w");
  });

  it("generates correct original format srcset on img tag", () => {
    const { container } = render(
      <Image src="/test-image.jpg" alt="Test image" />
    );

    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img.getAttribute("alt")).toBe("Test image");

    const srcSet = img.getAttribute("srcSet");
    expect(srcSet).toContain("/test-image-480w.jpg 480w");
    expect(srcSet).toContain("/test-image-800w.jpg 800w");
    expect(srcSet).toContain("/test-image-1200w.jpg 1200w");
    expect(srcSet).toContain("/test-image-1920w.jpg 1920w");
  });

  it("applies default lazy loading for regular images", () => {
    const { container } = render(
      <Image src="/regular-image.jpg" alt="Regular image" />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("fetchpriority")).toBeNull();
  });

  it("applies eager loading for priority images", () => {
    const { container } = render(
      <Image src="/hero-image.jpg" alt="Hero image" priority={true} />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("fetchpriority")).toBe("high");
  });

  it("auto-detects priority for hero class names", () => {
    const { container } = render(
      <Image src="/banner.jpg" alt="Banner" className="hero-banner" />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("fetchpriority")).toBe("high");
  });

  it("auto-detects priority for full-height class names", () => {
    const { container } = render(
      <Image
        src="/bg.jpg"
        alt="Background"
        className="w-full h-screen object-cover"
      />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("fetchpriority")).toBe("high");
  });

  it("auto-detects priority for hero file names", () => {
    const { container } = render(
      <Image src="/hero-background.jpg" alt="Hero background" />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("fetchpriority")).toBe("high");
  });

  it("passes through className and other HTML attributes", () => {
    const { container } = render(
      <Image
        src="/test.jpg"
        alt="Test"
        className="rounded-lg shadow-md"
        id="test-image"
        data-testid="my-image"
      />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("class")).toBe("rounded-lg shadow-md");
    expect(img.getAttribute("id")).toBe("test-image");
    expect(img.getAttribute("data-testid")).toBe("my-image");
  });

  it("allows custom widths", () => {
    const { container } = render(
      <Image src="/test.jpg" alt="Test" widths={[320, 640, 1280]} />
    );

    const img = container.querySelector("img");
    const srcSet = img.getAttribute("srcSet");
    expect(srcSet).toContain("/test-320w.jpg 320w");
    expect(srcSet).toContain("/test-640w.jpg 640w");
    expect(srcSet).toContain("/test-1280w.jpg 1280w");
    // Should not contain default widths
    expect(srcSet).not.toContain("480w");
    expect(srcSet).not.toContain("800w");
  });

  it("allows custom sizes attribute", () => {
    const { container } = render(
      <Image
        src="/test.jpg"
        alt="Test"
        sizes="(max-width: 640px) 100vw, 640px"
      />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("sizes")).toBe("(max-width: 640px) 100vw, 640px");

    const webpSource = container.querySelector('source[type="image/webp"]');
    expect(webpSource.getAttribute("sizes")).toBe(
      "(max-width: 640px) 100vw, 640px"
    );
  });

  it("sets proper decoding attribute", () => {
    const { container } = render(<Image src="/test.jpg" alt="Test" />);

    const img = container.querySelector("img");
    expect(img.getAttribute("decoding")).toBe("async");
  });

  it("allows override of decoding attribute", () => {
    const { container } = render(
      <Image src="/test.jpg" alt="Test" decoding="sync" />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("decoding")).toBe("sync");
  });
});
