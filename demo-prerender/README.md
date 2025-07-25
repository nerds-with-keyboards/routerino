# Routerino Prerender Demo

This demo shows how to deploy a Routerino app with prerendering for optimal SEO using Docker Compose.

## Architecture

This demo uses two containers:

1. **Web container** (`Dockerfile`) - Nginx serving the built Routerino app
2. **Prerender container** (`../prerender/Dockerfile`) - The prerender.io service for SEO

The prerender service is shared with the main project - we don't duplicate it here.

## Quick Start

```bash
# Build and start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Visit http://localhost:8081
```

## How It Works

1. When regular users visit, Nginx serves the SPA directly
2. When search engines visit, Nginx proxies to the prerender service
3. The prerender service renders the JavaScript and returns static HTML

## Files

- `Dockerfile` - Builds the demo web app only
- `docker-compose.yml` - Orchestrates both web and prerender services
- `nginx.conf` - Configures bot detection and prerender proxy
- `../prerender/` - The actual prerender service (shared)

## Testing SEO

```bash
# Test as Googlebot (should get prerendered HTML)
curl -H "User-Agent: Googlebot" http://localhost:8081

# Test as regular user (should get SPA)
curl http://localhost:8081
```

## Production Deployment

See `/docs/deployment/docker.md` for production deployment guidelines.