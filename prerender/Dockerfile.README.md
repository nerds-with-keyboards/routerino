# Dockerfile Comparison

This directory contains two Dockerfiles for different use cases:

## Dockerfile (Standard)

**File**: `Dockerfile`  
**Base Image**: `node:18-slim` (Debian-based)  
**Size**: ~400-500MB  
**Use Case**: Development, testing, and general production

### Features:
- Full Debian slim OS with common tools
- Shell access for debugging (`docker exec -it <container> /bin/bash`)
- Package manager for installing additional tools if needed
- Non-root user for security
- Good balance of functionality and security

### When to Use:
- Development and testing environments
- When you need to troubleshoot in production
- When you need to exec into containers for debugging
- General production use where some OS utilities are helpful

### Build Command:
```bash
docker build -t routerino-prerender .
```

## Dockerfile.secure (Hardened)

**File**: `Dockerfile.secure`  
**Base Image**: `gcr.io/distroless/nodejs18-debian11`  
**Size**: ~200-300MB (50% smaller)  
**Use Case**: High-security production environments

### Features:
- **Distroless**: Contains only Node.js runtime, no OS utilities
- **No Shell**: Cannot exec into container (no `/bin/sh` or `/bin/bash`)
- **No Package Manager**: Cannot install additional packages
- **Minimal Attack Surface**: No unnecessary binaries
- **Multi-stage Build**: Keeps final image clean
- **Non-root User**: Uses distroless's built-in nonroot user

### Security Benefits:
- Cannot execute shell commands even if compromised
- No tools for attackers to use (no `wget`, `curl`, `nc`, etc.)
- Smaller image = fewer potential vulnerabilities
- Complies with strict security policies

### Limitations:
- Cannot debug inside container (no shell)
- Must rely on logs and external monitoring
- Cannot install additional tools at runtime
- More difficult to troubleshoot

### When to Use:
- Production environments with strict security requirements
- Compliance environments (PCI-DSS, HIPAA, etc.)
- When you have robust logging/monitoring in place
- When minimizing attack surface is critical

### Build Command:
```bash
docker build -f Dockerfile.secure -t routerino-prerender:secure .
```

## Comparison Table

| Feature | Dockerfile | Dockerfile.secure |
|---------|------------|-------------------|
| Base Image | node:18-slim | distroless/nodejs18 |
| Image Size | ~400-500MB | ~200-300MB |
| Shell Access | ✅ Yes | ❌ No |
| Package Manager | ✅ Yes (apt) | ❌ No |
| Debugging Tools | ✅ Yes | ❌ No |
| Attack Surface | Moderate | Minimal |
| Security Level | Good | Excellent |
| Ease of Use | Easy | Harder |
| Troubleshooting | Easy | Difficult |

## Recommendations

1. **Start with `Dockerfile`** during development and testing
2. **Use `Dockerfile.secure`** for production if you have:
   - Good logging infrastructure
   - External monitoring
   - Security requirements
   - Tested deployment process

3. **For most users**, the standard `Dockerfile` provides a good balance of security and usability

## Chrome Installation Note

Both Dockerfiles install Google Chrome (not Chromium) for better compatibility and stability with prerendering. The installation process is identical in both, but in the secure version it's done in a separate build stage to keep the final image clean.