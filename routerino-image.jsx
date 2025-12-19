import React, { useState, useEffect } from "react";
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
    loading: explicitLoading,
    decoding = "async",
    fetchpriority: explicitFetchPriority,
    ...rest
  } = props || {};

  // In development, skip responsive images entirely to avoid 404s
  const isDevelopment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isDevelopment) {
    return (
      <img
        src={src}
        alt={alt}
        loading={explicitLoading || "lazy"}
        decoding={decoding}
        fetchPriority={explicitFetchPriority}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  // Production mode: full responsive image functionality
  // Detect image dimensions to filter applicable widths
  const [imageDimensions, setImageDimensions] = useState(null);

  // Skip dimension detection when not needed
  const shouldDetectDimensions = src && typeof window !== "undefined";

  useEffect(() => {
    if (!shouldDetectDimensions) return;

    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = src;
  }, [src, shouldDetectDimensions]);

  // Filter widths to only include applicable ones (image width >= target width)
  const applicableWidths = imageDimensions
    ? widths.filter((width) => imageDimensions.width >= width)
    : widths; // Fallback to all widths during loading

  // Check which responsive variants actually exist at runtime
  const [availableWidths, setAvailableWidths] = useState(applicableWidths);

  useEffect(() => {
    const checkAvailableVariants = async () => {
      if (typeof window === "undefined") {
        setAvailableWidths(applicableWidths);
        return;
      }

      const base = src.replace(/\.(jpe?g|png|webp)$/i, "");
      const ext = src.match(/\.(jpe?g|png|webp)$/i)?.[0] || ".jpg";

      const existingWidths = [];
      for (const width of applicableWidths) {
        const variantUrl = `${base}-${width}w${ext}`;
        try {
          const response = await fetch(variantUrl, { method: "HEAD" });
          if (response.ok) {
            existingWidths.push(width);
          }
        } catch {
          // Variant doesn't exist, skip it
        }
      }

      // Always include at least the smallest width if no variants exist
      if (existingWidths.length === 0 && applicableWidths.length > 0) {
        existingWidths.push(Math.min(...applicableWidths));
      }

      setAvailableWidths(existingWidths);
    };

    checkAvailableVariants();
  }, [src, applicableWidths]);

  // Smart priority detection if not explicitly set
  const autoPriority = priority ?? shouldUsePriority(src, className);

  // Lighthouse-optimized loading attributes
  const loading = explicitLoading || (autoPriority ? "eager" : "lazy");
  const fetchPriority =
    explicitFetchPriority || (autoPriority ? "high" : undefined);

  // Generate srcsets for different formats using available widths only
  const srcSetWebP = generateSrcSet(src, availableWidths, "webp");
  const srcSetOriginal = generateSrcSet(src, availableWidths);

  // For SSG: This will be processed by routerino-forge.js to include LQIP
  // The data-routerino-image attribute signals to the forge to process this
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
        style={style}
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
  /** Loading behavior (auto-set based on priority) */
  loading: PropTypes.oneOf(["lazy", "eager"]),
  /** Decode timing */
  decoding: PropTypes.oneOf(["sync", "async", "auto"]),
  /** Fetch priority (auto-set based on priority) */
  fetchpriority: PropTypes.oneOf(["high", "low", "auto"]),
};

export default Image;
