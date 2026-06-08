# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2026-06-08

### Removed

- `<Image>` component removed. Standard `<img>` tags with [`vite-plugin-image-optimizer`](https://github.com/FatehAK/vite-plugin-image-optimizer) are now recommended for image processing. All forge image optimization code (`processRouterInoImages`, ffmpeg integration, LQIP, responsive variant generation) has been removed. See `## Image Optimization` in README for migration guide.

### Added

- `nonBlockingCss` option for `routerinoForge` (default: `true`): Transforms `<link rel="stylesheet">` tags into non-blocking CSS loading with preload hints, `media="print" onload` pattern, and `<noscript>` fallback. Can be disabled by setting `nonBlockingCss: false`

### Fixed

- `render()` returned `undefined` when `App` component threw during SSR, causing build crashes. Now falls back to route-only rendering gracefully
- `updateHeadTag()` selector crash when tag attribute values contain `]` (e.g., JSON-LD array brackets). Values are now CSS-escaped. `children` is automatically mapped to `innerHTML` to prevent React JSX conventions from leaking into CSS selectors
- `ErrorBoundary` properly logs component errors with full stack traces when `<ErrorBoundary debug={true}>` or `<Routerino debug={true}>`

## [2.5.0] - 2026-05-22

### Changed

- Title logic: Separator is now conditionally included in `document.title`. When route title is empty, the global title is used as fallback with no separator. When global title is empty, only the route title is shown without trailing separator. Error/404 pages follow the same rule.

### Added

- SPA click guards: Routerino now skips interception for:
  - Non-left clicks (right-click, middle-click)
  - Modified clicks (Ctrl/Cmd+click, Shift+click, Alt+click)
  - Links with `target="_blank"`
  - Links with the `download` attribute
  - Links with `rel="external"`
  - Events where `defaultPrevented` is already `true`
- File extension skip list: Same-origin links to common file types (`.pdf`, `.zip`, `.png`, `.jpg`, `.mp4`, `.json`, `.xml`, `.csv`, `.txt`, `.woff2`, `.ttf`, `.epub`, `.wasm`, and many more) are now handled natively by the browser instead of being intercepted by the SPA router
- `ignorePatterns` prop: New prop accepting an array of regex pattern strings. Any same-origin link whose href matches a pattern will bypass the SPA router and be handled natively by the browser
- New `ignorePatterns` TypeScript definition
- New `ignorePatterns` PropTypes validation
- Comprehensive test coverage for all click guards, file extension skips, and ignore patterns
- `innerHTML` support in `HeadTag`: New `innerHTML` property enables tags with body content (e.g., `<script type="application/ld+json">`) in both runtime `updateHeadTag` and SSG forge plugin. Enables structured data (JSON-LD), inline styles, and other non-self-closing head tags.

## [2.4.0] - 2026-05-20

### Added

- Hash link support: SPA navigation to `/page#section` now waits for React to render, then finds the matching element by `id` and scrolls it into view (falls back to scroll-to-top if not found)
- README: Documented hash link behavior and `scroll-margin-top` CSS solution for sticky headers

## [2.3.4] - 2025-12-20

### Added

- Image Component: Added as named export for cleaner imports - `import { Routerino, Image } from 'routerino'`

## [2.3.3] - 2025-12-18

### Changed

- Image Component: Skip optimizations during development.

## [2.3.2] - 2025-12-17

### Fixed

- Image Component: Fixed issue where browser would attempt to load non-existent responsive image variants when using the component outside of SSG or when forge processing failed. The component now only generates srcsets during SSG processing, preventing 404 errors for inapplicable image sizes.

## [2.3.1] - 2025-12-05

### Changed

- Image Component: Optimized responsive image generation to only process applicable widths for each image.

## [2.3.0] - 2025-12-04

### Added

- Image Component (`routerino/image`): Optimized images with zero configuration
  - Automatic responsive image generation (480, 800, 1200, 1920px widths)
  - WebP format with fallbacks for maximum compatibility
  - Low Quality Image Placeholders (LQIP) to prevent layout shift
  - Smart priority detection for hero/LCP images (auto-sets `loading="eager"` and `fetchpriority="high"`)
  - As always, included TypeScript definitions and test coverage
  - Image processing requires FFmpeg available in path

### Changed

- Routerino Forge: Removed old LQIP processing, now only processes `<Image>` components opt-in
- Updated package.json exports to include the new Image component

## [2.2.4] - 2025-11-27

### Changed

- Support multiple export patterns (default export, named export, nested default.App)
- Enhanced document/window mocking for better SSG
- Build time image placeholder compression now shows decimal percentages (e.g., 96.65%) instead of rounding to integers

## [2.2.3] - 2025-10-28

### Added

- Routerino Forge now supports full App component layouts during static site generation, allowing headers, footers, navigation, and other shared UI components to be included in SSG builds instead of rendering only individual route components. This helps ensure consistency in SEO scans

## [2.2.2] - 2025-10-23

### Changed

- Updated development dependencies (ESLint, Vite, Vitest, React, etc.)
- Updated Volta Node.js version to 22.21.0 and npm to 10.9.4
- Improved test infrastructure with userEvent for async handling

## [2.2.1] - 2025-08-26

### Fixed

- SSG no longer runs during development mode

### Changed

- Escape meta tags using auto quotation-mark-selection or smart quotes (instead of HTML entities) if needed for better SERP display
- Added LCP optimization resource to Additional Resources section
- Routerino Forge
  - Improved root div detection to support divs with attributes (style, class, etc.)
  - Added security check to prevent accessing files outside output directory
  - Images now start with `opacity: 0` to hide broken icon during load
  - Images now processed in batches of 10 to optimize memory for large HTML files

## [2.2.0] - 2025-08-18

### Added

- Image optimization in Routerino Forge: Automatic blur placeholders with ffmpeg, smart caching, LQIP technique
- Custom meta tags in SSG: Route-specific tags array now included in static builds
- baseUrl validation: PropTypes enforcement to prevent trailing slashes
- Improved documentation: TypeScript usage, image optimization requirements, baseUrl validation rules
- Console statement prefixes: All console output now prefixed with [Routerino] or [Routerino Forge]

### Changed

- usePrerenderTags default: Now `false` by default (SSG is preferred over prerender tags)
- Image processing: Wraps images in span with blur background, leaving original img untouched for clean hydration
- React 18+ examples: Updated to use `createRoot` API
- ErrorBoundary props documentation
- Better documentation of router state access via `useRouterino` hook
- URL handling: Now uses allow-list approach for HTTP/HTTPS and relative URLs only
- Debug logging: Enhanced with better formatting and route matching details

### Fixed

- Custom tags from routes now properly render in static HTML
- Broken "default props" link in README
- PropTypes peer dependency requirement documented
- Soft update semantics: Now correctly creates missing tags even when soft=true
- Build warning about mixed exports: Added named export for Routerino alongside default export

## [2.1.0] - 2025-08-14

### Added

- **Routerino Forge** (`routerino/forge`)
  - Static site generation at build time with Vite
  - Dual file generation for URL compatibility (both `/path` and `/path/` work)
  - Canonical URL support with `useTrailingSlash` option
  - Automatic prerender.io 301 redirects for non-canonical URLs
  - Canonical and og:url meta tags on all pages
  - Generation of sitemap.xml with proper XML schema
  - Generation of robots.txt with sitemap reference
  - Test suite for Forge build output validation
- Canonical URL meta tags in live CSR routes (Routerino component)
- Optional `baseUrl` prop for Routerino component to override `window.location.origin` for canonical URL
- Node.js 24 support in test matrix

### Changed

- Improved TypeScript `RouteConfig` types
- Script `build-sitemap.js` now integrated into Forge
- No longer testing React 17

### Fixed

- Syntax issue where `new URL(target)` was used instead of `new URL(target.href)`

## [2.0.0] - 2025-08-02

### Breaking Changes

- Removed props-based API - Components no longer receive router props directly
- Removed deprecated fields from router state
- Components must now use `useRouterino()` hook to access router state

### Added

- New `useRouterino()` hook for accessing router state and methods
- Hook provides: `currentRoute`, `params`, `routePattern`, `updateHeadTag`

### Changed

- Updated all tests to use the new hook API
- Updated TypeScript definitions to reflect new API

### Removed

- Props injection into route components (use `useRouterino()` instead)
- Deprecated router state fields
- `titlePrefix` and `titlePostfix` props (use `title` and `separator` instead)

### Migration Guide

Before:

```jsx
function MyComponent(props) {
  return <div>Current route: {props.routerino.currentRoute}</div>;
}
```

After:

```jsx
import { useRouterino } from "routerino";

function MyComponent() {
  const { currentRoute } = useRouterino();
  return <div>Current route: {currentRoute}</div>;
}
```

## [1.2.0] - 2025-07-31

### Added

- Static site generation via `routerino-build-static` command
- Support for React 17 (previously 18/19 only)
- ErrorBoundary component export for custom error handling

### Changed

- Extended React peer dependencies to include v17
- Improved error messages with actionable suggestions
- Updated TypeScript definitions

### Deprecated

- `titlePrefix` and `titlePostfix` props (use `title` and `separator` instead)

### Fixed

- Navigation bug where `new URL(target)` should be `new URL(target.href)`

## [1.1.10] - 2025-07-25

### Added

- Test infrastructure with Vitest
- React Testing Library integration
- Comprehensive test coverage

### Changed

- Updated dependencies
- Improved build process
- Sitemap generation now creates robots.txt automatically if not present

## [1.1.9] - 2024-05-23

### Changed

- Upgraded packages and peer dependencies

## [1.1.8] - 2024-01-23

### Fixed

- Bug fixes for new title prop functionality

## [1.1.7] - 2024-10-13

### Changed

- Minor updates and optimizations

## [1.1.6] - 2024-10-13

### Changed

- Package structure improvements

## [1.1.5] - 2024-10-08

### Changed

- Build process enhancements

## [1.1.4] - 2024-10-08

### Fixed

- Minor bug fixes

## [1.1.3] - 2024-10-08

### Changed

- Code cleanup and optimizations

## [1.1.2] - 2024-10-08

### Changed

- Documentation updates

## [1.1.1] - 2024-10-08

### Changed

- Documentation updates
- README improvements

## [1.1.0] - 2024-10-07

### Added

- TypeScript types and exports
- ESLint configuration
- GitHub Actions for CI/CD
- Site icon support
- Scroll to top on route change
- Debug option and messages
- robots.txt generation with sitemap

### Changed

- Improved click handling and link processing
- Enhanced origin and host checking
- Updated routing logic for same-host navigation
- Better handling of route parameters
- Improved og:title generation
- Removed defaultProps in favor of default arguments

### Fixed

- Various error handling improvements
- Code cleanup and reduced nesting

## [1.0.3] - 2023-10-31

### Changed

- Updated og:title generation to limit max characters

## [1.0.2] - 2023-10-31

### Changed

- Small update to og:title generation

## [1.0.1] - 2023-09-27

### Changed

- Updated Node.js version limit

## [1.0.0] - 2023-09-27

### Added

- Initial release of Routerino
- Core routing functionality
- SEO meta tag management
- Sitemap generation
- Basic documentation

[2.0.1]: https://github.com/nerds-with-keyboards/routerino/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/nerds-with-keyboards/routerino/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.10...v1.2.0
[1.1.10]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.9...v1.1.10
[1.1.9]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.8...v1.1.9
[1.1.8]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.7...v1.1.8
[1.1.7]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.6...v1.1.7
[1.1.6]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nerds-with-keyboards/routerino/releases/tag/v1.0.0
