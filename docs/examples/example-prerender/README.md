# Routerino Prerender Example

This example demonstrates how to set up server-side rendering (prerendering) for search engines while serving a normal SPA to regular users. This gives you the best of both worlds: excellent SEO and a fast, interactive user experience.

## What is Prerendering?

Prerendering is a technique where:

- Regular users get your normal React SPA
- Search engines get fully rendered HTML
- Social media crawlers get proper meta tags for previews

## Features Demonstrated

- Docker setup with Nginx and Prerender service
- Bot detection and routing
- SEO-optimized content delivery
- Social media preview support
- Caching for performance
- Testing prerendered content

## Quick Start

```bash
# Install dependencies
npm install

# For development (without prerendering)
npm run dev

# For production with prerendering:
# 1. Build the app
npm run build

# 2. Build and start Docker containers
npm run docker:up

# 3. View logs
npm run docker:logs

# 4. Visit http://localhost:8082
```

## Testing Prerendering

Test as different user agents to see the difference:

```bash
# As Googlebot (gets prerendered HTML)
curl -H "User-Agent: Googlebot" http://localhost:8082

# As regular user (gets SPA)
curl http://localhost:8082

# As Facebook (gets prerendered HTML with meta tags)
curl -H "User-Agent: facebookexternalhit/1.1" http://localhost:8082
```

## How It Works

1. **Nginx** receives all requests
2. Checks the User-Agent header
3. If it's a bot → proxy to prerender service
4. If it's a user → serve the SPA normally

## Project Structure

```
example-prerender/
├── src/
│   ├── routes.js      # Routes with SEO content
│   ├── main.jsx       # App with prerender setup
│   └── style.css      # Styles
├── index.html         # HTML template
├── vite.config.js     # Vite config
├── Dockerfile         # Web container
├── docker-compose.yml # Service orchestration
├── nginx.conf         # Bot detection & routing
└── package.json       # Dependencies & scripts
```

## Prerender Configuration

The prerender service is configured in `docker-compose.yml`:

- **ALLOWED_DOMAINS**: Which domains to prerender
- **STRIP_JS_USER_AGENTS**: Bots that get JS removed
- **CACHE_MAXAGE**: How long to cache rendered pages
- **LOG_REQUESTS**: Enable detailed logging

## Production Deployment

For production, you would:

1. Use proper domain names instead of localhost
2. Add SSL/TLS certificates
3. Configure proper caching headers
4. Set up monitoring and logging
5. Use a CDN for static assets

See `/docs/deployment/docker.md` for detailed production setup.

## Comparison with Static Generation

| Feature           | Prerendering | Static Generation      |
| ----------------- | ------------ | ---------------------- |
| Dynamic content   | ✅ Yes       | ❌ No                  |
| Build time        | Fast         | Slower with many pages |
| Server required   | ✅ Yes       | ❌ No                  |
| Real-time updates | ✅ Yes       | ❌ Requires rebuild    |
| Hosting cost      | Higher       | Lower                  |

Choose prerendering when you have frequently changing content or user-specific data.
