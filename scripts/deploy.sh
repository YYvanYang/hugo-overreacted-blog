#!/bin/bash

# Deployment Script for Hugo Overreacted Blog
# Supports staging and production environments with Cloudflare Workers
# Enhanced with CI/CD support and comprehensive testing
# Requirements: 9.1, 9.2, 9.3, 9.4, 9.5

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration with CI/CD environment detection
ENVIRONMENT=${1:-staging}
WRANGLER_CONFIG="wrangler.toml"
CI=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}
DRY_RUN=${DRY_RUN:-false}

echo -e "${BLUE}🚀 Starting deployment to $ENVIRONMENT environment${NC}"
echo "CI Mode: $CI"
echo "Dry Run: $DRY_RUN"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check dependencies
echo -e "${BLUE}📋 Checking deployment dependencies...${NC}"

if ! command_exists wrangler; then
    print_error "Wrangler CLI is not installed. Install with: npm install -g wrangler"
fi

if ! command_exists hugo; then
    print_error "Hugo is not installed"
fi

# Check if wrangler.toml exists
if [ ! -f "$WRANGLER_CONFIG" ]; then
    print_error "$WRANGLER_CONFIG not found"
fi

# Verify Wrangler authentication in CI
if [ "$CI" = "true" ]; then
    echo -e "${BLUE}🔐 Verifying Cloudflare authentication...${NC}"
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        print_error "CLOUDFLARE_API_TOKEN environment variable is required in CI"
    fi
    
    if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
        print_error "CLOUDFLARE_ACCOUNT_ID environment variable is required in CI"
    fi
    
    # Test authentication
    if wrangler whoami > /dev/null 2>&1; then
        print_status "Cloudflare authentication verified"
    else
        print_error "Cloudflare authentication failed"
    fi
fi

print_status "All deployment dependencies satisfied"

# Validate environment
case $ENVIRONMENT in
    staging|production)
        print_status "Valid environment: $ENVIRONMENT"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT. Valid environments: staging, production"
        ;;
esac

# Set environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    export HUGO_ENV=production
    export NODE_ENV=production
    EXPECTED_URL="https://hugo-overreacted-blog.workers.dev"
else
    export HUGO_ENV=development
    export NODE_ENV=development
    EXPECTED_URL="https://hugo-overreacted-blog-staging.workers.dev"
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if build output exists and is recent
if [ ! -d "public" ]; then
    echo -e "${BLUE}🏗️  No build output found, building site...${NC}"
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build:production
    else
        npm run build:development
    fi
else
    # Check if build is recent (less than 1 hour old)
    if [ "$(find public -maxdepth 0 -mmin -60)" ]; then
        print_status "Recent build output found"
    else
        print_warning "Build output is older than 1 hour, consider rebuilding"
        if [ "$CI" = "true" ]; then
            echo -e "${BLUE}🏗️  Rebuilding in CI environment...${NC}"
            if [ "$ENVIRONMENT" = "production" ]; then
                npm run build:production
            else
                npm run build:development
            fi
        fi
    fi
fi

# Verify build output
echo -e "${BLUE}🔍 Verifying build output...${NC}"
CRITICAL_FILES=("public/index.html" "public/404.html" "public/sitemap.xml")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$(basename "$file") exists"
    else
        print_error "$(basename "$file") not found in build output"
    fi
done

# Check build size
if [ -d "public" ]; then
    BUILD_SIZE=$(du -sh public | cut -f1)
    FILE_COUNT=$(find public -type f | wc -l)
    echo -e "${BLUE}Build size: $BUILD_SIZE ($FILE_COUNT files)${NC}"
    
    # GitHub Actions output
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "deployment-size=$BUILD_SIZE" >> $GITHUB_OUTPUT
        echo "deployment-files=$FILE_COUNT" >> $GITHUB_OUTPUT
        echo "deployment-url=$EXPECTED_URL" >> $GITHUB_OUTPUT
    fi
fi

# Dry run mode - skip actual deployment
if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}🧪 DRY RUN MODE - Skipping actual deployment${NC}"
    echo "Would deploy to: $EXPECTED_URL"
    echo "Environment: $ENVIRONMENT"
    echo "Build verified and ready for deployment"
    exit 0
fi

# Deploy to Cloudflare Workers
echo -e "${BLUE}🚀 Deploying to Cloudflare Workers ($ENVIRONMENT)...${NC}"

DEPLOY_START_TIME=$(date +%s)

# Capture deployment output
if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_OUTPUT=$(wrangler deploy --env production 2>&1)
else
    DEPLOY_OUTPUT=$(wrangler deploy --env staging 2>&1)
fi

DEPLOY_END_TIME=$(date +%s)
DEPLOY_DURATION=$((DEPLOY_END_TIME - DEPLOY_START_TIME))

echo "$DEPLOY_OUTPUT"

# Check if deployment was successful
if echo "$DEPLOY_OUTPUT" | grep -q "Published"; then
    print_status "Deployment completed in ${DEPLOY_DURATION}s"
else
    print_error "Deployment may have failed. Check output above."
fi

# Extract deployment URL from output if available
DEPLOYED_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^[:space:]]+' | head -1 || echo "$EXPECTED_URL")

# Post-deployment verification
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

# Wait for deployment to propagate
WAIT_TIME=10
if [ "$ENVIRONMENT" = "production" ]; then
    WAIT_TIME=15
fi

echo "Waiting ${WAIT_TIME}s for deployment to propagate..."
sleep $WAIT_TIME

# Comprehensive deployment testing
echo -e "${BLUE}🧪 Testing deployment at $DEPLOYED_URL...${NC}"

# Test main page
if curl -f -s -m 30 "$DEPLOYED_URL" > /dev/null; then
    print_status "Site is accessible"
    
    # Test page content
    RESPONSE=$(curl -s -m 30 "$DEPLOYED_URL")
    if echo "$RESPONSE" | grep -q "Hugo Overreacted Blog"; then
        print_status "Site title found in response"
    else
        print_warning "Site title not found in response"
    fi
    
    # Test theme switcher
    if echo "$RESPONSE" | grep -q "theme-switcher"; then
        print_status "Theme switcher functionality detected"
    else
        print_warning "Theme switcher not detected"
    fi
    
else
    print_warning "Site may not be immediately accessible (DNS propagation)"
fi

# Test 404 page
echo -e "${BLUE}Testing 404 page handling...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYED_URL/nonexistent-page" || echo "000")
if [ "$HTTP_CODE" = "404" ]; then
    print_status "404 handling is working correctly"
elif [ "$HTTP_CODE" = "200" ]; then
    print_warning "404 page returns 200 (may be SPA behavior)"
else
    print_warning "Unexpected HTTP code for 404 test: $HTTP_CODE"
fi

# Test CSS loading
echo -e "${BLUE}Testing asset loading...${NC}"
CSS_TEST=$(curl -s -m 10 "$DEPLOYED_URL" | grep -o 'href="[^"]*\.css[^"]*"' | head -1 | sed 's/href="//;s/"//')
if [ -n "$CSS_TEST" ]; then
    CSS_URL="$DEPLOYED_URL$CSS_TEST"
    if curl -f -s -m 10 "$CSS_URL" > /dev/null; then
        print_status "CSS assets are loading correctly"
    else
        print_warning "CSS assets may not be loading correctly"
    fi
fi

# Performance test
echo -e "${BLUE}Running basic performance test...${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' -m 30 "$DEPLOYED_URL" || echo "0")
if [ "$RESPONSE_TIME" != "0" ]; then
    echo "Response time: ${RESPONSE_TIME}s"
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo "1") )); then
        print_status "Response time is acceptable"
    else
        print_warning "Response time is slower than expected"
    fi
fi

# Security headers test
echo -e "${BLUE}Checking security headers...${NC}"
HEADERS=$(curl -s -I -m 10 "$DEPLOYED_URL" || echo "")
if echo "$HEADERS" | grep -qi "x-frame-options\|content-security-policy"; then
    print_status "Security headers detected"
else
    print_warning "Consider adding security headers"
fi

# Display deployment summary
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "Environment: $ENVIRONMENT"
echo "Site URL: $DEPLOYED_URL"
echo "Deployment Time: $(date)"
echo "Deploy Duration: ${DEPLOY_DURATION}s"
echo "Build Size: ${BUILD_SIZE:-unknown}"

# Get additional build information if available
if [ -f "public/build-info.json" ]; then
    if command_exists jq; then
        BUILD_TIME=$(jq -r '.buildTime' public/build-info.json 2>/dev/null || echo "unknown")
        HUGO_VERSION=$(jq -r '.hugoVersion' public/build-info.json 2>/dev/null || echo "unknown")
        echo "Build Time: $BUILD_TIME"
        echo "Hugo Version: $HUGO_VERSION"
    fi
fi

# GitHub Actions summary
if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "## Deployment Summary" >> $GITHUB_STEP_SUMMARY
    echo "- **Environment**: $ENVIRONMENT" >> $GITHUB_STEP_SUMMARY
    echo "- **URL**: $DEPLOYED_URL" >> $GITHUB_STEP_SUMMARY
    echo "- **Status**: ✅ Deployed successfully" >> $GITHUB_STEP_SUMMARY
    echo "- **Duration**: ${DEPLOY_DURATION}s" >> $GITHUB_STEP_SUMMARY
    echo "- **Size**: ${BUILD_SIZE:-unknown}" >> $GITHUB_STEP_SUMMARY
fi

print_status "Deployment to $ENVIRONMENT completed successfully!"

# Display next steps
echo -e "${BLUE}🎯 Next steps:${NC}"
if [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "  • Test the staging site: ${GREEN}$DEPLOYED_URL${NC}"
    echo -e "  • Deploy to production: ${GREEN}npm run deploy:production${NC}"
    echo -e "  • Run comprehensive tests: ${GREEN}npm run test:deployment${NC}"
else
    echo -e "  • Visit your production site: ${GREEN}$DEPLOYED_URL${NC}"
    echo -e "  • Monitor performance and logs in Cloudflare dashboard"
    echo -e "  • Set up monitoring and alerts for production"
fi

exit 0