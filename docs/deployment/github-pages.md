# Deploying Routerino to GitHub Pages

GitHub Pages provides free static hosting directly from your GitHub repository, perfect for Routerino projects.

## Prerequisites

- GitHub account
- Routerino app with static generation
- Git installed locally

## Deployment Options

### Option 1: GitHub Actions (Recommended)

This method builds and deploys automatically on every push.

#### Step 1: Configure Your Project

1. Update `package.json` with your GitHub Pages URL:

   ```json
   {
     "scripts": {
       "build": "vite build",
       "build:static": "routerino-build-static routesFile=src/routes.jsx outputDir=dist template=dist/index.html baseUrl=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
       "build:sitemap": "routerino-build-sitemap routeFilePath=src/routes.jsx hostname=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME outputDir=dist",
       "build:all": "npm run build && npm run build:static && npm run build:sitemap"
     }
   }
   ```

2. Update `vite.config.js` for the base path:
   ```javascript
   export default {
     base: "/YOUR_REPO_NAME/",
     // ... other config
   };
   ```

#### Step 2: Create GitHub Action

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:all
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Source", select "GitHub Actions"
4. Commit and push your changes

The action will run automatically and deploy your site.

### Option 2: Deploy from Branch

This method uses a dedicated branch for deployment.

#### Step 1: Build Locally

```bash
npm run build:all
```

#### Step 2: Deploy to gh-pages Branch

1. Install gh-pages utility:

   ```bash
   npm install --save-dev gh-pages
   ```

2. Add deploy script to `package.json`:

   ```json
   {
     "scripts": {
       "deploy": "npm run build:all && gh-pages -d dist"
     }
   }
   ```

3. Run deployment:
   ```bash
   npm run deploy
   ```

#### Step 3: Configure GitHub Pages

1. Go to Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "gh-pages" → "/ (root)"
4. Save

### Option 3: Manual Deployment

For one-time deployments:

```bash
# Build your site
npm run build:all

# Create orphan branch
git checkout --orphan gh-pages

# Remove all files
git rm -rf .

# Add built files
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
git push origin gh-pages --force

# Return to main branch
git checkout main
```

## Configuration for Subdirectory Hosting

GitHub Pages serves projects at `username.github.io/repository-name/`. You need to configure:

### 1. Vite Base Path

```javascript
// vite.config.js
export default {
  base: process.env.NODE_ENV === "production" ? "/YOUR_REPO_NAME/" : "/",
};
```

### 2. Router Base Path

Ensure your Routerino routes work with the base path:

```jsx
// Consider the base path in your routes
const routes = [
  {
    path: "/", // Will be /repo-name/ in production
    element: <Home />,
  },
  {
    path: "/about", // Will be /repo-name/about
    element: <About />,
  },
];
```

### 3. Asset Paths

Use relative paths for assets:

```jsx
// Good
<img src="./logo.png" />

// Avoid absolute paths
<img src="/logo.png" />
```

## Custom Domain

### Using a Custom Domain

1. Create `CNAME` file in your dist folder:

   ```
   yourdomain.com
   ```

2. Update build scripts to preserve CNAME:

   ```json
   {
     "scripts": {
       "build:all": "npm run build && npm run build:static && npm run build:sitemap && echo 'yourdomain.com' > dist/CNAME"
     }
   }
   ```

3. Configure DNS:
   - A records:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or CNAME: `YOUR_USERNAME.github.io`

4. Enable HTTPS in repository settings

## Project Structure

```
your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── routes.jsx
│   └── main.jsx
├── dist/            # Generated
│   ├── index.html
│   ├── about/
│   │   └── index.html
│   ├── 404.html
│   ├── CNAME        # For custom domain
│   ├── sitemap.xml
│   └── robots.txt
├── package.json
└── vite.config.js
```

## Handling 404s

GitHub Pages will use your `404.html` for missing pages. Ensure your build generates one:

```jsx
// In your routes
{
  path: '*',
  element: <NotFound />,
  title: 'Page Not Found'
}
```

## Troubleshooting

### Site Not Updating

1. Check Actions tab for build failures
2. Hard refresh browser (Ctrl+Shift+R)
3. Wait 10 minutes (GitHub Pages cache)
4. Check correct branch is deployed

### 404 Errors on Routes

- Verify base path is set correctly
- Check static files are generated for each route
- Ensure no trailing slash issues

### Build Failures

Common issues:

- Node version mismatch (specify in workflow)
- Missing dependencies (use `npm ci` not `npm install`)
- Environment variables not set

### Assets Not Loading

- Use relative paths
- Check base path configuration
- Verify assets are in dist folder

## Advanced Configuration

### Environment-Specific Builds

```yaml
# In deploy.yml
- name: Build
  run: npm run build:all
  env:
    NODE_ENV: production
    VITE_GA_ID: ${{ secrets.GA_ID }}
```

### Multiple Environments

Deploy preview and production:

```yaml
# deploy-preview.yml
on:
  pull_request:
    branches: [main]
# Deploy to username.github.io/repo-name/preview/pr-number
```

### Build Caching

Speed up builds:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## Limitations

- Static files only (no server-side code)
- 1GB repository size limit
- 100GB bandwidth/month soft limit
- Build time limited to 10 minutes
- No custom HTTP headers
- No server-side redirects

## Best Practices

1. **Use GitHub Actions** for automated deployment
2. **Optimize images** before committing
3. **Enable gzip** by pre-compressing files
4. **Monitor** repository size
5. **Use releases** for versioning

## Costs

GitHub Pages is **completely free** for public repositories. Private repositories require GitHub Pro or higher.

## Summary

GitHub Pages is perfect for Routerino when:

- You want free hosting
- Your repository is public
- You don't need server-side features
- You're okay with subdirectory URLs (or have a custom domain)

For root-level hosting without a custom domain, consider Netlify or Vercel instead.
