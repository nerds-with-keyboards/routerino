# Deploying Routerino Prerender to Cloudflare Containers

Cloudflare Containers (public beta 2025) is a new service that runs Docker containers on Cloudflare's global network, providing serverless container deployment with scale-to-zero pricing.

## Prerequisites

- Our prerender Docker setup from `/prerender` directory
- Cloudflare account on a paid plan (required for Containers beta)
- Wrangler CLI installed (`npm install -g wrangler`)

## Overview

We'll deploy our existing prerender container to Cloudflare Containers, which will:

1. Run the prerender service globally at the edge
2. Scale to zero when not in use
3. Automatically scale up based on demand
4. Integrate with Cloudflare's CDN and security features

## Deployment Steps

### Step 1: Prepare the Container

Our existing prerender container should work well, but we may need to optimize it for Cloudflare's requirements:

```bash
cd prerender

# Build the container
docker build -t routerino-prerender .

# Check the image size
docker images routerino-prerender
```

If the image is too large for Cloudflare's limits, consider using the Alpine or Distroless variants documented in `/prerender/Dockerfile.README.md`.

### Step 2: Create Cloudflare Project

```bash
# Create a new directory for Cloudflare deployment
mkdir routerino-cloudflare-container
cd routerino-cloudflare-container

# Initialize a new Wrangler project
wrangler init
```

### Step 3: Configure wrangler.toml

```toml
name = "routerino-prerender"
main = "src/index.js"
compatibility_date = "2025-01-01"

# Container configuration
[[containers]]
binding = "PRERENDER"
image = "routerino-prerender:latest"

# Environment variables for the container
[vars]
ALLOWED_DOMAINS = "yourdomain.com,*.yourdomain.com"
STRIP_JS_USER_AGENTS = "googlebot|bingbot|yandex|yandexbot|baiduspider|duckduckbot|slurp|ia_archiver|applebot|ahrefsbot|seznambot|dotbot|msnbot|semrushbot|blexbot|sogou|exabot"
CACHE_MAXAGE = "3600"
LOG_REQUESTS = "true"

# Route configuration
[[routes]]
pattern = "yourdomain.com/*"
zone_name = "yourdomain.com"
```

### Step 4: Create Worker Script

Create `src/index.js` to handle routing between regular users and bots:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get("User-Agent") || "";

    // Bot detection
    const botPatterns =
      /googlebot|bingbot|yandex|facebookexternalhit|twitterbot|whatsapp|slack|discordbot|linkedinbot|pinterestbot/i;
    const isBot = botPatterns.test(userAgent);

    // For regular users, pass through to origin
    if (!isBot) {
      return fetch(request);
    }

    // For bots, use the prerender container
    try {
      // Call the container binding
      const prerenderResponse = await env.PRERENDER.fetch(
        new Request(
          `http://prerender/?url=${encodeURIComponent(url.toString())}`,
          {
            headers: {
              "User-Agent": userAgent,
              "X-Forwarded-For": request.headers.get("CF-Connecting-IP"),
              "X-Original-URL": url.toString(),
            },
          }
        )
      );

      // Return the prerendered response with caching headers
      return new Response(prerenderResponse.body, {
        status: prerenderResponse.status,
        statusText: prerenderResponse.statusText,
        headers: {
          ...Object.fromEntries(prerenderResponse.headers),
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
          "X-Prerendered": "true",
          "X-Prerender-Service": "cloudflare-containers",
        },
      });
    } catch (error) {
      console.error("Prerender error:", error);
      // Fallback to origin on error
      return fetch(request);
    }
  },
};
```

### Step 5: Deploy to Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Push the container image
# Note: As of 2025, you may need to use Cloudflare's registry
wrangler container:push routerino-prerender

# Deploy the Worker and Container
wrangler deploy
```

### Step 6: Configure DNS

In your Cloudflare dashboard:

1. Navigate to your domain
2. Ensure your DNS records are proxied (orange cloud icon)
3. The Worker will automatically intercept requests

## Testing

### Test Bot Rendering

```bash
# Test as Googlebot
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
     https://yourdomain.com

# Test as regular user
curl https://yourdomain.com
```

### Monitor Performance

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your Worker
3. View Analytics and Logs

## Cost Considerations

Cloudflare Containers pricing (as of 2025 beta):

- Requires paid Cloudflare plan ($20+/month)
- Scale-to-zero: Only pay when containers are running
- Request-based pricing after free tier
- No charges for idle containers

## Advantages Over Self-Hosted

1. **Global Distribution**: Runs at 300+ edge locations
2. **Auto-Scaling**: Handles traffic spikes automatically
3. **Zero Maintenance**: No servers to manage
4. **Integrated CDN**: Built-in caching and DDoS protection
5. **Cost Efficiency**: Pay only for actual usage

## Limitations

1. **Beta Status**: Service is new and may have limitations
2. **Container Size**: May have size restrictions
3. **Runtime Limits**: CPU and memory constraints
4. **Cold Starts**: Initial requests may be slower

## Comparison with Our Docker Setup

| Feature             | Docker Compose (Self-hosted) | Cloudflare Containers |
| ------------------- | ---------------------------- | --------------------- |
| Setup Complexity    | Medium                       | Low                   |
| Maintenance         | High                         | None                  |
| Scaling             | Manual                       | Automatic             |
| Global Distribution | No                           | Yes                   |
| Cost Model          | Fixed (VPS)                  | Usage-based           |
| Control             | Full                         | Limited               |

## Troubleshooting

### Container Won't Deploy

1. Check image size meets requirements
2. Verify wrangler.toml syntax
3. Ensure you're on a paid Cloudflare plan

### Prerendering Not Working

1. Check Worker logs in Cloudflare dashboard
2. Verify bot detection patterns
3. Test container locally first

### Performance Issues

1. Use lighter container variants (Alpine/Distroless)
2. Enable Cloudflare caching
3. Optimize prerender timeout settings

## Migration from Docker Compose

To migrate from our `demo-prerender` setup:

1. The same prerender container can be used
2. Remove Nginx (Cloudflare handles routing)
3. Environment variables move to wrangler.toml
4. No need for docker-compose.yml

## Summary

Cloudflare Containers offers a compelling alternative to self-hosted prerendering:

✅ **When to use**:

- You want global edge deployment
- You prefer serverless architecture
- You need automatic scaling
- You want minimal maintenance

❌ **When to avoid**:

- You need full control over the environment
- You have very specific resource requirements
- You're not ready for beta services
- You're on Cloudflare free plan

The deployment preserves all the SEO benefits of our prerender setup while eliminating infrastructure management.
