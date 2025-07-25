# Routerino Demo Site - Prerender Configuration

This is the demo website for Routerino configured with server-side prerendering for optimal SEO and social media sharing. Unlike static generation, this approach renders pages on-demand when crawlers visit.

## Overview

This demo uses a Docker-based architecture with:
- **Nginx**: Serves the SPA and routes bot traffic to the prerender service
- **Prerender Service**: Renders JavaScript pages for search engines and social media bots
- **Vite**: Builds the optimized React application

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Prerendering Setup

### Quick Start with Docker Compose

```bash
# Build the application
npm run build

# Start the prerender stack
npm run prerender:up

# View logs
npm run prerender:logs

# Stop the services
npm run prerender:down
```

The application will be available at:
- **Main site**: http://localhost:8081
- **Prerender service**: http://localhost:3000
- **Prerender health check**: http://localhost:3000/health

### Testing Prerendering

Test that prerendering works for bots:

```bash
# Test as Googlebot
curl -H "User-Agent: googlebot" http://localhost:8081

# Test as regular user (gets the SPA)
curl http://localhost:8081

# Test a specific route as a bot
curl -H "User-Agent: googlebot" http://localhost:8081/docs
```

## Configuration

### Prerender Service Configuration

The prerender service is configured in `docker-compose.yml`:

- **PRERENDER_USER_AGENTS**: Set to `all` to prerender for everyone (improves performance)
- **STRIP_JS_USER_AGENTS**: Only strips JavaScript for search engines (preserves interactivity for users)
- **CACHE_MAXAGE**: Caches rendered pages for 1 hour
- **ALLOWED_DOMAINS**: Restricts which domains can be prerendered

### Nginx Configuration

The `nginx.conf` file handles:
1. Detecting bot traffic
2. Routing bots to the prerender service
3. Serving the SPA to regular users
4. Caching static assets
5. Security headers

Key features:
- Automatic bot detection
- Static asset caching (1 year)
- Gzip compression
- Security headers
- Health check endpoint

## Production Deployment

### Using Docker

1. Build the production image:
```bash
npm run docker:build
```

2. Run with your domain configuration:
```bash
docker run -p 80:80 \
  -e ALLOWED_DOMAINS="yourdomain.com,*.yourdomain.com" \
  routerino-demo-prerender
```

### Using Docker Compose in Production

1. Create a `.env` file:
```env
ALLOWED_DOMAINS=yourdomain.com,*.yourdomain.com
CACHE_MAXAGE=86400
```

2. Deploy:
```bash
docker-compose -f docker-compose.yml up -d
```

### Kubernetes Deployment

See the [prerender service documentation](../prerender/README.md) for Kubernetes deployment examples.

## Monitoring

### Health Checks

- **Nginx**: http://your-domain/health
- **Prerender**: http://your-domain:3000/health

### Logs

```bash
# View all logs
npm run prerender:logs

# View only prerender logs
docker-compose logs -f prerender

# View only nginx logs
docker-compose logs -f web
```

## SEO Benefits

1. **Search Engines**: Get fully rendered HTML with all content
2. **Social Media**: Open Graph and Twitter cards work perfectly
3. **Performance**: Regular users still get the fast SPA experience
4. **Flexibility**: Pages are rendered on-demand, always up-to-date

## Comparison with Static Generation

| Feature | Prerendering | Static Generation |
|---------|-------------|-------------------|
| Build Time | Fast (SPA only) | Slow (all pages) |
| Content Updates | Immediate | Requires rebuild |
| Infrastructure | Requires server | Static hosting |
| Scalability | Horizontal scaling | Unlimited |
| Dynamic Content | Fully supported | Limited |

## Troubleshooting

### Pages not rendering correctly

1. Check prerender logs: `npm run prerender:logs`
2. Ensure your app signals when ready:
   ```javascript
   window.prerenderReady = true;
   ```

### High memory usage

The prerender service uses headless Chrome. Ensure your server has at least 1GB RAM.

### Bot detection not working

Test with exact user agent strings:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:8081
```

## Features Demonstrated

- Server-side prerendering for SEO
- Docker-based deployment
- Nginx configuration for bot detection
- Health monitoring
- Caching strategies
- Security headers
- Dynamic content support