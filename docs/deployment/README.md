# Routerino Deployment Guide

This guide covers deployment strategies for Routerino applications across various platforms.

## Deployment Strategies

Routerino supports two main deployment approaches:

### 1. Static Site Generation (SSG)

Best for content-focused sites with good SEO requirements and static hosting.

**Pros:**

- Free hosting options (GitHub Pages, Netlify, Vercel)
- Excellent performance (pre-rendered HTML)
- Perfect SEO (all content in HTML)
- Simple infrastructure

**Cons:**

- Requires rebuild for content changes
- No dynamic content
- Build time increases with route count

**Platforms:**

- [Netlify](./netlify.md)
- [Vercel](./vercel.md)
- [GitHub Pages](./github-pages.md)
- [Cloudflare Pages](./cloudflare-pages.md)

### 2. Client-Side Rendering with Prerendering (CSR + SSR)

Best for dynamic applications that still need SEO.

**Pros:**

- Dynamic content support
- Instant updates
- Good SEO with prerendering
- Flexible architecture

**Cons:**

- Requires server infrastructure
- More complex setup
- Higher operational costs

**Platforms:**

- [Docker + Any VPS](./docker.md)
- [AWS (EC2/ECS)](./aws.md)
- [Google Cloud Run](./google-cloud.md)
- [DigitalOcean](./digitalocean.md)

### 3. Using Prerender.io Service

[Prerender.io](https://prerender.io) provides a hosted prerendering service that works with any hosting platform.

**How it works:**

- Deploy your SPA to any static host (Netlify, Vercel, etc.)
- Configure your web server or CDN to proxy crawler requests to Prerender.io
- Prerender.io renders your JavaScript and returns static HTML to crawlers

**Pros:**

- Works with any hosting platform
- No infrastructure to manage
- Automatic caching and updates
- Built-in crawler detection

**Cons:**

- Additional service cost
- Adds external dependency
- Requires middleware configuration

**Pricing:** Check [current pricing](https://prerender.io/pricing) - typically includes:

- Free tier with limited requests
- Paid tiers based on page renders/month
- Enterprise options available

**Integration Examples:**

**Netlify (\_redirects or netlify.toml):**

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "https://service.prerender.io/YOUR_NETLIFY_URL/:splat"
  status = 200
  conditions = {User-Agent = ["googlebot", "bingbot", "yandex", "facebookexternalhit", "twitterbot"]}
```

**Vercel (middleware.js):**

```javascript
// middleware.js
export function middleware(request) {
  const url = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // Bot detection
  const bots =
    /googlebot|bingbot|yandex|facebookexternalhit|twitterbot|whatsapp|slack|discord/i;

  if (bots.test(userAgent)) {
    return Response.redirect(
      `https://service.prerender.io/${url.protocol}//${url.host}${url.pathname}${url.search}`
    );
  }
}

export const config = {
  matcher: "/((?!api|_next/static|favicon.ico).*)",
};
```

**Cloudflare Workers:**

```javascript
addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const userAgent = request.headers.get("User-Agent") || "";

  if (
    /googlebot|bingbot|yandex|facebookexternalhit|twitterbot/i.test(userAgent)
  ) {
    event.respondWith(fetch(`https://service.prerender.io/${url}`));
  }
});
```

### 4. Container-Based Deployment (New for 2025)

Deploy our `prerender` Docker container to modern container platforms or any VPS.

**[Cloudflare Containers](https://developers.cloudflare.com/containers/)** (public beta 2025) - Run Docker containers on Cloudflare's global network:

**Pros:**

- Edge deployment (runs close to users globally)
- Scale to zero pricing
- No infrastructure management
- Integrated with Workers
- Built on Durable Objects

**Cons:**

- Beta service (new in 2025)
- Some initial limitations
- Requires paid Cloudflare plan

**Other Container Platforms:**

- Google Cloud Run
- AWS App Runner
- Azure Container Instances
- Fly.io
- Railway.app

See [Cloudflare Containers Deployment Guide](./cloudflare-containers.md) for deploying our prerender container.

## Quick Decision Guide

Choose **Static Generation** if:

- Your content changes infrequently
- You want free/cheap hosting
- SEO is critical
- You have < 1000 routes

Choose **Self-Hosted Prerendering** if:

- You want full control over infrastructure
- You have DevOps expertise
- You need custom caching rules
- Cost optimization at scale is important

Choose **Prerender.io Service** if:

- You want prerendering without infrastructure
- You need quick setup
- You prefer managed services
- You have dynamic content that needs SEO

Choose **Container Platforms** if:

- You want serverless container deployment
- You need edge computing benefits
- You prefer pay-per-request pricing
- You have containerized your prerender setup

## Platform Comparison

| Platform              | Static | Self-Hosted Prerender | Container Runtime | Prerender.io Compatible | Free Tier     | Custom Domain | SSL |
| --------------------- | ------ | --------------------- | ----------------- | ----------------------- | ------------- | ------------- | --- |
| Netlify               | ✅     | ❌                    | ❌                | ✅                      | Yes           | Yes           | ✅  |
| Vercel                | ✅     | ✅\*                  | ❌                | ✅                      | Yes           | Yes           | ✅  |
| GitHub Pages          | ✅     | ❌                    | ❌                | ❌\*\*                  | Yes           | Yes           | ✅  |
| Cloudflare Pages      | ✅     | ❌                    | ❌                | ✅                      | Yes           | Yes           | ✅  |
| Cloudflare Containers | ❌     | ❌                    | ✅\*\*\*\*        | ❌                      | Limited       | Yes           | ✅  |
| AWS                   | ✅     | ✅                    | ✅                | ✅                      | Limited       | Yes           | ✅  |
| Google Cloud          | ✅     | ✅                    | ✅                | ✅                      | Limited       | Yes           | ✅  |
| DigitalOcean          | ✅     | ✅                    | ✅                | ✅                      | No            | Yes           | ✅  |
| Prerender.io          | N/A    | N/A                   | N/A               | ✅                      | Limited\*\*\* | N/A           | N/A |

\*Vercel uses Edge Functions/Middleware instead of traditional server prerendering
**GitHub Pages doesn't support server-side redirects needed for Prerender.io \***Prerender.io offers limited free tier (check current limits)
\*\*\*\*Cloudflare Containers is a new service in public beta (2025)

## Before You Deploy

1. **Build Your Application**

   ```bash
   npm run build
   ```

2. **For Static Sites - Generate HTML**

   ```bash
   npm run build:static
   npm run build:sitemap
   ```

3. **Test Locally**

   ```bash
   npm run preview
   ```

4. **Verify SEO**
   - Check meta tags are rendering
   - Test with curl as Googlebot
   - Validate Open Graph tags

## Next Steps

Choose your deployment strategy and platform, then follow the specific guide for detailed instructions.
