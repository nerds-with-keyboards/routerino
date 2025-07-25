# Deploying Routerino to AWS

AWS offers multiple deployment options for Routerino applications, from simple static hosting to full prerendering setups.

## Deployment Options

### Option 1: S3 + CloudFront (Static Sites)

Best for static generation with global CDN.

#### Setup Steps

1. **Build your static site:**

   ```bash
   npm run build
   npm run build:static
   npm run build:sitemap
   ```

2. **Create S3 bucket:**

   ```bash
   aws s3 mb s3://your-routerino-site

   # Enable static website hosting
   aws s3 website s3://your-routerino-site \
     --index-document index.html \
     --error-document 404.html
   ```

3. **Configure bucket policy:**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-routerino-site/*"
       }
     ]
   }
   ```

4. **Deploy files:**

   ```bash
   aws s3 sync dist/ s3://your-routerino-site \
     --delete \
     --cache-control max-age=31536000,public \
     --exclude index.html \
     --exclude "*.html"

   # HTML files with shorter cache
   aws s3 sync dist/ s3://your-routerino-site \
     --exclude "*" \
     --include "*.html" \
     --cache-control max-age=3600,public
   ```

5. **Setup CloudFront:**
   - Create distribution
   - Origin: S3 website endpoint
   - Default root object: index.html
   - Custom error pages: 404.html for 404 errors
   - Enable compression

#### Automation with GitHub Actions

```yaml
name: Deploy to AWS
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

      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

### Option 2: EC2/ECS with Docker (Prerendering)

For dynamic content with SEO optimization using our prerender container.

#### Prerequisites

- AWS CLI configured
- Docker images pushed to ECR
- Our prerender setup from `/prerender` and `/demo-prerender`

#### Push Images to ECR

```bash
# Create repositories
aws ecr create-repository --repository-name routerino-web
aws ecr create-repository --repository-name routerino-prerender

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and push web image
cd demo-prerender
docker build -t routerino-web .
docker tag routerino-web:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/routerino-web:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/routerino-web:latest

# Build and push prerender image
cd ../prerender
docker build -t routerino-prerender .
docker tag routerino-prerender:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/routerino-prerender:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/routerino-prerender:latest
```

#### ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "routerino-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/routerino-web:latest",
      "portMappings": [{ "containerPort": 80, "protocol": "tcp" }],
      "essential": true,
      "environment": [
        { "name": "PRERENDER_SERVICE_URL", "value": "http://localhost:3000" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/routerino",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "web"
        }
      },
      "dependsOn": [{ "containerName": "prerender", "condition": "HEALTHY" }]
    },
    {
      "name": "prerender",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/routerino-prerender:latest",
      "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
      "essential": true,
      "environment": [
        {
          "name": "ALLOWED_DOMAINS",
          "value": "yourdomain.com,*.yourdomain.com"
        },
        {
          "name": "STRIP_JS_USER_AGENTS",
          "value": "googlebot|bingbot|yandex|yandexbot|baiduspider|duckduckbot|slurp|ia_archiver|applebot|ahrefsbot|seznambot|dotbot|msnbot|semrushbot|blexbot|sogou|exabot"
        },
        { "name": "CACHE_MAXAGE", "value": "3600" },
        { "name": "LOG_REQUESTS", "value": "true" }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "wget -q --spider http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/routerino",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "prerender"
        }
      }
    }
  ]
}
```

#### Deploy to ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create cluster
aws ecs create-cluster --cluster-name routerino-cluster

# Create service
aws ecs create-service \
  --cluster routerino-cluster \
  --service-name routerino-service \
  --task-definition routerino-app:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

#### Load Balancer Setup

```bash
# Create target group
aws elbv2 create-target-group \
  --name routerino-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /

# Create ALB and attach
aws elbv2 create-load-balancer \
  --name routerino-lb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx
```

### Option 2.5: S3 + Lambda@Edge (Hybrid Approach)

Best of both worlds: static hosting with selective prerendering.

#### Lambda@Edge Function

Create `prerender-edge.js`:

```javascript
const https = require("https");

const BOT_AGENTS =
  /googlebot|bingbot|yandex|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slack/i;

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const userAgent = headers["user-agent"] ? headers["user-agent"][0].value : "";

  // Check if it's a bot
  if (!BOT_AGENTS.test(userAgent)) {
    return request; // Pass through to S3
  }

  // For bots, fetch prerendered content
  const path = request.uri;
  const prerenderUrl = `https://your-prerender-service.com/?url=https://yourdomain.com${path}`;

  return new Promise((resolve, reject) => {
    https
      .get(prerenderUrl, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({
            status: "200",
            statusDescription: "OK",
            headers: {
              "content-type": [
                {
                  key: "Content-Type",
                  value: "text/html",
                },
              ],
              "cache-control": [
                {
                  key: "Cache-Control",
                  value: "public, max-age=3600",
                },
              ],
            },
            body: body,
          });
        });
      })
      .on("error", (err) => {
        console.error("Prerender error:", err);
        resolve(request); // Fallback to S3
      });
  });
};
```

Deploy to Lambda@Edge and associate with CloudFront distribution.

### Option 3: Amplify Hosting

Simplified deployment with CI/CD.

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Configure build
amplify configure project
# Build command: npm run build:all
# Output directory: dist

# Deploy
amplify publish
```

## Cost Optimization

### S3 + CloudFront Costs

- S3 Storage: ~$0.023/GB/month
- CloudFront: ~$0.085/GB transfer
- Requests: Minimal
- **Estimate**: $5-20/month for typical sites

### ECS Costs

- Fargate: ~$0.04/vCPU/hour (~$30/month for 1 vCPU)
- ALB: ~$0.025/hour (~$18/month)
- Data transfer: Variable
- **Estimate**: $75-150/month for basic setup

### S3 + Lambda@Edge Costs

- S3 + CloudFront: Same as above
- Lambda@Edge: $0.00005001 per request
- Lambda@Edge duration: $0.00000625125 per GB-second
- **Estimate**: $10-40/month (depends on bot traffic)

### Cost Saving Tips

1. Use S3 lifecycle policies
2. Enable CloudFront caching
3. Use Spot instances for ECS
4. Consider Reserved Instances
5. Monitor with Cost Explorer

## Performance Optimization

### CloudFront Configuration

```json
{
  "CacheBehaviors": [
    {
      "PathPattern": "/assets/*",
      "TargetOriginId": "S3-Origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "CachePolicyId": "658327ea-f89e-4f3b-8f86-ae7e0f144e0c",
      "Compress": true
    }
  ],
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponseCode": 404,
      "ResponsePagePath": "/404.html",
      "ErrorCachingMinTTL": 86400
    }
  ]
}
```

### Lambda@Edge for Dynamic Headers

```javascript
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  headers["strict-transport-security"] = [
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubdomains; preload",
    },
  ];

  headers["x-frame-options"] = [
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
  ];

  return response;
};
```

## Monitoring

### CloudWatch Dashboards

- Request count and latency
- Error rates
- Bandwidth usage
- Cache hit rates

### Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --alarm-description "High 4xx/5xx error rate" \
  --metric-name 4xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

## Security

### WAF Rules

```json
{
  "Rules": [
    {
      "Name": "RateLimitRule",
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": { "Block": {} }
    }
  ]
}
```

### IAM Best Practices

- Use least privilege policies
- Enable MFA for production
- Rotate access keys regularly
- Use IAM roles for EC2/ECS

## Summary

**Choose S3 + CloudFront when:**

- Static content only
- Cost is primary concern
- SEO handled by static generation
- Simple deployment needed

**Choose S3 + Lambda@Edge when:**

- Mostly static content
- Need selective prerendering for bots
- Want serverless architecture
- Cost-conscious but need good SEO

**Choose ECS/Fargate when:**

- Dynamic content required
- Full control over prerendering
- Complex backend requirements
- Can manage container infrastructure

**Choose Amplify when:**

- Want simplified deployment
- Need integrated auth/APIs
- Prefer fully managed service
- OK with vendor lock-in

### Quick Decision Matrix

| Approach         | Cost | Complexity | SEO       | Scalability | Control |
| ---------------- | ---- | ---------- | --------- | ----------- | ------- |
| S3 + CloudFront  | $    | Low        | Good\*    | Excellent   | Limited |
| S3 + Lambda@Edge | $$   | Medium     | Excellent | Excellent   | Medium  |
| ECS/Fargate      | $$$  | High       | Excellent | Good        | Full    |
| Amplify          | $$   | Low        | Good      | Good        | Limited |

\*With static generation only
