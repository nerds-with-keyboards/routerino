# Routerino Prerender Server

A Docker-based prerender server optimized for Routerino SPAs. This server renders JavaScript applications for search engine crawlers and social media bots, ensuring proper SEO and social sharing.

## Quick Start

**Note**: Two Dockerfiles are provided - see [Dockerfile.README.md](./Dockerfile.README.md) for comparison:

- `Dockerfile` - Standard version with debugging capabilities
- `Dockerfile.secure` - Hardened version for high-security environments

### Using Docker Compose

1. Clone this directory
2. Configure your environment (see Configuration below)
3. Run: `docker-compose up -d`

### Using Docker directly

```bash
# Build the image (standard version)
docker build -t routerino-prerender .

# Or build the secure version for production
docker build -f Dockerfile.secure -t routerino-prerender:secure .

# Run with default settings (allows all domains)
docker run -p 3000:3000 routerino-prerender

# Run with specific domains only
docker run -p 3000:3000 \
  -e ALLOWED_DOMAINS="example.com,*.example.com" \
  routerino-prerender

# Prerender for all users, strip JS only for search engines (recommended)
docker run -p 3000:3000 \
  -e PRERENDER_USER_AGENTS="all" \
  -e STRIP_JS_USER_AGENTS="googlebot|bingbot|yandex|baiduspider" \
  routerino-prerender

# Prerender only for specific bots
docker run -p 3000:3000 \
  -e PRERENDER_USER_AGENTS="googlebot|bingbot|facebookexternalhit" \
  routerino-prerender

# Prerender for all, keep JavaScript for everyone
docker run -p 3000:3000 \
  -e PRERENDER_USER_AGENTS="all" \
  -e STRIP_JS_USER_AGENTS="none" \
  routerino-prerender
```

## Configuration

Configure the server using environment variables:

| Variable                  | Default          | Description                                                                                                                                                                  |
| ------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                    | 3000             | Port to listen on                                                                                                                                                            |
| `HOST`                    | 0.0.0.0          | Host to bind to                                                                                                                                                              |
| `ALLOWED_DOMAINS`         | (empty)          | Comma-separated list of allowed domains. Empty allows all domains. Supports wildcards like `*.example.com`                                                                   |
| `PRERENDER_USER_AGENTS`   | all              | User agents to prerender for. Set to `all` to prerender all requests, or provide a custom regex pattern                                                                      |
| `STRIP_JS_USER_AGENTS`    | (search engines) | User agents to strip JavaScript for. Defaults to major search engines only (excludes social media bots). Set to `none` to keep JS for all, or provide a custom regex pattern |
| `CACHE_MAXAGE`            | 3600             | Cache TTL in seconds (0 to disable)                                                                                                                                          |
| `LOG_REQUESTS`            | true             | Enable request logging                                                                                                                                                       |
| `WAIT_AFTER_LAST_REQUEST` | 500              | Milliseconds to wait after last request before considering page loaded                                                                                                       |
| `FOLLOW_REDIRECTS`        | true             | Whether to follow HTTP redirects                                                                                                                                             |

### Common Configuration Patterns

The default configuration (`PRERENDER_USER_AGENTS=all`, `STRIP_JS_USER_AGENTS=search engines`) is recommended for most use cases. It prerenders for everyone (improving performance) while only stripping JavaScript for search engines (optimizing SEO). Social media bots like Facebook, Twitter, and LinkedIn preserve JavaScript for rich previews.

1. **Default/SEO-Optimized (Recommended)**
   - Prerender for all users to improve performance
   - Strip JS only for search engines to optimize crawling

   ```bash
   PRERENDER_USER_AGENTS=all
   STRIP_JS_USER_AGENTS=  # Empty uses default (search engines only)
   ```

2. **Traditional Bot-Only**
   - Only prerender for known bots
   - Strip JS from search engines only

   ```bash
   PRERENDER_USER_AGENTS=googlebot|bingbot|facebookexternalhit|twitterbot
   STRIP_JS_USER_AGENTS=  # Empty means strip JS for search engines only
   ```

3. **Performance-Focused**
   - Prerender for everyone
   - Keep JavaScript intact for rich interactions
   ```bash
   PRERENDER_USER_AGENTS=all
   STRIP_JS_USER_AGENTS=none
   ```

## Usage with Your Application

### 1. Point your web server to the prerender service

#### Nginx Example

```nginx
location / {
    try_files $uri @prerender;
}

location @prerender {
    set $prerender 0;

    # If PRERENDER_USER_AGENTS=all, you can either:
    # Option 1: Always prerender (remove this check)
    # Option 2: Still filter at nginx level for performance
    if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp") {
        set $prerender 1;
    }

    # Check if it's a file extension we should serve directly
    if ($uri ~* "\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)") {
        set $prerender 0;
    }

    if ($prerender = 1) {
        rewrite .* /https://$host$request_uri? break;
        proxy_pass http://localhost:3000;
    }

    if ($prerender = 0) {
        proxy_pass http://your-app-server;
    }
}
```

#### Apache Example

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    <IfModule mod_proxy_http.c>
        RewriteCond %{HTTP_USER_AGENT} googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora\ link\ preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp [NC,OR]
        RewriteCond %{QUERY_STRING} _escaped_fragment_

        # Only proxy the request to Prerender if it's not a file
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_URI} !^/api

        # Proxy the request to the prerender server
        RewriteRule ^(.*)$ http://localhost:3000/https://%{HTTP_HOST}/$1 [P,L]
    </IfModule>
</IfModule>
```

### 2. Add prerender meta tag to your app

In your Routerino app, add the meta tag to indicate prerender status:

```javascript
// In your route component
useEffect(() => {
  // This will be picked up by the prerender server
  window.prerenderReady = false;

  // When your content is loaded
  loadContent().then(() => {
    window.prerenderReady = true;
  });
}, []);
```

Or use Routerino's built-in prerender support by setting status codes:

```javascript
// For 404 pages
<meta name="prerender-status-code" content="404" />

// For redirects
<meta name="prerender-status-code" content="301" />
<meta name="prerender-header" content="Location: https://example.com/new-url" />
```

## Deployment

### Production with Docker Compose

1. Create a `.env` file:

```env
ALLOWED_DOMAINS=example.com,*.example.com,staging.example.com
CACHE_MAXAGE=86400
LOG_REQUESTS=true
```

2. Deploy:

```bash
docker-compose up -d
```

### Kubernetes

Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: routerino-prerender
spec:
  replicas: 2
  selector:
    matchLabels:
      app: routerino-prerender
  template:
    metadata:
      labels:
        app: routerino-prerender
    spec:
      containers:
        - name: prerender
          image: routerino-prerender:latest
          ports:
            - containerPort: 3000
          env:
            - name: ALLOWED_DOMAINS
              value: "example.com,*.example.com"
            - name: CACHE_MAXAGE
              value: "3600"
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: routerino-prerender
spec:
  selector:
    app: routerino-prerender
  ports:
    - port: 3000
      targetPort: 3000
```

## Health Check

The server exposes a health endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T10:30:00.000Z",
  "config": {
    "allowedDomains": ["example.com", "*.example.com"],
    "cacheEnabled": true,
    "cacheMaxAge": 3600
  }
}
```

## Performance Tuning

1. **Memory**: The container uses Chrome, which can be memory-intensive. Allocate at least 512MB, preferably 1GB.

2. **Cache**: Enable caching to reduce rendering load:

   ```bash
   -e CACHE_MAXAGE=86400  # 24 hour cache
   ```

   **Note**: Memory caching is temporarily disabled due to ES module compatibility issues with the prerender-memory-cache package. The server will still function but without in-memory caching of rendered pages.

3. **Scaling**: Run multiple instances behind a load balancer for high-traffic sites.

## Security

1. **Always use domain whitelisting in production**:

   ```bash
   -e ALLOWED_DOMAINS="yourdomain.com,*.yourdomain.com"
   ```

2. **Use the secure Dockerfile for production** (distroless base):

   ```bash
   docker build -f Dockerfile.secure -t routerino-prerender:secure .
   ```

3. **Limit user agents** to known crawlers:

   ```bash
   # Default (recommended)
   -e USER_AGENTS=""

   # Or specify exact bots
   -e USER_AGENTS="googlebot|bingbot"
   ```

4. **Run behind a reverse proxy** (nginx, Apache, etc.) to:
   - Add rate limiting
   - Filter malicious requests
   - Add additional security headers

5. **Monitor logs** for suspicious activity:
   ```bash
   docker logs routerino-prerender
   ```

## Troubleshooting

### Pages not rendering correctly

1. Check if your app waits for all content to load:

   ```javascript
   window.prerenderReady = false;
   // Load content...
   window.prerenderReady = true;
   ```

2. Increase wait time if needed:
   ```bash
   -e WAIT_AFTER_LAST_REQUEST=1000
   ```

### High memory usage

Chrome can use significant memory. To limit it:

1. Restart the container periodically
2. Use multiple smaller instances instead of one large one
3. Enable swap on the host if needed

### Checking if prerender is working

Test with curl:

```bash
curl -H "User-Agent: googlebot" http://localhost:3000/https://yoursite.com
```

## License

MIT
