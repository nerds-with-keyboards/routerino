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
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
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
RUN addgroup -g 1001 -S prerender && \
    adduser -S prerender -u 1001 -G prerender && \
    chown -R prerender:prerender /app

# Switch to non-root user
USER prerender

# Expose port
EXPOSE 3000

# Node.js handles signals properly in recent versions

# Start the prerender server
CMD ["node", "server.js"]