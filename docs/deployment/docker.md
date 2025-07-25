# Deploying Routerino with Docker (Prerendering)

This guide covers deploying Routerino with server-side prerendering using Docker, ideal for SEO-critical applications that need dynamic content.

## Prerequisites

- Docker and Docker Compose installed
- VPS or cloud hosting (AWS, DigitalOcean, etc.)
- Domain name (optional)
- Basic Linux knowledge

## Architecture Overview

The Docker setup includes:

- **Nginx**: Web server and reverse proxy
- **Prerender Service**: Headless Chrome for rendering
- **Your Routerino App**: The SPA bundle

```
[User] → [Nginx] → [Prerender Service] → [Chrome renders SPA]
           ↓
    [Static Assets/SPA]
```

## Quick Start

### Step 1: Prepare Your Application

1. Build your Routerino app:

   ```bash
   npm run build
   ```

2. Copy the prerender service (included with Routerino):

   ```bash
   cp -r node_modules/routerino/prerender ./prerender
   ```

3. Create `docker-compose.yml` in your project root:

   ```yaml
   version: "3.8"

   services:
     web:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./dist:/usr/share/nginx/html
         - ./nginx.conf:/etc/nginx/nginx.conf:ro
         - ./ssl:/etc/nginx/ssl:ro # For SSL certificates
       depends_on:
         - prerender
       restart: unless-stopped

     prerender:
       build: ./prerender
       environment:
         - ALLOWED_DOMAINS=${ALLOWED_DOMAINS:-localhost,yourdomain.com}
         - PRERENDER_USER_AGENTS=all
         - STRIP_JS_USER_AGENTS=googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp
         - CACHE_MAXAGE=3600
         - LOG_REQUESTS=true
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

### Step 2: Create Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Rate limiting
        limit_req zone=general burst=20 nodelay;

        location / {
            try_files $uri @prerender;
        }

        location @prerender {
            set $prerender 0;

            # Detect bots
            if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp") {
                set $prerender 1;
            }

            # Skip static files
            if ($uri ~* "\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|woff2|svg|eot)$") {
                set $prerender 0;
            }

            # Proxy headers
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;

            if ($prerender = 1) {
                rewrite .* /https://$host$request_uri? break;
                proxy_pass http://prerender:3000;
            }

            try_files $uri /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Step 3: Deploy

1. Transfer files to your server:

   ```bash
   rsync -avz --exclude node_modules . user@yourserver:/path/to/app
   ```

2. Start the services:

   ```bash
   docker-compose up -d
   ```

3. Check logs:
   ```bash
   docker-compose logs -f
   ```

## Production Deployment

### SSL/TLS Certificates

#### Option 1: Let's Encrypt (Certbot)

```bash
# Install certbot
apt-get update
apt-get install certbot

# Get certificates
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

#### Option 2: Cloudflare (Recommended)

1. Add site to Cloudflare
2. Use Cloudflare's SSL/TLS
3. Set SSL mode to "Full (strict)"
4. Generate origin certificate in Cloudflare dashboard

### Environment Configuration

Create `.env` file:

```env
# Domain Configuration
ALLOWED_DOMAINS=yourdomain.com,www.yourdomain.com

# Prerender Configuration
CACHE_MAXAGE=86400
STRIP_JS_USER_AGENTS=googlebot|bingbot|yandex|baiduspider

# Resources
MEMORY_LIMIT=1g
CPU_LIMIT=1.0
```

Update `docker-compose.yml` to use resource limits:

```yaml
services:
  prerender:
    # ... other config
    deploy:
      resources:
        limits:
          memory: ${MEMORY_LIMIT:-1g}
          cpus: ${CPU_LIMIT:-1.0}
```

### Monitoring

#### Health Checks

```bash
# Check services
curl http://localhost/health
curl http://localhost:3000/health

# Monitor with script
cat > health-check.sh << 'EOF'
#!/bin/bash
if ! curl -f http://localhost/health > /dev/null 2>&1; then
  echo "Nginx health check failed"
  docker-compose restart web
fi

if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo "Prerender health check failed"
  docker-compose restart prerender
fi
EOF

chmod +x health-check.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /path/to/health-check.sh
```

#### Logging

Configure centralized logging:

```yaml
# docker-compose.yml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
```

View logs:

```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs -f prerender

# Last 100 lines
docker-compose logs --tail=100
```

### Backup Strategy

```bash
# Backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/routerino/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup application
cp -r /path/to/app $BACKUP_DIR/

# Backup Docker volumes
docker run --rm -v yourapp_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/data.tar.gz -C /data .

# Keep only last 7 days
find /backups/routerino -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x backup.sh
```

## Performance Optimization

### 1. Prerender Caching

Configure Redis for better caching:

```yaml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped

  prerender:
    environment:
      - CACHE_BACKEND=redis
      - REDIS_URL=redis://redis:6379
```

### 2. CDN Integration

Use Cloudflare or another CDN:

1. Point domain to CDN
2. Configure caching rules
3. Exclude `/api/*` from caching

### 3. Resource Tuning

```yaml
# Nginx performance
web:
  sysctls:
    - net.core.somaxconn=1024
  ulimits:
    nofile:
      soft: 65536
      hard: 65536
```

### 4. Multi-Instance Scaling

For high traffic, use Docker Swarm or Kubernetes:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml routerino

# Scale prerender
docker service scale routerino_prerender=3
```

## Security Best Practices

### 1. Network Isolation

```yaml
networks:
  frontend:
  backend:

services:
  web:
    networks:
      - frontend
      - backend

  prerender:
    networks:
      - backend
```

### 2. Secrets Management

```yaml
secrets:
  ssl_cert:
    file: ./ssl/cert.pem
  ssl_key:
    file: ./ssl/key.pem

services:
  web:
    secrets:
      - ssl_cert
      - ssl_key
```

### 3. Security Updates

```bash
# Update script
cat > update.sh << 'EOF'
#!/bin/bash
docker-compose pull
docker-compose up -d
docker image prune -f
EOF

chmod +x update.sh
```

## Troubleshooting

### Common Issues

1. **Prerender not working**
   - Check user agent detection in nginx.conf
   - Verify prerender service is healthy
   - Check logs: `docker-compose logs prerender`

2. **High memory usage**
   - Limit Chrome instances
   - Increase cache duration
   - Add swap space

3. **SSL errors**
   - Verify certificate paths
   - Check certificate validity
   - Ensure proper permissions

### Debug Mode

Enable detailed logging:

```yaml
environment:
  - LOG_LEVEL=debug
  - DEBUG=prerender:*
```

## Deployment Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] Health checks configured
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logs rotation configured
- [ ] Resource limits set

## Cost Estimation

**VPS Requirements:**

- CPU: 2 cores minimum
- RAM: 2GB minimum (4GB recommended)
- Storage: 20GB
- Bandwidth: Varies by traffic

**Estimated Monthly Costs:**

- DigitalOcean: $12-24/month
- AWS EC2: $15-30/month
- Vultr: $10-20/month
- Linode: $10-20/month

## Summary

Docker deployment is ideal when you need:

- Full control over infrastructure
- Dynamic content rendering
- Custom configurations
- Horizontal scaling capabilities
- Self-hosted solution

The setup provides excellent SEO while maintaining the benefits of a single-page application.
