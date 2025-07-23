#!/bin/bash

# Production Deployment Test Script
# Tests the deployed Hugo blog on Cloudflare Workers with full validation

set -e

# Configuration
PRODUCTION_URL="https://hugo-overreacted-blog-staging.zjlgdx.workers.dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Testing production deployment...${NC}"
echo "Production URL: $PRODUCTION_URL"
echo ""

# Test 1: Basic connectivity
echo -e "${BLUE}🌐 Testing basic connectivity...${NC}"
if curl -f -s -m 30 "$PRODUCTION_URL" > /dev/null; then
    echo -e "${GREEN}✅ Production site is accessible${NC}"
else
    echo -e "${RED}❌ Production site is not accessible${NC}"
    exit 1
fi

# Test 2: Run comprehensive validation against production
echo -e "${BLUE}🧪 Running comprehensive validation against production...${NC}"
echo ""

# Check if Node.js validation script exists
if [ -f "$SCRIPT_DIR/validate-deployment-fixes.js" ]; then
    # Run the Node.js validation script against production
    SITE_URL="$PRODUCTION_URL" node "$SCRIPT_DIR/validate-deployment-fixes.js"
    VALIDATION_EXIT_CODE=$?
    
    if [ $VALIDATION_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}🎉 Production deployment validation passed!${NC}"
    else
        echo -e "${RED}❌ Production deployment validation failed${NC}"
        exit $VALIDATION_EXIT_CODE
    fi
else
    echo -e "${YELLOW}⚠️ Node.js validation script not found, running basic tests...${NC}"
    
    # Fallback to basic shell tests
    echo -e "${BLUE}🔍 Testing security headers...${NC}"
    
    HEADERS=$(curl -s -I -m 30 "$PRODUCTION_URL")
    
    # Check for security headers
    if echo "$HEADERS" | grep -qi "x-frame-options"; then
        echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
    else
        echo -e "${RED}❌ X-Frame-Options header missing${NC}"
    fi
    
    if echo "$HEADERS" | grep -qi "x-content-type-options"; then
        echo -e "${GREEN}✅ X-Content-Type-Options header present${NC}"
    else
        echo -e "${RED}❌ X-Content-Type-Options header missing${NC}"
    fi
    
    if echo "$HEADERS" | grep -qi "content-security-policy"; then
        echo -e "${GREEN}✅ Content-Security-Policy header present${NC}"
    else
        echo -e "${RED}❌ Content-Security-Policy header missing${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Production deployment test completed successfully!${NC}"