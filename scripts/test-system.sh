#!/bin/bash

# System Validation Script for Hugo Overreacted Blog
# Comprehensive system testing and validation suite
# Tests local development environment, build process, and deployment readiness
# Enhanced with CI/CD support and detailed reporting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration with CI/CD environment detection
CI=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}
GENERATE_REPORT=${1:-false}

# Test counters
TESTS_PASSED=0
TESTS_WARNED=0
TESTS_FAILED=0
TOTAL_TESTS=0

echo -e "${BLUE}🔍 Starting Hugo Overreacted Blog system validation${NC}"
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

# Function to compare versions
version_compare() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Test 1: System Dependencies
echo -e "${BLUE}🔧 Testing system dependencies...${NC}"

# Check Hugo
if command_exists hugo; then
    HUGO_VERSION=$(hugo version | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sed 's/v//')
    if version_compare "$HUGO_VERSION" "0.128.0"; then
        print_test_result "Hugo Version" "PASS" "Version $HUGO_VERSION (meets requirement)"
    else
        print_test_result "Hugo Version" "FAIL" "Version $HUGO_VERSION (requires 0.128.0+)"
    fi
    
    # Check if Hugo extended
    if hugo version | grep -q "extended"; then
        print_test_result "Hugo Extended" "PASS" "Extended version detected"
    else
        print_test_result "Hugo Extended" "FAIL" "Extended version required"
    fi
    
    # Check Hugo modules support
    if hugo mod help > /dev/null 2>&1; then
        print_test_result "Hugo Modules" "PASS" "Modules support available"
    else
        print_test_result "Hugo Modules" "WARN" "Modules support not available"
    fi
else
    print_test_result "Hugo Installation" "FAIL" "Not installed"
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version | sed 's/v//')
    if version_compare "$NODE_VERSION" "18.0.0"; then
        print_test_result "Node.js Version" "PASS" "Version $NODE_VERSION (meets requirement)"
    else
        print_test_result "Node.js Version" "FAIL" "Version $NODE_VERSION (requires 18.0.0+)"
    fi
else
    print_test_result "Node.js Installation" "FAIL" "Not installed"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_test_result "npm Version" "PASS" "Version $NPM_VERSION"
else
    print_test_result "npm Installation" "FAIL" "Not installed"
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    print_test_result "Git Version" "PASS" "Version $GIT_VERSION"
else
    print_test_result "Git Installation" "WARN" "Not installed (recommended for version control)"
fi

# Check Wrangler
if command_exists wrangler; then
    WRANGLER_VERSION=$(wrangler --version 2>/dev/null | head -1 || echo "unknown")
    print_test_result "Wrangler CLI" "PASS" "Version $WRANGLER_VERSION"
else
    print_test_result "Wrangler CLI" "WARN" "Not installed (required for deployment)"
fi

# Test 2: Project Structure
echo -e "${BLUE}📁 Testing project structure...${NC}"

# Check critical files
CRITICAL_FILES=(
    "hugo.toml"
    "package.json"
    "wrangler.toml"
    "assets/css/main.css"
    "layouts/baseof.html"
    "content/_index.md"
    "static/404.html"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_test_result "File: $(basename "$file")" "PASS" "Exists"
    else
        print_test_result "File: $(basename "$file")" "FAIL" "Missing: $file"
    fi
done

# Check critical directories
CRITICAL_DIRS=(
    "assets"
    "content"
    "layouts"
    "static"
    "scripts"
    "layouts/partials"
    "content/posts"
)

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_test_result "Directory: $(basename "$dir")" "PASS" "Exists"
    else
        print_test_result "Directory: $(basename "$dir")" "WARN" "Missing: $dir"
    fi
done

# Test 3: Configuration Validation
echo -e "${BLUE}⚙️  Testing configuration files...${NC}"

# Check Hugo configuration
if [ -f "hugo.toml" ]; then
    if grep -q "baseURL" hugo.toml; then
        print_test_result "Hugo baseURL" "PASS" "Configured"
    else
        print_test_result "Hugo baseURL" "WARN" "Not configured"
    fi
    
    if grep -q "extended.*true" hugo.toml; then
        print_test_result "Hugo Extended Requirement" "PASS" "Required"
    else
        print_test_result "Hugo Extended Requirement" "WARN" "Not explicitly required"
    fi
    
    if grep -q "writeStats.*true" hugo.toml; then
        print_test_result "Hugo Build Stats" "PASS" "Enabled for Tailwind"
    else
        print_test_result "Hugo Build Stats" "WARN" "Not enabled"
    fi
    
    if grep -q "minify" hugo.toml; then
        print_test_result "Hugo Minification" "PASS" "Configured"
    else
        print_test_result "Hugo Minification" "WARN" "Not configured"
    fi
    
    # Check markup configuration
    if grep -q "goldmark" hugo.toml; then
        print_test_result "Goldmark Renderer" "PASS" "Configured"
    else
        print_test_result "Goldmark Renderer" "WARN" "Not configured"
    fi
fi

# Check package.json
if [ -f "package.json" ]; then
    if grep -q "tailwindcss" package.json; then
        print_test_result "Tailwind Dependency" "PASS" "Found"
    else
        print_test_result "Tailwind Dependency" "FAIL" "Missing"
    fi
    
    if grep -q "wrangler" package.json; then
        print_test_result "Wrangler Dependency" "PASS" "Found"
    else
        print_test_result "Wrangler Dependency" "WARN" "Missing"
    fi
    
    # Check engines specification
    if grep -q "engines" package.json; then
        print_test_result "Node Engine Spec" "PASS" "Specified"
    else
        print_test_result "Node Engine Spec" "WARN" "Not specified"
    fi
    
    # Check scripts
    if grep -q "build.*production" package.json; then
        print_test_result "Build Scripts" "PASS" "Production build configured"
    else
        print_test_result "Build Scripts" "WARN" "Production build not configured"
    fi
fi

# Check Wrangler configuration
if [ -f "wrangler.toml" ]; then
    if grep -q "assets" wrangler.toml; then
        print_test_result "Wrangler Assets" "PASS" "Static assets configured"
    else
        print_test_result "Wrangler Assets" "WARN" "Static assets not configured"
    fi
    
    if grep -q "compatibility_date" wrangler.toml; then
        COMPAT_DATE=$(grep "compatibility_date" wrangler.toml | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
        print_test_result "Wrangler Compatibility" "PASS" "Date: $COMPAT_DATE"
    else
        print_test_result "Wrangler Compatibility" "WARN" "Date not specified"
    fi
    
    # Check environment configurations
    if grep -q "env\.production" wrangler.toml; then
        print_test_result "Production Environment" "PASS" "Configured"
    else
        print_test_result "Production Environment" "WARN" "Not configured"
    fi
fi

# Test 4: Dependencies
echo -e "${BLUE}📦 Testing Node.js dependencies...${NC}"

if [ -f "package.json" ]; then
    if [ -f "package-lock.json" ]; then
        print_test_result "Package Lock File" "PASS" "Lock file exists"
    else
        print_test_result "Package Lock File" "WARN" "Lock file missing"
    fi
    
    if [ -d "node_modules" ]; then
        print_test_result "Node Modules" "PASS" "Dependencies installed"
        
        # Check specific dependencies
        REQUIRED_DEPS=("tailwindcss" "postcss" "autoprefixer")
        for dep in "${REQUIRED_DEPS[@]}"; do
            if [ -d "node_modules/$dep" ]; then
                print_test_result "Dependency: $dep" "PASS" "Installed"
            else
                print_test_result "Dependency: $dep" "FAIL" "Not installed"
            fi
        done
        
        # Check optional dependencies
        OPTIONAL_DEPS=("wrangler" "terser" "html-minifier-terser")
        for dep in "${OPTIONAL_DEPS[@]}"; do
            if [ -d "node_modules/$dep" ]; then
                print_test_result "Optional: $dep" "PASS" "Installed"
            else
                print_test_result "Optional: $dep" "WARN" "Not installed"
            fi
        done
    else
        print_test_result "Node Modules" "FAIL" "Dependencies not installed - run 'npm install'"
    fi
fi

# Test 5: Build Process
echo -e "${BLUE}🏗️  Testing build process...${NC}"

# Test if build scripts are executable
BUILD_SCRIPTS=("scripts/build-assets.sh" "scripts/deploy.sh" "scripts/test-deployment.sh")
for script in "${BUILD_SCRIPTS[@]}"; do
    if [ -x "$script" ]; then
        print_test_result "Script: $(basename "$script")" "PASS" "Executable"
    else
        print_test_result "Script: $(basename "$script")" "FAIL" "Not executable or missing"
    fi
done

# Test Hugo build (dry run)
echo -e "${BLUE}Testing Hugo build configuration...${NC}"
if hugo --quiet --dry-run > /dev/null 2>&1; then
    print_test_result "Hugo Build Config" "PASS" "Configuration valid"
else
    print_test_result "Hugo Build Config" "FAIL" "Configuration invalid"
fi

# Test Tailwind CSS configuration
if command_exists npx && [ -d "node_modules" ]; then
    if npx tailwindcss --help > /dev/null 2>&1; then
        print_test_result "Tailwind CLI" "PASS" "Available"
    else
        print_test_result "Tailwind CLI" "FAIL" "Not available"
    fi
fi

# Test 6: Content Structure
echo -e "${BLUE}📝 Testing content structure...${NC}"

# Check for sample content
if [ -f "content/_index.md" ]; then
    print_test_result "Homepage Content" "PASS" "Exists"
else
    print_test_result "Homepage Content" "WARN" "Missing"
fi

if [ -f "content/about.md" ]; then
    print_test_result "About Page" "PASS" "Exists"
else
    print_test_result "About Page" "WARN" "Missing"
fi

if [ -d "content/posts" ]; then
    POST_COUNT=$(find content/posts -name "*.md" -not -name "_index.md" | wc -l)
    if [ $POST_COUNT -gt 0 ]; then
        print_test_result "Blog Posts" "PASS" "$POST_COUNT posts found"
    else
        print_test_result "Blog Posts" "WARN" "No posts found"
    fi
else
    print_test_result "Posts Directory" "WARN" "Missing"
fi

# Check front matter format
if [ -f "content/_index.md" ]; then
    if head -5 content/_index.md | grep -q "^---$"; then
        print_test_result "Front Matter Format" "PASS" "YAML format detected"
    else
        print_test_result "Front Matter Format" "WARN" "YAML front matter not detected"
    fi
fi

# Test 7: Asset Structure
echo -e "${BLUE}🎨 Testing asset structure...${NC}"

# Check CSS assets
if [ -f "assets/css/main.css" ]; then
    print_test_result "Main CSS File" "PASS" "Exists"
    
    if grep -q "@import.*tailwindcss" assets/css/main.css; then
        print_test_result "Tailwind Import" "PASS" "Found in main.css"
    else
        print_test_result "Tailwind Import" "WARN" "Not found in main.css"
    fi
    
    if grep -q "@theme" assets/css/main.css; then
        print_test_result "Tailwind Theme Config" "PASS" "Found in main.css"
    else
        print_test_result "Tailwind Theme Config" "WARN" "Not found in main.css"
    fi
else
    print_test_result "Main CSS File" "FAIL" "Missing"
fi

# Check for Chroma CSS files
CHROMA_FILES=("assets/css/chroma-light.css" "assets/css/chroma-dark.css")
for file in "${CHROMA_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_test_result "Chroma CSS: $(basename "$file")" "PASS" "Exists"
    else
        print_test_result "Chroma CSS: $(basename "$file")" "WARN" "Missing (will be generated)"
    fi
done

# Check JavaScript assets
if [ -d "assets/js" ]; then
    JS_COUNT=$(find assets/js -name "*.js" | wc -l)
    if [ $JS_COUNT -gt 0 ]; then
        print_test_result "JavaScript Assets" "PASS" "$JS_COUNT files found"
        
        # Check for theme switcher
        if [ -f "assets/js/theme-switcher.js" ]; then
            print_test_result "Theme Switcher JS" "PASS" "Exists"
        else
            print_test_result "Theme Switcher JS" "WARN" "Missing"
        fi
    else
        print_test_result "JavaScript Assets" "WARN" "No JS files found"
    fi
else
    print_test_result "JavaScript Directory" "WARN" "Missing"
fi

# Test 8: Template Structure
echo -e "${BLUE}🏗️  Testing template structure...${NC}"

# Check base template
if [ -f "layouts/baseof.html" ]; then
    print_test_result "Base Template" "PASS" "Exists"
    
    if grep -q "{{.*block.*main" layouts/baseof.html; then
        print_test_result "Main Block" "PASS" "Found in base template"
    else
        print_test_result "Main Block" "WARN" "Not found in base template"
    fi
    
    # Check for HTML5 structure
    if grep -q "<!DOCTYPE html>" layouts/baseof.html; then
        print_test_result "HTML5 Doctype" "PASS" "Found"
    else
        print_test_result "HTML5 Doctype" "WARN" "Not found"
    fi
    
    # Check for viewport meta tag
    if grep -q "viewport" layouts/baseof.html; then
        print_test_result "Viewport Meta Tag" "PASS" "Found"
    else
        print_test_result "Viewport Meta Tag" "WARN" "Not found"
    fi
else
    print_test_result "Base Template" "FAIL" "Missing"
fi

# Check for partials
if [ -d "layouts/partials" ]; then
    PARTIAL_COUNT=$(find layouts/partials -name "*.html" | wc -l)
    if [ $PARTIAL_COUNT -gt 0 ]; then
        print_test_result "Partial Templates" "PASS" "$PARTIAL_COUNT partials found"
        
        # Check for essential partials
        ESSENTIAL_PARTIALS=("head.html" "header.html" "footer.html")
        for partial in "${ESSENTIAL_PARTIALS[@]}"; do
            if [ -f "layouts/partials/$partial" ]; then
                print_test_result "Partial: $partial" "PASS" "Exists"
            else
                print_test_result "Partial: $partial" "WARN" "Missing"
            fi
        done
    else
        print_test_result "Partial Templates" "WARN" "No partials found"
    fi
else
    print_test_result "Partials Directory" "WARN" "Missing"
fi

# Check for render hooks
if [ -d "layouts/_default/_markup" ]; then
    HOOK_COUNT=$(find layouts/_default/_markup -name "*.html" | wc -l)
    if [ $HOOK_COUNT -gt 0 ]; then
        print_test_result "Render Hooks" "PASS" "$HOOK_COUNT hooks found"
    else
        print_test_result "Render Hooks" "WARN" "No render hooks found"
    fi
else
    print_test_result "Render Hooks Directory" "WARN" "Missing"
fi

# Test 9: Development Environment
echo -e "${BLUE}🔧 Testing development environment...${NC}"

# Check if development server can start (dry run)
if hugo server --dry-run > /dev/null 2>&1; then
    print_test_result "Dev Server Config" "PASS" "Can start development server"
else
    print_test_result "Dev Server Config" "FAIL" "Cannot start development server"
fi

# Check for .gitignore
if [ -f ".gitignore" ]; then
    print_test_result "Git Ignore File" "PASS" "Exists"
    
    if grep -q "public" .gitignore; then
        print_test_result "Git Ignore: public" "PASS" "Public directory ignored"
    else
        print_test_result "Git Ignore: public" "WARN" "Public directory not ignored"
    fi
    
    if grep -q "node_modules" .gitignore; then
        print_test_result "Git Ignore: node_modules" "PASS" "Node modules ignored"
    else
        print_test_result "Git Ignore: node_modules" "WARN" "Node modules not ignored"
    fi
else
    print_test_result "Git Ignore File" "WARN" "Missing"
fi

# Test 10: Deployment Readiness
echo -e "${BLUE}🚀 Testing deployment readiness...${NC}"

# Check Wrangler authentication (if available)
if command_exists wrangler; then
    if wrangler whoami > /dev/null 2>&1; then
        print_test_result "Wrangler Authentication" "PASS" "Authenticated"
    else
        print_test_result "Wrangler Authentication" "WARN" "Not authenticated"
    fi
fi

# Check for environment variables
ENV_VARS=("CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ACCOUNT_ID")
for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        print_test_result "Env Var: $var" "PASS" "Set"
    else
        print_test_result "Env Var: $var" "WARN" "Not set"
    fi
done

# Check static files
if [ -f "static/404.html" ]; then
    print_test_result "404 Page" "PASS" "Custom 404 page exists"
else
    print_test_result "404 Page" "WARN" "Custom 404 page missing"
fi

if [ -f "static/robots.txt" ]; then
    print_test_result "Robots.txt" "PASS" "Exists"
else
    print_test_result "Robots.txt" "WARN" "Missing"
fi

# Final Summary
echo -e "${BLUE}📊 System Validation Summary${NC}"
echo "Validation completed at: $(date)"
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
        echo "system-test-total=$TOTAL_TESTS" >> $GITHUB_OUTPUT
        echo "system-test-passed=$TESTS_PASSED" >> $GITHUB_OUTPUT
        echo "system-test-warned=$TESTS_WARNED" >> $GITHUB_OUTPUT
        echo "system-test-failed=$TESTS_FAILED" >> $GITHUB_OUTPUT
        echo "system-success-rate=$SUCCESS_RATE" >> $GITHUB_OUTPUT
        
        # Add to step summary
        echo "## System Validation Summary" >> $GITHUB_STEP_SUMMARY
        echo "- **Total Tests**: $TOTAL_TESTS" >> $GITHUB_STEP_SUMMARY
        echo "- **Passed**: $TESTS_PASSED" >> $GITHUB_STEP_SUMMARY
        echo "- **Warnings**: $TESTS_WARNED" >> $GITHUB_STEP_SUMMARY
        echo "- **Failed**: $TESTS_FAILED" >> $GITHUB_STEP_SUMMARY
        echo "- **Success Rate**: ${SUCCESS_RATE}%" >> $GITHUB_STEP_SUMMARY
    fi
fi

# Recommendations
echo -e "${BLUE}💡 Recommendations:${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo "❌ Critical issues found - address failed tests before proceeding"
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Install dependencies: npm install"
fi

if [ ! -f "public/index.html" ]; then
    echo "🏗️  Build the site: npm run build:development"
fi

echo "🧪 Test development server: npm run dev"
echo "🚀 Test deployment: npm run deploy:dry-run"
echo "🔍 Run deployment tests: npm run test:deployment"

# Generate detailed report if requested
if [ "$GENERATE_REPORT" = "--report" ] || [ "$GENERATE_REPORT" = "true" ]; then
    echo -e "${BLUE}📄 Generating detailed report...${NC}"
    
    REPORT_FILE="system-validation-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "Hugo Overreacted Blog - System Validation Report"
        echo "==============================================="
        echo "Validation Date: $(date)"
        echo "Total Tests: $TOTAL_TESTS"
        echo "Passed: $TESTS_PASSED"
        echo "Warnings: $TESTS_WARNED"
        echo "Failed: $TESTS_FAILED"
        echo "Success Rate: ${SUCCESS_RATE}%"
        echo ""
        echo "Test Categories:"
        echo "- System Dependencies (Hugo, Node.js, npm, Git, Wrangler)"
        echo "- Project Structure (Files and Directories)"
        echo "- Configuration Validation (Hugo, Package.json, Wrangler)"
        echo "- Node.js Dependencies"
        echo "- Build Process"
        echo "- Content Structure"
        echo "- Asset Structure (CSS, JavaScript)"
        echo "- Template Structure (Layouts, Partials, Render Hooks)"
        echo "- Development Environment"
        echo "- Deployment Readiness"
        echo ""
        echo "For detailed results, see the console output."
    } > "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Report saved to: $REPORT_FILE${NC}"
fi

# Determine exit code
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ System validation failed${NC}"
    EXIT_CODE=1
elif [ $TESTS_WARNED -gt 10 ]; then
    echo -e "${YELLOW}⚠️  Many warnings detected${NC}"
    EXIT_CODE=0
else
    echo -e "${GREEN}🎉 System validation passed!${NC}"
    EXIT_CODE=0
fi

exit $EXIT_CODE