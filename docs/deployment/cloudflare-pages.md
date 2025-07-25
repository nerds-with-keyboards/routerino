# Deploying Routerino to Cloudflare Pages

Cloudflare Pages offers unlimited bandwidth, global CDN, and excellent performance for static sites.

## Prerequisites

- Cloudflare account (free)
- GitHub or GitLab account
- Routerino app with static generation

## Deployment Methods

### Method 1: Git Integration (Recommended)

#### Step 1: Prepare Your Repository

1. Configure build scripts in `package.json`:

   ```json
   {
     "scripts": {
       "build": "vite build",
       "build:static": "routerino-build-static routesFile=src/routes.jsx outputDir=dist template=dist/index.html baseUrl=https://your-project.pages.dev",
       "build:sitemap": "routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://your-project.pages.dev outputDir=dist",
       "build:all": "npm run build && npm run build:static && npm run build:sitemap"
     }
   }
   ```

2. Commit and push your code:
   ```bash
   git add .
   git commit -m "Setup for Cloudflare Pages"
   git push
   ```

#### Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "Workers & Pages" → "Create application" → "Pages"
3. Connect to Git:
   - Select your Git provider
   - Authorize Cloudflare
   - Choose your repository

4. Configure build settings:
   - **Production branch**: main
   - **Build command**: `npm run build:all`
   - **Build output directory**: `dist`
   - **Node.js version**: 18 (in environment variables)

5. Click "Save and Deploy"

### Method 2: Direct Upload (Wrangler CLI)

1. Install Wrangler:

   ```bash
   npm install -g wrangler
   ```

2. Build your project:

   ```bash
   npm run build:all
   ```

3. Deploy:

   ```bash
   wrangler pages deploy dist --project-name=your-project-name
   ```

4. First deployment creates the project, subsequent deployments update it.

### Method 3: Drag and Drop

1. Build locally:

   ```bash
   npm run build:all
   ```

2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Direct Upload"
4. Drag your `dist` folder to the upload area
5. Click "Deploy site"

## Configuration

### Build Configuration

Create `wrangler.toml` (optional, for local development):

```toml
name = "your-routerino-app"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
```

### Environment Variables

Set in Pages project settings:

- **Build variables**:

  ```
  NODE_VERSION=18
  NODE_ENV=production
  ```

- **Preview variables** (different values for preview deployments):
  ```
  VITE_API_URL=https://staging-api.example.com
  ```

### Custom Domain

1. Go to your Pages project → "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain
4. Update DNS records as instructed
5. SSL certificates are automatic

## Headers and Redirects

Create `_headers` file in your `public` directory:

```
# public/_headers
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

For redirects, create `_redirects`:

```
# public/_redirects
# Old URLs to new (if needed for migration)
/old-about /about 301
```

**Important**: Don't add SPA catch-all redirects since we're using static generation.

## Advanced Features

### Cloudflare Workers Integration

Add edge computing capabilities with Workers:

1. Create `functions` directory in project root
2. Add edge function:

```javascript
// functions/api/hello.js
export async function onRequest(context) {
  return new Response(
    JSON.stringify({
      message: "Hello from Cloudflare Workers!",
      timestamp: Date.now(),
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    }
  );
}
```

3. Access at `/api/hello`

### Pages Functions (Beta)

For more complex server-side logic:

```javascript
// functions/[[path]].js
export async function onRequest({ request, env, params }) {
  // Handle dynamic routes
  const url = new URL(request.url);

  // Add custom headers
  if (url.pathname.startsWith("/api/")) {
    return fetch(env.API_URL + url.pathname);
  }

  // Continue to static files
  return env.ASSETS.fetch(request);
}
```

### Image Optimization

Use Cloudflare Images:

```html
<!-- Automatic resizing -->
<img src="/cdn-cgi/image/width=800,quality=80/original-image.jpg" />
```

Or configure in Workers:

```javascript
// functions/_middleware.js
export async function onRequest({ request, next }) {
  const response = await next();

  if (request.url.includes("/images/")) {
    response.headers.set("Cache-Control", "public, max-age=31536000");
  }

  return response;
}
```

## Build Optimization

### Preview Deployments

Cloudflare creates preview deployments for every commit:

```json
{
  "scripts": {
    "build:preview": "BUILD_URL=${CF_PAGES_URL:-https://your-project.pages.dev} npm run build:all"
  }
}
```

### Build Caching

Cloudflare Pages automatically caches dependencies between builds.

### Parallel Builds

Enable in project settings for faster deployments when multiple commits are pushed.

## Analytics and Monitoring

### Web Analytics

1. Go to your Pages project → "Analytics"
2. Enable Web Analytics (free, privacy-focused)
3. No code changes required

### Real User Monitoring

Monitor Core Web Vitals:

1. Enable in Analytics settings
2. View performance metrics
3. Set up alerts for degradation

## Security Features

### Access Control

Protect preview deployments:

1. Go to Settings → "Access Policy"
2. Configure authentication methods:
   - Cloudflare Access
   - Service tokens
   - IP restrictions

### WAF (Web Application Firewall)

Available with Cloudflare Pro:

- DDoS protection (free tier included)
- Bot protection
- Custom firewall rules

## Troubleshooting

### Build Failures

1. Check build logs in deployment details
2. Verify Node.js version:
   ```
   NODE_VERSION=18
   ```
3. Clear build cache: Settings → "Clear build cache"

### Custom Domain Issues

- Ensure DNS records are proxied (orange cloud)
- Wait for SSL certificate provisioning (up to 24 hours)
- Check domain is active in Cloudflare

### 404 Errors

- Verify `404.html` is generated
- Check all route HTML files exist in dist/
- No conflicting redirect rules

### Large Builds

- Cloudflare Pages supports up to 20,000 files
- Optimize images before building
- Consider excluding unnecessary files

## Performance Tips

1. **Enable Auto Minify** in Cloudflare dashboard
2. **Use Cloudflare Images** for automatic optimization
3. **Configure Browser Caching** with headers
4. **Enable Brotli Compression** (automatic)

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npm run build:all

      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project-name
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Costs

- **Free tier**:
  - Unlimited bandwidth
  - 500 builds/month
  - Unlimited requests
  - Custom domains
  - SSL certificates
- **Pro**: $25/month
  - 5,000 builds/month
  - Advanced analytics
  - WAF rules

## Project Structure

```
your-routerino-app/
├── functions/        # Edge functions
│   └── api/
│       └── hello.js
├── public/
│   ├── _headers     # HTTP headers
│   └── _redirects   # URL redirects
├── src/
│   └── routes.jsx
├── dist/            # Build output
│   ├── index.html
│   ├── 404.html
│   └── sitemap.xml
└── wrangler.toml    # Optional config
```

## Migration Tips

### From Other Platforms

1. **From Netlify**: Headers and redirects syntax is similar
2. **From Vercel**: Replace vercel.json with \_headers/\_redirects
3. **From GitHub Pages**: Remove base path configuration

### Gradual Migration

Use Cloudflare as CDN first:

1. Keep existing hosting
2. Add site to Cloudflare
3. Test with Cloudflare proxy
4. Migrate to Pages when ready

## Summary

Cloudflare Pages excels for Routerino with:

- Unlimited bandwidth (even free tier)
- Global edge network (300+ locations)
- Excellent performance
- Built-in analytics
- Workers integration for dynamic features
- Strong security features

Choose Cloudflare Pages when performance and scale are priorities, and you might need edge computing capabilities.
