# Standard Dockerfile - Good balance of security and usability
# Base: Debian slim with Node.js 18
# Features: Shell access, debugging tools, package manager
# Use for: Development, testing, general production
# See Dockerfile.README.md for detailed comparison

FROM node:18-slim

# Install dependencies for Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create non-root user
RUN groupadd --gid 1001 prerender && \
    useradd --uid 1001 --gid prerender --shell /bin/bash --create-home prerender && \
    chown -R prerender:prerender /app

# Switch to non-root user
USER prerender

# Expose port
EXPOSE 3000

# Node.js handles signals properly in recent versions

# Start the prerender server
CMD ["node", "server.js"]