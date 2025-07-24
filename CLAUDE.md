# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Routerino is a lightweight, SEO-focused React routing library with zero runtime dependencies. It provides client-side routing without page reloads while maintaining excellent SEO through automatic meta tag management and prerender.io support.

## Key Commands

- **Build the library**: `npm run build` - Creates ES and UMD builds in the dist/ directory
- **Run tests**: `npm test` - Runs tests in watch mode with Vitest
- **Run tests once**: `npm test -- --run` - Runs tests without watch mode
- **Test coverage**: `npm run test:coverage` - Runs tests with coverage report
- **Test React versions**: `npm run test:react-versions` - Tests against React 17, 18, and 19
- **Test Node versions**: `npm run test:node-versions` - Shows instructions for testing Node.js versions
- **Run linter**: `npm run lint` - Runs ESLint with auto-fix enabled
- **Install dependencies**: `npm install`
- **Publish to npm**: `npm publish` - Automatically runs build before publishing
- **Generate sitemap**: `routerino-build-sitemap routeFilePath=<path> hostname=<url> outputDir=<dir>`
- **Build static HTML**: `routerino-build-static routesFile=<path> outputDir=<dir> template=<file> baseUrl=<url>`

### Static Site Generation

The library includes two methods for static site generation:

1. **Standalone script**: `routerino-build-static`
   
   Add to your package.json build script:
   ```json
   "build": "vite build && routerino-build-static routesFile=src/routes.js outputDir=dist template=index.html baseUrl=https://example.com"
   ```
   
   Or run directly with npx:
   ```bash
   npx routerino-build-static routesFile=src/routes.js outputDir=dist template=index.html baseUrl=https://example.com
   ```

2. **Vite plugin**: `vite-plugin-routerino-static.js`
   ```javascript
   import { routerinoStatic } from 'routerino/vite-plugin-routerino-static.js';
   
   // In vite.config.js
   plugins: [
     routerinoStatic({
       routesFile: './src/routes.js',
       baseUrl: 'https://example.com',
       globalMeta: { siteName: 'My Site' }
     })
   ]
   ```

Both methods generate static HTML files with proper meta tags for each route, improving SEO and initial page load performance.

## Architecture & Structure

### Single-File Library Design
The entire routing logic is contained in `routerino.jsx` (~420 lines). This design choice prioritizes simplicity and ease of vendoring.

### Core Component: Routerino
The main component handles:
- Route matching using regex patterns with parameter extraction
- Browser history management via History API
- Automatic title and meta tag updates
- 404/error handling with customizable templates (via `notFoundTemplate` prop)
- Trailing slash normalization
- Prerender detection for SEO

### Key Implementation Details

1. **Route Matching**: Uses regex to convert route patterns (e.g., `/user/:id`) into matching expressions
2. **Navigation**: Intercepts link clicks and form submissions to prevent page reloads
3. **Meta Management**: Dynamically updates document head tags based on route configuration
4. **State Management**: Uses React hooks (useState, useEffect) for route state

### Build Configuration

Vite is configured to:
- Build both ES and UMD formats
- Externalize all peer dependencies (react, react-dom, prop-types)
- Entry point: `routerino.jsx`
- Output: `dist/routerino.js` (ES) and `dist/routerino.umd.cjs` (UMD)

## Sitemap Generation

The `build-sitemap.js` script:
- Parses route configurations from JavaScript/JSX files
- Extracts static paths (excludes dynamic routes with parameters like `:id`)
- Generates sitemap.xml and robots.txt files
- Usage: `node build-sitemap.js routeFilePath=./src/routes.js hostname=https://example.com outputDir=./public`

## Development Workflow

1. Make changes to `routerino.jsx`
2. Run `npm test` to verify tests pass
3. **ALWAYS run `npm run lint`** to ensure code style compliance before committing
4. Build with `npm run build` to verify the build process
5. Update version in package.json if needed
6. Commit changes (library is currently at v1.1.10)

## Testing

Tests are written using Vitest and React Testing Library. Test files are located in the `test/` directory:
- `routerino.test.jsx` - Core routing functionality
- `meta-tags.test.jsx` - Meta tag management
- `trailing-slash.test.jsx` - URL normalization
- `error-boundary.test.jsx` - Error boundary component error handling

Navigation tests are currently skipped due to a bug in line 151 of routerino.jsx where `new URL(target)` should be `new URL(target.href)`.

### Error Handling
Routerino includes a built-in error boundary that catches React component errors. When a route component throws an error, it will:
- Display the `errorTemplate` instead of crashing
- Set the document title using `errorTitle` (computed with separator and global title)
- Log detailed error information to console including:
  - The error message and stack trace
  - Component stack trace
  - Failed route path
  - Timestamp
- Set prerender status code to 500 (if enabled)

The ErrorBoundary component has a clean, minimal API that receives pre-computed title strings rather than individual title parts.

### Enhanced Logging
Routerino provides helpful console messages:
- **404 Errors**: Lists available routes and suggests adding a catch-all route
- **Component Errors**: Shows route path, component stack, and timestamp
- **Fatal Router Errors**: Indicates configuration issues
- **Development Warnings**: Alerts about duplicate routes (dev mode only)

### Exported Components
- `Routerino` (default export) - The main routing component
- `ErrorBoundary` (named export) - A reusable error boundary component that can be used independently

## Code Style

ESLint is configured with:
- Standard JavaScript rules
- React plugin with recommended settings
- React in JSX scope is disabled (not needed in modern React)
- PropTypes validation is disabled for test files
- **Important**: Always run `npm run lint` before committing changes

## TypeScript Support

TypeScript definitions are provided in `types/routerino.d.ts`. When making API changes, ensure the type definitions are updated accordingly.

## Dependencies

### Peer Dependencies
The library requires:
- React 17, 18, or 19
- React DOM 17, 18, or 19
- PropTypes 15.8+

These are intentionally peer dependencies to avoid version conflicts and reduce bundle size.

### Node.js Requirement
- Node.js 18+ (due to Vitest/Vite requiring crypto.getRandomValues API)