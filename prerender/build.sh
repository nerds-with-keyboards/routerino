#!/bin/bash

# Build script for Routerino Prerender Docker image

set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-routerino-prerender}"
REGISTRY="${REGISTRY:-}"
VERSION="${VERSION:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Routerino Prerender Server${NC}"
echo "Image: ${IMAGE_NAME}:${VERSION}"

# Build the image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t "${IMAGE_NAME}:${VERSION}" .

# Tag as latest if not already
if [ "${VERSION}" != "latest" ]; then
    docker tag "${IMAGE_NAME}:${VERSION}" "${IMAGE_NAME}:latest"
    echo -e "${GREEN}Tagged as ${IMAGE_NAME}:latest${NC}"
fi

# If registry is specified, tag and push
if [ -n "${REGISTRY}" ]; then
    FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}"
    
    echo -e "${YELLOW}Tagging for registry ${REGISTRY}...${NC}"
    docker tag "${IMAGE_NAME}:${VERSION}" "${FULL_IMAGE}:${VERSION}"
    docker tag "${IMAGE_NAME}:${VERSION}" "${FULL_IMAGE}:latest"
    
    echo -e "${YELLOW}Pushing to registry...${NC}"
    docker push "${FULL_IMAGE}:${VERSION}"
    docker push "${FULL_IMAGE}:latest"
    
    echo -e "${GREEN}Successfully pushed to ${FULL_IMAGE}${NC}"
fi

echo -e "${GREEN}Build complete!${NC}"
echo ""
echo "To run locally:"
echo "  docker run -p 3000:3000 ${IMAGE_NAME}:${VERSION}"
echo ""
echo "To run with domain restrictions:"
echo "  docker run -p 3000:3000 -e ALLOWED_DOMAINS='example.com,*.example.com' ${IMAGE_NAME}:${VERSION}"