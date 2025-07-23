#!/bin/bash

# System Validation Script for Hugo Deployment Fixes
# Comprehensive testing of all deployment fixes implemented
# Tests both local development and production deployment scenarios

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOCAL_URL="http://localhost:1313"
PRODUCTION_URL="https://hugo-overreacted-blog-staging.zjlgdx.workers.dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

echo -e "${BLUE}🧪 Hugo Deployment Fixes - System Validation${NC}"
echo "=============================================="
echo ""

# Function to print test results
print_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC} $message"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $test_name: FAIL${NC} $message"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Verify Hugo build works
echo -e "${BLUE}🏗️ Testing Hugo build process...${NC}"
cd "$PROJECT_ROOT"

if hugo --minify > /dev/null 2>&1; then
    print_result "Hugo Build" "PASS" "Site builds successfully"
else
    print_result "Hugo Build" "FAIL" "Site build failed"
fi

# Test 2: Check if validation script exists and is executable
echo -e "${BLUE}🔍 Checking validation tools...${NC}"

if [ -f "$SCRIPT_DIR/validate-deployment-fixes.js" ]; then
    print_result "Validation Script" "PASS" "Node.js validation script exists"
else
    print_result "Validation Script" "FAIL" "Node.js validation script missing"
fi

# Check Node.js and npm
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_result "Node.js" "PASS" "Version: $NODE_VERSION"
else
    print_result "Node.js" "FAIL" "Node.js not installed"
fi

# Check if Playwright is installed
if [ -f "$PROJECT_ROOT/node_modules/.bin/playwright" ] || command -v playwright >/dev/null 2>&1; then
    print_result "Playwright" "PASS" "Playwright is available"
else
    print_result "Playwright" "FAIL" "Playwright not installed"
fi

# Test 3: Start Hugo server and test locally
echo -e "${BLUE}🚀 Testing local development server...${NC}"

# Kill any existing Hugo server
pkill -f "hugo server" || true
sleep 2

# Start Hugo server in background
hugo server --port 1313 --bind 0.0.0.0 > /dev/null 2>&1 &
HUGO_PID=$!

# Wait for server to start
sleep 5

# Test if server is running
if curl -f -s -m 10 "$LOCAL_URL" > /dev/null; then
    print_result "Local Server" "PASS" "Hugo server started successfully"
    
    # Run comprehensive validation on local server
    echo -e "${BLUE}🧪 Running local validation tests...${NC}"
    
    if [ -f "$SCRIPT_DIR/validate-deployment-fixes.js" ]; then
        if SITE_URL="$LOCAL_URL" node "$SCRIPT_DIR/validate-deployment-fixes.js" > /dev/null 2>&1; then
            print_result "Local Validation" "PASS" "All local tests passed"
        else
            print_result "Local Validation" "FAIL" "Some local tests failed"
        fi
    else
        print_result "Local Validation" "FAIL" "Validation script not available"
    fi
else
    print_result "Local Server" "FAIL" "Hugo server failed to start"
fi

# Clean up Hugo server
kill $HUGO_PID 2>/dev/null || true

# Test 4: Test production deployment (if accessible)
echo -e "${BLUE}🌐 Testing production deployment...${NC}"

if curl -f -s -m 30 "$PRODUCTION_URL" > /dev/null; then
    print_result "Production Access" "PASS" "Production site is accessible"
    
    # Run comprehensive validation on production
    if [ -f "$SCRIPT_DIR/validate-deployment-fixes.js" ]; then
        if SITE_URL="$PRODUCTION_URL" node "$SCRIPT_DIR/validate-deployment-fixes.js" > /dev/null 2>&1; then
            print_result "Production Validation" "PASS" "All production tests passed"
        else
            print_result "Production Validation" "FAIL" "Some production tests failed"
        fi
    else
        print_result "Production Validation" "FAIL" "Validation script not available"
    fi
else
    print_result "Production Access" "FAIL" "Production site not accessible"
fi

# Test 5: Verify specific deployment fixes
echo -e "${BLUE}🔧 Testing specific deployment fixes...${NC}"

# Check if robots.txt exists in static directory
if [ -f "$PROJECT_ROOT/static/robots.txt" ]; then
    print_result "Robots.txt File" "PASS" "robots.txt exists in static directory"
else
    print_result "Robots.txt File" "FAIL" "robots.txt missing from static directory"
fi

# Check if security headers are implemented in Worker
if [ -f "$PROJECT_ROOT/src/index.js" ]; then
    if grep -q "X-Frame-Options" "$PROJECT_ROOT/src/index.js"; then
        print_result "Security Headers Code" "PASS" "Security headers implemented in Worker"
    else
        print_result "Security Headers Code" "FAIL" "Security headers not found in Worker code"
    fi
else
    print_result "Security Headers Code" "FAIL" "Worker script not found"
fi

# Check if viewport meta tag is in templates
if find "$PROJECT_ROOT/layouts" -name "*.html" -exec grep -l "viewport" {} \; | head -1 > /dev/null; then
    print_result "Viewport Meta Tag" "PASS" "Viewport meta tag found in templates"
else
    print_result "Viewport Meta Tag" "FAIL" "Viewport meta tag not found in templates"
fi

# Check if theme switcher JavaScript exists
if [ -f "$PROJECT_ROOT/assets/js/theme-switcher.js" ]; then
    print_result "Theme Switcher JS" "PASS" "Theme switcher JavaScript file exists"
else
    print_result "Theme Switcher JS" "FAIL" "Theme switcher JavaScript file missing"
fi

# Check if SEO meta tags are in templates
if find "$PROJECT_ROOT/layouts" -name "*.html" -exec grep -l "meta.*description\|canonical" {} \; | head -1 > /dev/null; then
    print_result "SEO Meta Tags" "PASS" "SEO meta tags found in templates"
else
    print_result "SEO Meta Tags" "FAIL" "SEO meta tags not found in templates"
fi

# Test 6: Verify build artifacts
echo -e "${BLUE}📦 Testing build artifacts...${NC}"

if [ -d "$PROJECT_ROOT/public" ]; then
    print_result "Public Directory" "PASS" "Public directory exists"
    
    # Check for essential files
    if [ -f "$PROJECT_ROOT/public/index.html" ]; then
        print_result "Index HTML" "PASS" "index.html generated"
    else
        print_result "Index HTML" "FAIL" "index.html not generated"
    fi
    
    if [ -f "$PROJECT_ROOT/public/robots.txt" ]; then
        print_result "Built Robots.txt" "PASS" "robots.txt copied to public"
    else
        print_result "Built Robots.txt" "FAIL" "robots.txt not in public directory"
    fi
    
    if [ -f "$PROJECT_ROOT/public/sitemap.xml" ]; then
        print_result "Sitemap" "PASS" "sitemap.xml generated"
    else
        print_result "Sitemap" "FAIL" "sitemap.xml not generated"
    fi
    
    # Check for CSS files
    if find "$PROJECT_ROOT/public" -name "*.css" | head -1 > /dev/null; then
        print_result "CSS Assets" "PASS" "CSS files generated"
    else
        print_result "CSS Assets" "FAIL" "No CSS files found"
    fi
    
    # Check for JS files
    if find "$PROJECT_ROOT/public" -name "*.js" | head -1 > /dev/null; then
        print_result "JS Assets" "PASS" "JavaScript files generated"
    else
        print_result "JS Assets" "FAIL" "No JavaScript files found"
    fi
else
    print_result "Public Directory" "FAIL" "Public directory not found"
fi

# Final Summary
echo ""
echo -e "${BLUE}📊 System Validation Summary${NC}"
echo "=============================="
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All system validation tests passed!${NC}"
    echo -e "${GREEN}✅ Hugo deployment fixes are working correctly${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ $TESTS_FAILED test(s) failed${NC}"
    echo -e "${YELLOW}⚠️ Please review the failed tests and fix any issues${NC}"
    exit 1
fi