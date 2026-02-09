import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Routerino Image - Lighthouse 100/100 optimized image component
 *
 * Features:
 * - Automatic responsive image generation with WebP format
 * - Built-in LQIP (Low Quality Image Placeholder) for smooth loading
 * - Smart priority detection for above-the-fold images
 * - Zero configuration - perfect defaults for Lighthouse scores
 * - Full Tailwind/DaisyUI compatibility
 *
 * @example
 * // Hero image (automatically gets priority)
 * <Image src="/hero.jpg" alt="Hero" className="w-full h-screen object-cover" />
 *
 * // Regular image
 * <Image src="/photo.jpg" alt="Nice photo" className="rounded-xl shadow-lg" />
 *
 * // Explicit priority control
 * <Image src="/above-fold.jpg" alt="Important" priority={true} />
 */

// Perfect defaults for Lighthouse 100/100
const DEFAULT_WIDTHS = [480, 800, 1200, 1920];
const DEFAULT_SIZES =
  "(max-width: 480px) 100vw, (max-width: 800px) 800px, (max-width: 1200px) 1200px, 1920px";

// Module-level cache for HEAD request results so remounts don't re-fetch
const variantCache = new Map();

// Smart priority detection for common patterns
function shouldUsePriority(src, className = "") {
  const srcLower = src.toLowerCase();
  const classLower = className.toLowerCase();

  // Common hero/banner patterns
  if (srcLower.includes("hero") || srcLower.includes("banner")) return true;
  if (classLower.includes("hero") || classLower.includes("banner")) return true;

  // Full viewport height images (likely above fold)
  if (classLower.includes("h-screen") || classLower.includes("h-full"))
    return true;

  return false;
}

// Generate srcset for responsive images
function generateSrcSet(src, widths, format = null) {
  const base = src.replace(/\.(jpe?g|png|webp)$/i, "");
  const extension = format
    ? `.${format}`
    : src.match(/\.(jpe?g|png|webp)$/i)?.[0] || ".jpg";

  return widths
    .map((width) => `${base}-${width}w${extension} ${width}w`)
    .join(", ");
}

export function Image(props) {
  const {
    src = "",
    alt = "",
    priority,
    widths = DEFAULT_WIDTHS,
    sizes = DEFAULT_SIZES,
    className = "",
    style = {},
    width: explicitWidth,
    height: explicitHeight,
    loading: explicitLoading,
    decoding = "async",
    fetchpriority: explicitFetchPriority,
    ...rest
  } = props || {};

  const isServer = typeof window === "undefined";

  // Detect real browser dev environment vs SSG with a mocked window.
  // During SSG, routerino-forge mocks `window` with hostname "localhost",
  // but its `document.createElement` returns plain objects, not real DOM nodes.
  // Checking `instanceof HTMLElement` distinguishes a real browser from a mock.
  const isRealBrowser =
    !isServer &&
    typeof document !== "undefined" &&
    typeof HTMLElement !== "undefined" &&
    document.createElement("div") instanceof HTMLElement;

  const isDevelopment =
    isRealBrowser &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Smart priority detection if not explicitly set (used by all render paths)
  const autoPriority = priority ?? shouldUsePriority(src, className);

  // Lighthouse-optimized loading attributes
  const loading = explicitLoading || (autoPriority ? "eager" : "lazy");
  const fetchPriority =
    explicitFetchPriority || (autoPriority ? "high" : undefined);

  // --- All hooks are called unconditionally, before any early returns ---

  // Detect natural image dimensions (client-only, production-only)
  const [imageDimensions, setImageDimensions] = useState(null);

  useEffect(() => {
    if (!isRealBrowser || isDevelopment || !src) return;

    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = src;
  }, [src, isRealBrowser, isDevelopment]);

  // Memoize applicableWidths so the reference is stable and doesn't
  // cause the downstream useEffect to re-run on every render
  const applicableWidths = useMemo(() => {
    if (!imageDimensions) return widths;
    return widths.filter((w) => imageDimensions.width >= w);
  }, [imageDimensions, widths]);

  // Check which responsive variants actually exist at runtime (with caching)
  const [availableWidths, setAvailableWidths] = useState(null);

  useEffect(() => {
    if (!isRealBrowser || isDevelopment) return;

    let cancelled = false;

    const checkAvailableVariants = async () => {
      const base = src.replace(/\.(jpe?g|png|webp)$/i, "");
      const ext = src.match(/\.(jpe?g|png|webp)$/i)?.[0] || ".jpg";

      const existingWidths = [];
      for (const width of applicableWidths) {
        const variantUrl = `${base}-${width}w${ext}`;

        // Check module-level cache first
        if (variantCache.has(variantUrl)) {
          if (variantCache.get(variantUrl)) {
            existingWidths.push(width);
          }
          continue;
        }

        try {
          const response = await fetch(variantUrl, { method: "HEAD" });
          variantCache.set(variantUrl, response.ok);
          if (response.ok) {
            existingWidths.push(width);
          }
        } catch {
          variantCache.set(variantUrl, false);
        }
      }

      if (cancelled) return;
      setAvailableWidths(
        existingWidths.length > 0 ? existingWidths : applicableWidths
      );
    };

    checkAvailableVariants();

    return () => {
      cancelled = true;
    };
  }, [src, applicableWidths, isRealBrowser, isDevelopment]);

  // Resolve final widths: use availableWidths once known, else applicableWidths
  const finalWidths = availableWidths ?? applicableWidths;

  // Dimension attributes for CLS prevention
  const dimensionProps = {};
  if (explicitWidth != null) dimensionProps.width = explicitWidth;
  if (explicitHeight != null) dimensionProps.height = explicitHeight;
  if (imageDimensions && explicitWidth == null && explicitHeight == null) {
    dimensionProps.width = imageDimensions.width;
    dimensionProps.height = imageDimensions.height;
  }

  // Protective default styles: ensure width/height HTML attributes act as CLS
  // hints only, never overriding CSS-driven layouts (Tailwind classes, etc.).
  // height:auto lets constrained-width images scale proportionally.
  // max-width:100% prevents images from exceeding their container.
  // User's style prop is spread last so it can override any default.
  const imgStyle = {
    maxWidth: "100%",
    height: "auto",
    ...style,
  };

  // --- Render paths (after all hooks) ---

  // In development, skip responsive images entirely to avoid 404s
  if (isDevelopment) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        className={className}
        style={imgStyle}
        {...dimensionProps}
        {...rest}
      />
    );
  }

  // Server-side render path
  if (isServer) {
    return (
      <picture data-routerino-image="true" data-original-src={src}>
        <source
          srcSet={generateSrcSet(src, widths, "webp")}
          type="image/webp"
          sizes={sizes}
        />
        <img
          src={src}
          alt={alt}
          srcSet={generateSrcSet(src, widths)}
          sizes={sizes}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          className={className}
          style={imgStyle}
          {...dimensionProps}
          {...rest}
        />
      </picture>
    );
  }

  // Production client render
  const srcSetWebP = generateSrcSet(src, finalWidths, "webp");
  const srcSetOriginal = generateSrcSet(src, finalWidths);

  return (
    <picture data-routerino-image="true" data-original-src={src}>
      <source srcSet={srcSetWebP} type="image/webp" sizes={sizes} />
      <img
        src={src}
        alt={alt}
        srcSet={srcSetOriginal}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        className={className}
        style={imgStyle}
        {...dimensionProps}
        {...rest}
      />
    </picture>
  );
}

Image.propTypes = {
  /** Image source URL (required) */
  src: PropTypes.string.isRequired,
  /** Alt text for accessibility (required) */
  alt: PropTypes.string.isRequired,
  /** Override lazy loading for hero/LCP images */
  priority: PropTypes.bool,
  /** Responsive widths to generate (defaults to [480, 800, 1200, 1920]) */
  widths: PropTypes.arrayOf(PropTypes.number),
  /** Responsive sizes attribute (has smart default) */
  sizes: PropTypes.string,
  /** CSS classes (Tailwind/DaisyUI ready) */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object,
  /** Explicit width for CLS prevention */
  width: PropTypes.number,
  /** Explicit height for CLS prevention */
  height: PropTypes.number,
  /** Loading behavior (auto-set based on priority) */
  loading: PropTypes.oneOf(["lazy", "eager"]),
  /** Decode timing */
  decoding: PropTypes.oneOf(["sync", "async", "auto"]),
  /** Fetch priority (auto-set based on priority) */
  fetchpriority: PropTypes.oneOf(["high", "low", "auto"]),
};

export default Image;
