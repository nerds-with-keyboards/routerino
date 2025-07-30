# Deploying Routerino to Netlify

Netlify is an excellent choice for static Routerino sites with automatic deployments, free SSL, and a generous free tier.

## ⚠️ Important: Netlify's Prerendering (beta)

Beware Netlify's built-in prerendering service. As of mid-2025 it appears to frequently return 500 errors for search engine bots, at least in some cases. Anything less than 99.999% uptime is not acceptable for serious SEO. Instead, use Routerino's static generation approach which provides:

- 100% reliable static HTML files
- Better performance (no dynamic rendering)
- Full control over meta tags and SEO

If you've already enabled Netlify's prerendering:

1. Go to Site Settings → Build & deploy → Post processing
2. **Disable** "Prerendering" & save
3. Use `routerino-build-static` instead (see below)

## Prerequisites

- Routerino app with static generation configured
- GitHub, GitLab, or Bitbucket account
- Netlify account (free at netlify.com)

## Deployment Methods

### Method 1: Git-Based Deployment (Recommended)

#### Step 1: Prepare Your Repository

1. Ensure your `package.json` has the necessary build scripts:

   ```json
   {
     "scripts": {
       "build": "vite build",
       "build:static": "routerino-build-static routesFile=src/routes.jsx outputDir=dist template=dist/index.html baseUrl=https://yourdomain.netlify.app",
       "build:sitemap": "routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://yourdomain.netlify.app outputDir=dist",
       "build:all": "npm run build && npm run build:static && npm run build:sitemap"
     }
   }
   ```

2. Create `netlify.toml` in your project root:

   ```toml
   [build]
     command = "npm run build:all"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"

   # Headers for better performance
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"

   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

3. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push
   ```

#### Step 2: Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and authorize access
4. Select your repository
5. Netlify should auto-detect settings from `netlify.toml`
6. Click "Deploy site"

#### Step 3: Configure Domain (Optional)

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Netlify automatically provisions SSL certificates

### Method 2: Drag & Drop Deployment

For quick testing without Git:

1. Build locally:

   ```bash
   npm run build:all
   ```

2. Open [Netlify Drop](https://app.netlify.com/drop)
3. Drag your `dist` folder to the browser
4. Your site is instantly deployed!

### Method 3: Netlify CLI Deployment

1. Install Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

2. Build your site:

   ```bash
   npm run build:all
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

## Important Configuration Notes

### DO NOT Use Redirects

Since Routerino generates static HTML for each route, avoid catch-all redirects:

❌ **Wrong** - Don't add this to netlify.toml:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

✅ **Correct** - Let each route serve its own HTML file

### Environment Variables

Set build-time environment variables in Netlify dashboard:

1. Go to "Site settings" → "Environment variables"
2. Add variables like:
   - `NODE_ENV=production`
   - `VITE_API_URL=https://api.yourdomain.com`

### Build Settings

- **Base directory**: Leave empty (root)
- **Build command**: `npm run build:all`
- **Publish directory**: `dist`
- **Functions directory**: Leave empty

## Optimization Tips

### 1. Asset Optimization

The provided `netlify.toml` includes headers for caching static assets. Ensure your build process:

- Hashes asset filenames for cache busting
- Optimizes images
- Minifies CSS/JS

### 2. Preview Deployments

Netlify creates preview deployments for pull requests. Update your build script to use preview URLs:

```json
{
  "scripts": {
    "build:preview": "npm run build && routerino-build-static routesFile=src/routes.jsx outputDir=dist template=dist/index.html baseUrl=$DEPLOY_PRIME_URL"
  }
}
```

Update `netlify.toml`:

```toml
[context.deploy-preview]
  command = "npm run build:preview"
```

### 3. 404 Handling

Routerino's static build should generate a `404.html`. Netlify automatically uses this for missing pages.

## Monitoring

### Analytics

Enable Netlify Analytics (paid feature) or add your analytics script to your Routerino app.

### Build Notifications

Configure build notifications in "Site settings" → "Build & deploy" → "Deploy notifications"

## Troubleshooting

### Build Fails

1. Check build logs in Netlify dashboard
2. Ensure Node version matches locally:
   ```toml
   [build.environment]
     NODE_VERSION = "18"
   ```
3. Clear cache and retry: "Site settings" → "Build & deploy" → "Clear cache and deploy site"

### Routes Not Working

- Verify static files are generated: Check "Deploys" → Click deployment → "Deploy log"
- Ensure no redirect rules are interfering
- Check that `build:static` is using correct paths

### Performance Issues

- Enable Netlify's asset optimization
- Use Netlify's image CDN for images
- Consider Netlify's Edge Functions for dynamic needs

## Example Project Structure

```
your-routerino-app/
├── src/
│   ├── routes.jsx
│   ├── pages/
│   └── main.jsx
├── dist/              # Generated by build
│   ├── index.html
│   ├── about/
│   │   └── index.html
│   ├── contact/
│   │   └── index.html
│   ├── 404.html
│   ├── sitemap.xml
│   ├── robots.txt
│   └── assets/
├── netlify.toml
├── package.json
└── vite.config.js
```

## Advanced Features

### Netlify Functions (Serverless)

While Routerino is static, you can add API endpoints:

1. Create `netlify/functions/hello.js`:

   ```javascript
   exports.handler = async (event, context) => {
     return {
       statusCode: 200,
       body: JSON.stringify({ message: "Hello from Netlify Functions!" }),
     };
   };
   ```

2. Access at: `/.netlify/functions/hello`

### Form Handling

Netlify processes forms automatically:

```jsx
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

## Troubleshooting

### Getting 500 Errors with Googlebot?

This is likely because Netlify's prerendering is enabled. To fix:

1. **Disable Netlify prerendering**:
   - Site Settings → Build & deploy → Post processing → Disable "Prerendering"

2. **Test your static generation**:

   ```bash
   curl -H "User-Agent: Googlebot" https://yoursite.netlify.app
   ```

   You should see your pre-generated HTML with all meta tags.

3. **Verify meta tags are present**:
   - View page source (not inspect element)
   - Confirm title, description, and og: tags are in the HTML

### Build Failing?

- Check Node version in netlify.toml matches your local environment
- Ensure all dependencies are in package.json (not devDependencies if needed for build)
- Check build logs in Netlify dashboard

## Costs

- **Free tier**: 100GB bandwidth, 300 build minutes/month
- **Pro**: $19/month per member for commercial projects
- **No charges** for static hosting itself

## Summary

Netlify is ideal for Routerino static sites with:

- Zero configuration deployments
- Automatic SSL
- Global CDN
- Preview deployments

For dynamic content needs, consider using Prerender.io or our Docker prerender setup instead of Netlify's built-in prerendering.
