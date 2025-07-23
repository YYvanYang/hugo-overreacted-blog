#!/bin/bash

# Deployment Testing Script for Hugo Overreacted Blog
# Comprehensive testing suite for deployed Hugo blog on Cloudflare Workers
# Tests functionality, performance, accessibility, and SEO
# Enhanced with CI/CD support and detailed reporting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration with CI/CD environment detection
SITE_URL=${SITE_URL:-"https://hugo-overreacted-blog-staging.zjlgdx.workers.dev"}
TIMEOUT=30
MAX_RETRIES=3
CI=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}
GENERATE_REPORT=${1:-false}

# Test counters
TESTS_PASSED=0
TESTS_WARNED=0
TESTS_FAILED=0
TOTAL_TESTS=0

echo -e "${BLUE}🧪 Starting comprehensive deployment testing${NC}"
echo "Testing site: $SITE_URL"
echo "CI Mode: $CI"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print test results
print_test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC} $message"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    elif [ "$result" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $test_name: WARN${NC} $message"
        TESTS_WARNED=$((TESTS_WARNED + 1))
    else
        echo -e "${RED}❌ $test_name: FAIL${NC} $message"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to retry HTTP requests
retry_request() {
    local url="$1"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s -m $TIMEOUT "$url" > /dev/null; then
            return 0
        fi
        retries=$((retries + 1))
        sleep 2
    done
    return 1
}

# Test 1: Basic Connectivity
echo -e "${BLUE}🌐 Testing basic connectivity...${NC}"
if retry_request "$SITE_URL"; then
    print_test_result "Basic Connectivity" "PASS" "Site is accessible"
else
    print_test_result "Basic Connectivity" "FAIL" "Site is not accessible"
    if [ "$CI" = "true" ]; then
        echo "::error::Site is not accessible at $SITE_URL"
        exit 1
    fi
fi

# Test 2: HTTP Status Codes
echo -e "${BLUE}📊 Testing HTTP status codes...${NC}"

# Test main page
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "$SITE_URL" || echo "000")
if [ "$STATUS_CODE" = "200" ]; then
    print_test_result "Main Page Status" "PASS" "Returns 200 OK"
else
    print_test_result "Main Page Status" "FAIL" "Returns $STATUS_CODE"
fi

# Test 404 page
STATUS_404=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "$SITE_URL/nonexistent-page" || echo "000")
if [ "$STATUS_404" = "404" ]; then
    print_test_result "404 Page Status" "PASS" "Returns 404 Not Found"
elif [ "$STATUS_404" = "200" ]; then
    print_test_result "404 Page Status" "WARN" "Returns 200 (SPA behavior)"
else
    print_test_result "404 Page Status" "FAIL" "Returns $STATUS_404"
fi

# Test robots.txt
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "$SITE_URL/robots.txt" || echo "000")
if [ "$ROBOTS_STATUS" = "200" ]; then
    print_test_result "Robots.txt" "PASS" "Robots.txt accessible"
else
    print_test_result "Robots.txt" "WARN" "Robots.txt not accessible"
fi

# Test 3: Content Validation
echo -e "${BLUE}📝 Testing content validation...${NC}"

RESPONSE=$(curl -s -m $TIMEOUT "$SITE_URL" || echo "")

# Check for essential content
if echo "$RESPONSE" | grep -q "Hugo Overreacted Blog"; then
    print_test_result "Site Title" "PASS" "Title found in HTML"
else
    print_test_result "Site Title" "FAIL" "Title not found in HTML"
fi

# Check for theme switcher
if echo "$RESPONSE" | grep -q "theme-switcher\|theme-toggle"; then
    print_test_result "Theme Switcher" "PASS" "Theme switcher detected"
else
    print_test_result "Theme Switcher" "WARN" "Theme switcher not detected"
fi

# Check for navigation
if echo "$RESPONSE" | grep -q "nav\|menu"; then
    print_test_result "Navigation" "PASS" "Navigation elements found"
else
    print_test_result "Navigation" "WARN" "Navigation elements not clearly detected"
fi

# Check for footer
if echo "$RESPONSE" | grep -q "<footer"; then
    print_test_result "Footer" "PASS" "Footer element found"
else
    print_test_result "Footer" "WARN" "Footer element not found"
fi

# Test 4: Asset Loading
echo -e "${BLUE}🎨 Testing asset loading...${NC}"

# Test CSS loading
CSS_LINKS=$(echo "$RESPONSE" | grep -o 'href="[^"]*\.css[^"]*"' | head -5)
CSS_PASS=0
CSS_TOTAL=0

if [ -n "$CSS_LINKS" ]; then
    while IFS= read -r css_link; do
        if [ -n "$css_link" ]; then
            CSS_TOTAL=$((CSS_TOTAL + 1))
            CSS_URL=$(echo "$css_link" | sed 's/href="//;s/"//')
            
            # Handle relative URLs
            if [[ "$CSS_URL" == /* ]]; then
                CSS_URL="$SITE_URL$CSS_URL"
            elif [[ "$CSS_URL" != http* ]]; then
                CSS_URL="$SITE_URL/$CSS_URL"
            fi
            
            if curl -f -s -m 10 "$CSS_URL" > /dev/null; then
                CSS_PASS=$((CSS_PASS + 1))
            fi
        fi
    done <<< "$CSS_LINKS"
    
    if [ $CSS_PASS -eq $CSS_TOTAL ] && [ $CSS_TOTAL -gt 0 ]; then
        print_test_result "CSS Assets" "PASS" "$CSS_PASS/$CSS_TOTAL CSS files loading"
    elif [ $CSS_PASS -gt 0 ]; then
        print_test_result "CSS Assets" "WARN" "$CSS_PASS/$CSS_TOTAL CSS files loading"
    else
        print_test_result "CSS Assets" "FAIL" "No CSS files loading"
    fi
else
    print_test_result "CSS Assets" "WARN" "No CSS links found"
fi

# Test JavaScript loading
JS_LINKS=$(echo "$RESPONSE" | grep -o 'src="[^"]*\.js[^"]*"' | head -5)
JS_PASS=0
JS_TOTAL=0

if [ -n "$JS_LINKS" ]; then
    while IFS= read -r js_link; do
        if [ -n "$js_link" ]; then
            JS_TOTAL=$((JS_TOTAL + 1))
            JS_URL=$(echo "$js_link" | sed 's/src="//;s/"//')
            
            # Handle relative URLs
            if [[ "$JS_URL" == /* ]]; then
                JS_URL="$SITE_URL$JS_URL"
            elif [[ "$JS_URL" != http* ]]; then
                JS_URL="$SITE_URL/$JS_URL"
            fi
            
            if curl -f -s -m 10 "$JS_URL" > /dev/null; then
                JS_PASS=$((JS_PASS + 1))
            fi
        fi
    done <<< "$JS_LINKS"
    
    if [ $JS_PASS -eq $JS_TOTAL ] && [ $JS_TOTAL -gt 0 ]; then
        print_test_result "JavaScript Assets" "PASS" "$JS_PASS/$JS_TOTAL JS files loading"
    elif [ $JS_PASS -gt 0 ]; then
        print_test_result "JavaScript Assets" "WARN" "$JS_PASS/$JS_TOTAL JS files loading"
    else
        print_test_result "JavaScript Assets" "WARN" "No JS files loading"
    fi
else
    print_test_result "JavaScript Assets" "WARN" "No JavaScript links found"
fi

# Test 5: Performance
echo -e "${BLUE}⚡ Testing performance...${NC}"

# Response time test
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' -m $TIMEOUT "$SITE_URL" || echo "0")
if [ "$RESPONSE_TIME" != "0" ]; then
    if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null || echo "0") )); then
        print_test_result "Response Time" "PASS" "${RESPONSE_TIME}s (excellent)"
    elif (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo "0") )); then
        print_test_result "Response Time" "PASS" "${RESPONSE_TIME}s (good)"
    elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l 2>/dev/null || echo "0") )); then
        print_test_result "Response Time" "WARN" "${RESPONSE_TIME}s (acceptable)"
    else
        print_test_result "Response Time" "FAIL" "${RESPONSE_TIME}s (too slow)"
    fi
else
    print_test_result "Response Time" "FAIL" "Could not measure response time"
fi

# Content size test
CONTENT_SIZE=$(curl -s -w '%{size_download}' -o /dev/null -m $TIMEOUT "$SITE_URL" || echo "0")
if [ "$CONTENT_SIZE" -gt 0 ]; then
    CONTENT_SIZE_KB=$((CONTENT_SIZE / 1024))
    if [ $CONTENT_SIZE_KB -lt 100 ]; then
        print_test_result "Content Size" "PASS" "${CONTENT_SIZE_KB}KB (optimized)"
    elif [ $CONTENT_SIZE_KB -lt 500 ]; then
        print_test_result "Content Size" "PASS" "${CONTENT_SIZE_KB}KB (reasonable)"
    else
        print_test_result "Content Size" "WARN" "${CONTENT_SIZE_KB}KB (consider optimization)"
    fi
else
    print_test_result "Content Size" "FAIL" "Could not measure content size"
fi

# Test 6: SEO and Meta Tags
echo -e "${BLUE}🔍 Testing SEO and meta tags...${NC}"

# Check for title tag
if echo "$RESPONSE" | grep -q "<title>"; then
    print_test_result "Title Tag" "PASS" "Title tag present"
else
    print_test_result "Title Tag" "FAIL" "Title tag missing"
fi

# Check for meta description
if echo "$RESPONSE" | grep -q 'name=description\|name="description"'; then
    print_test_result "Meta Description" "PASS" "Meta description present"
else
    print_test_result "Meta Description" "WARN" "Meta description missing"
fi

# Check for Open Graph tags
if echo "$RESPONSE" | grep -q 'property="og:'; then
    print_test_result "Open Graph Tags" "PASS" "Open Graph tags present"
else
    print_test_result "Open Graph Tags" "WARN" "Open Graph tags missing"
fi

# Check for canonical URL
if echo "$RESPONSE" | grep -q 'rel=canonical\|rel="canonical"'; then
    print_test_result "Canonical URL" "PASS" "Canonical URL present"
else
    print_test_result "Canonical URL" "WARN" "Canonical URL missing"
fi

# Check for viewport meta tag
if echo "$RESPONSE" | grep -q 'name=viewport\|name="viewport"'; then
    print_test_result "Viewport Meta Tag" "PASS" "Viewport meta tag present"
else
    print_test_result "Viewport Meta Tag" "FAIL" "Viewport meta tag missing"
fi

# Test 7: Security Headers
echo -e "${BLUE}🔒 Testing security headers...${NC}"

HEADERS=$(curl -s -I -m $TIMEOUT "$SITE_URL" || echo "")

# Check for security headers
if echo "$HEADERS" | grep -qi "x-frame-options"; then
    print_test_result "X-Frame-Options" "PASS" "Header present"
else
    print_test_result "X-Frame-Options" "WARN" "Header missing"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    print_test_result "X-Content-Type-Options" "PASS" "Header present"
else
    print_test_result "X-Content-Type-Options" "WARN" "Header missing"
fi

if echo "$HEADERS" | grep -qi "content-security-policy"; then
    print_test_result "Content-Security-Policy" "PASS" "Header present"
else
    print_test_result "Content-Security-Policy" "WARN" "Header missing"
fi

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    print_test_result "HSTS" "PASS" "HSTS header present"
else
    print_test_result "HSTS" "WARN" "HSTS header missing"
fi

# Test 8: Accessibility
echo -e "${BLUE}♿ Testing basic accessibility...${NC}"

# Check for alt attributes on images
IMG_COUNT=$(echo "$RESPONSE" | grep -o '<img[^>]*>' | wc -l)
IMG_WITH_ALT=$(echo "$RESPONSE" | grep -o '<img[^>]*alt=' | wc -l)

if [ $IMG_COUNT -eq 0 ]; then
    print_test_result "Image Alt Text" "PASS" "No images found"
elif [ $IMG_WITH_ALT -eq $IMG_COUNT ]; then
    print_test_result "Image Alt Text" "PASS" "All images have alt text"
else
    print_test_result "Image Alt Text" "WARN" "$IMG_WITH_ALT/$IMG_COUNT images have alt text"
fi

# Check for skip links
if echo "$RESPONSE" | grep -q 'skip.*content\|skip.*main'; then
    print_test_result "Skip Links" "PASS" "Skip to content link found"
else
    print_test_result "Skip Links" "WARN" "Skip to content link not found"
fi

# Check for semantic HTML
if echo "$RESPONSE" | grep -q '<main\|<nav\|<header\|<footer\|<article\|<section'; then
    print_test_result "Semantic HTML" "PASS" "Semantic HTML elements found"
else
    print_test_result "Semantic HTML" "WARN" "Limited semantic HTML detected"
fi

# Check for lang attribute
if echo "$RESPONSE" | grep -q 'lang='; then
    print_test_result "Language Attribute" "PASS" "Language attribute found"
else
    print_test_result "Language Attribute" "WARN" "Language attribute missing"
fi

# Test 9: Hugo-specific Features
echo -e "${BLUE}🏗️  Testing Hugo-specific features...${NC}"

# Check for Hugo generator meta tag
if echo "$RESPONSE" | grep -q 'generator.*Hugo'; then
    print_test_result "Hugo Generator" "PASS" "Hugo generator meta tag found"
else
    print_test_result "Hugo Generator" "WARN" "Hugo generator meta tag not found"
fi

# Check for sitemap
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "$SITE_URL/sitemap.xml" || echo "000")
if [ "$SITEMAP_STATUS" = "200" ]; then
    print_test_result "Sitemap" "PASS" "Sitemap.xml accessible"
else
    print_test_result "Sitemap" "WARN" "Sitemap.xml not accessible"
fi

# Check for RSS feed
RSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "$SITE_URL/index.xml" || echo "000")
if [ "$RSS_STATUS" = "200" ]; then
    print_test_result "RSS Feed" "PASS" "RSS feed accessible"
else
    print_test_result "RSS Feed" "WARN" "RSS feed not accessible"
fi

# Test 10: Theme Functionality
echo -e "${BLUE}🎨 Testing theme functionality...${NC}"

# Check for theme-related CSS classes
if echo "$RESPONSE" | grep -q 'dark\|light\|theme'; then
    print_test_result "Theme CSS Classes" "PASS" "Theme-related CSS classes found"
else
    print_test_result "Theme CSS Classes" "WARN" "Theme-related CSS classes not detected"
fi

# Check for syntax highlighting
if echo "$RESPONSE" | grep -q 'highlight\|chroma'; then
    print_test_result "Syntax Highlighting" "PASS" "Syntax highlighting CSS detected"
else
    print_test_result "Syntax Highlighting" "WARN" "Syntax highlighting not detected"
fi

# Test 11: Cloudflare Workers Specific
echo -e "${BLUE}☁️  Testing Cloudflare Workers specific features...${NC}"

# Check for Cloudflare headers
if echo "$HEADERS" | grep -qi "cf-ray\|cloudflare"; then
    print_test_result "Cloudflare Headers" "PASS" "Cloudflare headers detected"
else
    print_test_result "Cloudflare Headers" "WARN" "Cloudflare headers not detected"
fi

# Check for edge caching
if echo "$HEADERS" | grep -qi "cf-cache-status"; then
    print_test_result "Edge Caching" "PASS" "Edge caching headers present"
else
    print_test_result "Edge Caching" "WARN" "Edge caching headers not detected"
fi

# Final Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "Site URL: $SITE_URL"
echo "Test completed at: $(date)"
echo "Total tests: $TOTAL_TESTS"
echo "Passed: $TESTS_PASSED"
echo "Warnings: $TESTS_WARNED"
echo "Failed: $TESTS_FAILED"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))
    echo "Success rate: ${SUCCESS_RATE}%"
    
    # GitHub Actions output
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "test-total=$TOTAL_TESTS" >> $GITHUB_OUTPUT
        echo "test-passed=$TESTS_PASSED" >> $GITHUB_OUTPUT
        echo "test-warned=$TESTS_WARNED" >> $GITHUB_OUTPUT
        echo "test-failed=$TESTS_FAILED" >> $GITHUB_OUTPUT
        echo "success-rate=$SUCCESS_RATE" >> $GITHUB_OUTPUT
        
        # Add to step summary
        echo "## Test Results Summary" >> $GITHUB_STEP_SUMMARY
        echo "- **Total Tests**: $TOTAL_TESTS" >> $GITHUB_STEP_SUMMARY
        echo "- **Passed**: $TESTS_PASSED" >> $GITHUB_STEP_SUMMARY
        echo "- **Warnings**: $TESTS_WARNED" >> $GITHUB_STEP_SUMMARY
        echo "- **Failed**: $TESTS_FAILED" >> $GITHUB_STEP_SUMMARY
        echo "- **Success Rate**: ${SUCCESS_RATE}%" >> $GITHUB_STEP_SUMMARY
    fi
fi

# Determine exit code
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Some tests failed${NC}"
    EXIT_CODE=1
elif [ $TESTS_WARNED -gt 5 ]; then
    echo -e "${YELLOW}⚠️  Many warnings detected${NC}"
    EXIT_CODE=0
else
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    EXIT_CODE=0
fi

# Generate detailed report if requested
if [ "$GENERATE_REPORT" = "--report" ] || [ "$GENERATE_REPORT" = "true" ]; then
    echo -e "${BLUE}📄 Generating detailed report...${NC}"
    
    REPORT_FILE="deployment-test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "Hugo Overreacted Blog - Deployment Test Report"
        echo "=============================================="
        echo "Site URL: $SITE_URL"
        echo "Test Date: $(date)"
        echo "Total Tests: $TOTAL_TESTS"
        echo "Passed: $TESTS_PASSED"
        echo "Warnings: $TESTS_WARNED"
        echo "Failed: $TESTS_FAILED"
        echo "Success Rate: ${SUCCESS_RATE}%"
        echo ""
        echo "This report contains the results of comprehensive deployment testing"
        echo "including connectivity, performance, SEO, accessibility, and security checks."
        echo ""
        echo "Test Categories:"
        echo "- Basic Connectivity and HTTP Status Codes"
        echo "- Content Validation"
        echo "- Asset Loading (CSS/JS)"
        echo "- Performance Metrics"
        echo "- SEO and Meta Tags"
        echo "- Security Headers"
        echo "- Accessibility Features"
        echo "- Hugo-specific Features"
        echo "- Theme Functionality"
        echo "- Cloudflare Workers Features"
        echo ""
        echo "For detailed results, see the console output."
    } > "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Report saved to: $REPORT_FILE${NC}"
fi

exit $EXIT_CODE