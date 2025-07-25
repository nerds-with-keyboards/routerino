# Routerino Demo - Static Generation

This demo showcases Routerino's static site generation capabilities. Each route is pre-built as a static HTML file with proper meta tags for optimal SEO and performance.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build static HTML files
npm run build:static

# Build everything (HTML + sitemap)
npm run build:all

# Preview production build
npm run preview
```

## Static Generation Features

- Pre-built HTML files for each route
- Optimal SEO with meta tags baked into HTML
- Zero JavaScript for crawlers
- Fast page loads
- Works on any static hosting (Netlify, GitHub Pages, etc.)

## Deployment

This demo is optimized for static hosting:

1. **Build command**: `npm run build:all`
2. **Output directory**: `dist`
3. **No server required** - just static files!

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build:all"
  publish = "dist"

# Note: Do NOT use catch-all redirects with static generation!
# Each route has its own HTML file.
```

### GitHub Pages

```bash
# Build and deploy
npm run build
npm run build:static
npx gh-pages -d dist
```

## How It Works

1. **Build Time**: The build-static script generates HTML files for each route
2. **Meta Tags**: Each HTML file includes proper meta tags from route config
3. **Client Hydration**: React takes over after initial load
4. **SEO Friendly**: Search engines see fully rendered HTML with meta tags

## Features Demonstrated

- Basic routing with SEO optimization
- Dynamic routes with parameters
- Meta tag management
- Static site generation
- Error handling
- Prerendering support
- TypeScript definitions
- Multiple examples and use cases