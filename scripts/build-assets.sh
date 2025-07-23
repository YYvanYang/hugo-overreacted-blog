#!/bin/bash

# Asset Processing and Optimization Build Script
# Enhanced build automation for Hugo Overreacted Blog template
# Requirements: 8.3, 8.4, 8.5

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration with CI/CD environment detection
HUGO_ENV=${HUGO_ENV:-production}
NODE_ENV=${NODE_ENV:-production}
HUGO_VERSION_MIN="0.148.1"
NODE_VERSION_MIN="18.0.0"
CI=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}
VALIDATE_ONLY=${1:-false}

# Directories
ASSETS_DIR="assets"
PUBLIC_DIR="public"
RESOURCES_DIR="resources"
CACHE_DIR="tmp/hugo_cache"

echo -e "${BLUE}🚀 Starting Hugo Asset Processing Pipeline${NC}"
echo "Environment: $HUGO_ENV"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare versions
version_compare() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Check dependencies
echo -e "${BLUE}📋 Checking dependencies...${NC}"

if ! command_exists hugo; then
    echo -e "${RED}❌ Hugo is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check Hugo version
HUGO_VERSION=$(hugo version | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sed 's/v//')
if ! version_compare "$HUGO_VERSION" "$HUGO_VERSION_MIN"; then
    echo -e "${RED}❌ Hugo version $HUGO_VERSION is below minimum required $HUGO_VERSION_MIN${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
if ! version_compare "$NODE_VERSION" "$NODE_VERSION_MIN"; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is below minimum required $NODE_VERSION_MIN${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies satisfied${NC}"

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf "$PUBLIC_DIR"
rm -rf "$RESOURCES_DIR/_gen"

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    if [ "$CI" = "true" ]; then
        # Use npm ci in CI environments for faster, reliable builds
        npm ci --prefer-offline --no-audit --silent
    else
        npm ci --silent
    fi
fi

# Verify TailwindCSS CLI availability
echo -e "${BLUE}🎨 Verifying TailwindCSS CLI...${NC}"
if command_exists tailwindcss; then
    echo -e "${GREEN}✅ TailwindCSS CLI found: $(which tailwindcss)${NC}"
    tailwindcss --version
elif [ -f "./node_modules/.bin/tailwindcss" ]; then
    echo -e "${GREEN}✅ TailwindCSS CLI found in node_modules${NC}"
    ./node_modules/.bin/tailwindcss --version
    if [ "$CI" = "true" ]; then
        echo "Adding node_modules/.bin to PATH for CI environment"
        export PATH="$(pwd)/node_modules/.bin:$PATH"
    fi
else
    echo -e "${RED}❌ TailwindCSS CLI not found${NC}"
    echo "Please ensure TailwindCSS is installed: npm install -D tailwindcss @tailwindcss/cli"
    exit 1
fi

# Generate Chroma CSS files for syntax highlighting if they don't exist
echo -e "${BLUE}🎨 Generating syntax highlighting CSS...${NC}"

if [ ! -f "$ASSETS_DIR/css/chroma-light.css" ]; then
    echo "Generating light theme syntax highlighting..."
    hugo gen chromastyles --style=github > "$ASSETS_DIR/css/chroma-light.css"
fi

if [ ! -f "$ASSETS_DIR/css/chroma-dark.css" ]; then
    echo "Generating dark theme syntax highlighting..."
    hugo gen chromastyles --style=github-dark > "$ASSETS_DIR/css/chroma-dark.css"
fi

# Asset optimization flags
HUGO_FLAGS="--gc --minify"

# Add cache directory if specified (use absolute path)
if [ -n "$CACHE_DIR" ]; then
    CACHE_DIR_ABS="$(pwd)/$CACHE_DIR"
    HUGO_FLAGS="$HUGO_FLAGS --cacheDir $CACHE_DIR_ABS"
fi

# Add environment-specific flags
if [ "$HUGO_ENV" = "production" ]; then
    HUGO_FLAGS="$HUGO_FLAGS --environment production"
    export HUGO_ENVIRONMENT=production
else
    HUGO_FLAGS="$HUGO_FLAGS --environment development --buildDrafts --buildFuture"
    export HUGO_ENVIRONMENT=development
fi

# Build the site with asset optimization
echo -e "${BLUE}🏗️  Building Hugo site with asset optimization...${NC}"
echo "Hugo flags: $HUGO_FLAGS"

if hugo $HUGO_FLAGS; then
    echo -e "${GREEN}✅ Hugo build completed successfully${NC}"
else
    echo -e "${RED}❌ Hugo build failed${NC}"
    exit 1
fi

# Post-build asset optimization
echo -e "${BLUE}⚡ Running post-build optimizations...${NC}"

# Compress static assets if gzip is available
if command_exists gzip; then
    echo "Compressing CSS and JS files..."
    find "$PUBLIC_DIR" -type f \( -name "*.css" -o -name "*.js" \) -exec gzip -k {} \;
fi

# Generate asset manifest for cache busting
echo -e "${BLUE}📋 Generating asset manifest...${NC}"
cat > "$PUBLIC_DIR/asset-manifest.json" << EOF
{
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$HUGO_ENV",
  "hugo_version": "$HUGO_VERSION",
  "assets": {
EOF

# Add CSS assets to manifest
CSS_FILES=$(find "$PUBLIC_DIR" -name "*.css" -type f | head -10)
if [ -n "$CSS_FILES" ]; then
    echo '    "css": [' >> "$PUBLIC_DIR/asset-manifest.json"
    echo "$CSS_FILES" | while read -r file; do
        rel_path=${file#$PUBLIC_DIR/}
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        echo "      {\"path\": \"/$rel_path\", \"size\": $size}," >> "$PUBLIC_DIR/asset-manifest.json"
    done
    # Remove trailing comma
    sed -i.bak '$ s/,$//' "$PUBLIC_DIR/asset-manifest.json" && rm "$PUBLIC_DIR/asset-manifest.json.bak"
    echo '    ],' >> "$PUBLIC_DIR/asset-manifest.json"
fi

# Add JS assets to manifest
JS_FILES=$(find "$PUBLIC_DIR" -name "*.js" -type f | head -10)
if [ -n "$JS_FILES" ]; then
    echo '    "js": [' >> "$PUBLIC_DIR/asset-manifest.json"
    echo "$JS_FILES" | while read -r file; do
        rel_path=${file#$PUBLIC_DIR/}
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        echo "      {\"path\": \"/$rel_path\", \"size\": $size}," >> "$PUBLIC_DIR/asset-manifest.json"
    done
    # Remove trailing comma
    sed -i.bak '$ s/,$//' "$PUBLIC_DIR/asset-manifest.json" && rm "$PUBLIC_DIR/asset-manifest.json.bak"
    echo '    ]' >> "$PUBLIC_DIR/asset-manifest.json"
fi

echo '  }' >> "$PUBLIC_DIR/asset-manifest.json"
echo '}' >> "$PUBLIC_DIR/asset-manifest.json"

# Display build statistics
echo -e "${BLUE}📊 Build Statistics:${NC}"
echo "Hugo Environment: $HUGO_ENV"
echo "Hugo Version: $HUGO_VERSION"
echo "Build Time: $(date)"

if [ -d "$PUBLIC_DIR" ]; then
    TOTAL_SIZE=$(du -sh "$PUBLIC_DIR" | cut -f1)
    FILE_COUNT=$(find "$PUBLIC_DIR" -type f | wc -l)
    echo "Total Size: $TOTAL_SIZE"
    echo "File Count: $FILE_COUNT"
    
    # Asset-specific statistics
    CSS_COUNT=$(find "$PUBLIC_DIR" -name "*.css" -type f | wc -l)
    JS_COUNT=$(find "$PUBLIC_DIR" -name "*.js" -type f | wc -l)
    HTML_COUNT=$(find "$PUBLIC_DIR" -name "*.html" -type f | wc -l)
    
    echo "CSS Files: $CSS_COUNT"
    echo "JS Files: $JS_COUNT"
    echo "HTML Files: $HTML_COUNT"
    
    # GitHub Actions specific output
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "build-size=$TOTAL_SIZE" >> $GITHUB_OUTPUT
        echo "html-count=$HTML_COUNT" >> $GITHUB_OUTPUT
        echo "css-count=$CSS_COUNT" >> $GITHUB_OUTPUT
        echo "js-count=$JS_COUNT" >> $GITHUB_OUTPUT
        echo "file-count=$FILE_COUNT" >> $GITHUB_OUTPUT
    fi
fi

# Validate critical files exist
echo -e "${BLUE}🔍 Validating build output...${NC}"

CRITICAL_FILES=(
    "$PUBLIC_DIR/index.html"
    "$PUBLIC_DIR/sitemap.xml"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${YELLOW}⚠️  $file missing${NC}"
    fi
done

# Check for asset integrity
if [ "$HUGO_ENV" = "production" ]; then
    echo -e "${BLUE}🔒 Checking asset integrity...${NC}"
    
    # Check for fingerprinted assets
    FINGERPRINTED_CSS=$(find "$PUBLIC_DIR" -name "*.css" -type f | grep -E '\.[a-f0-9]{8,}\.' | wc -l)
    FINGERPRINTED_JS=$(find "$PUBLIC_DIR" -name "*.js" -type f | grep -E '\.[a-f0-9]{8,}\.' | wc -l)
    
    echo "Fingerprinted CSS files: $FINGERPRINTED_CSS"
    echo "Fingerprinted JS files: $FINGERPRINTED_JS"
    
    # Check for integrity attributes in HTML
    if grep -q 'integrity=' "$PUBLIC_DIR/index.html" 2>/dev/null; then
        echo -e "${GREEN}✅ Integrity hashes found in HTML${NC}"
    else
        echo -e "${YELLOW}⚠️  No integrity hashes found in HTML${NC}"
    fi
fi

echo -e "${GREEN}🎉 Asset processing pipeline completed successfully!${NC}"

# Optional: Run additional checks
if [ "$1" = "--validate" ]; then
    echo -e "${BLUE}🔍 Running additional validation...${NC}"
    
    # Check HTML validity (if htmlproofer is available)
    if command_exists htmlproofer; then
        echo "Running HTML validation..."
        htmlproofer "$PUBLIC_DIR" --check-html --check-img-http --check-opengraph || true
    fi
    
    # Check for broken links (if available)
    if command_exists linkchecker; then
        echo "Checking for broken links..."
        linkchecker "$PUBLIC_DIR/index.html" || true
    fi
fi

exit 0