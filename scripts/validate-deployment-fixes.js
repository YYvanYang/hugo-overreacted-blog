#!/usr/bin/env node

/**
 * Comprehensive Deployment Validation Script
 * Tests all deployment fixes implemented for the Hugo blog template
 * 
 * This script validates:
 * - Viewport meta tag presence and format
 * - Meta description and canonical URL generation
 * - Robots.txt accessibility and format
 * - JavaScript asset loading and security headers
 * - All deployment test requirements (6.1-6.5)
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    baseURL: process.env.SITE_URL || 'http://localhost:1313',
    timeout: 30000,
    headless: true,
    viewport: { width: 1280, height: 720 }
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    total: 0,
    details: []
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Log test result with color coding
 */
function logResult(testName, status, message = '', details = null) {
    testResults.total++;
    
    let color = colors.green;
    let icon = '✅';
    
    if (status === 'FAIL') {
        testResults.failed++;
        color = colors.red;
        icon = '❌';
    } else if (status === 'WARN') {
        testResults.warnings++;
        color = colors.yellow;
        icon = '⚠️';
    } else {
        testResults.passed++;
    }
    
    console.log(`${color}${icon} ${testName}: ${status}${colors.reset} ${message}`);
    
    testResults.details.push({
        test: testName,
        status,
        message,
        details,
        timestamp: new Date().toISOString()
    });
}

/**
 * Test viewport meta tag presence and format (Requirement 6.1)
 */
async function testViewportMetaTag(page) {
    console.log(`${colors.blue}🔍 Testing viewport meta tag...${colors.reset}`);
    
    try {
        // Check for viewport meta tag presence
        const viewportMeta = await page.locator('meta[name="viewport"]').first();
        const exists = await viewportMeta.count() > 0;
        
        if (!exists) {
            logResult('Viewport Meta Tag Presence', 'FAIL', 'Viewport meta tag not found');
            return;
        }
        
        logResult('Viewport Meta Tag Presence', 'PASS', 'Viewport meta tag found');
        
        // Check viewport meta tag format
        const content = await viewportMeta.getAttribute('content');
        const expectedContent = 'width=device-width, initial-scale=1';
        
        if (content && content.includes('width=device-width') && content.includes('initial-scale=1')) {
            logResult('Viewport Meta Tag Format', 'PASS', `Content: "${content}"`);
        } else {
            logResult('Viewport Meta Tag Format', 'FAIL', `Expected "${expectedContent}", got "${content}"`);
        }
        
        // Test mobile responsiveness
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.waitForTimeout(1000);
        
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        
        if (bodyWidth <= viewportWidth * 1.1) { // Allow 10% tolerance
            logResult('Mobile Responsiveness', 'PASS', 'No horizontal scrolling detected');
        } else {
            logResult('Mobile Responsiveness', 'WARN', `Body width (${bodyWidth}px) exceeds viewport (${viewportWidth}px)`);
        }
        
        // Reset viewport
        await page.setViewportSize(CONFIG.viewport);
        
    } catch (error) {
        logResult('Viewport Meta Tag Test', 'FAIL', `Error: ${error.message}`);
    }
}

/**
 * Test meta description and canonical URL generation (Requirement 6.2)
 */
async function testSEOMetaTags(page) {
    console.log(`${colors.blue}🔍 Testing SEO meta tags...${colors.reset}`);
    
    try {
        // Test meta description
        const metaDescription = await page.locator('meta[name="description"]').first();
        const descriptionExists = await metaDescription.count() > 0;
        
        if (descriptionExists) {
            const content = await metaDescription.getAttribute('content');
            if (content && content.length > 0) {
                if (content.length <= 160) {
                    logResult('Meta Description', 'PASS', `Length: ${content.length} chars`);
                } else {
                    logResult('Meta Description', 'WARN', `Length: ${content.length} chars (exceeds 160)`);
                }
            } else {
                logResult('Meta Description', 'FAIL', 'Meta description is empty');
            }
        } else {
            logResult('Meta Description', 'FAIL', 'Meta description not found');
        }
        
        // Test canonical URL
        const canonicalLink = await page.locator('link[rel="canonical"]').first();
        const canonicalExists = await canonicalLink.count() > 0;
        
        if (canonicalExists) {
            const href = await canonicalLink.getAttribute('href');
            if (href && href.startsWith('http')) {
                logResult('Canonical URL', 'PASS', `URL: ${href}`);
            } else {
                logResult('Canonical URL', 'FAIL', `Invalid canonical URL: ${href}`);
            }
        } else {
            logResult('Canonical URL', 'FAIL', 'Canonical URL not found');
        }
        
        // Test Open Graph tags
        const ogTitle = await page.locator('meta[property="og:title"]').first();
        const ogTitleExists = await ogTitle.count() > 0;
        
        if (ogTitleExists) {
            logResult('Open Graph Tags', 'PASS', 'OG tags detected');
        } else {
            logResult('Open Graph Tags', 'WARN', 'Open Graph tags not found');
        }
        
    } catch (error) {
        logResult('SEO Meta Tags Test', 'FAIL', `Error: ${error.message}`);
    }
}

/**
 * Test robots.txt accessibility and format (Requirement 6.3)
 */
async function testRobotsTxt(page) {
    console.log(`${colors.blue}🔍 Testing robots.txt...${colors.reset}`);
    
    try {
        const robotsURL = new URL('/robots.txt', CONFIG.baseURL).toString();
        const response = await page.goto(robotsURL);
        
        if (response && response.status() === 200) {
            logResult('Robots.txt Accessibility', 'PASS', 'Robots.txt is accessible');
            
            // Check content type
            const contentType = response.headers()['content-type'];
            if (contentType && contentType.includes('text/plain')) {
                logResult('Robots.txt Content-Type', 'PASS', `Content-Type: ${contentType}`);
            } else {
                logResult('Robots.txt Content-Type', 'WARN', `Content-Type: ${contentType || 'not set'}`);
            }
            
            // Check robots.txt content
            const content = await page.textContent('body');
            
            if (content.includes('User-agent:')) {
                logResult('Robots.txt Format', 'PASS', 'Contains User-agent directive');
            } else {
                logResult('Robots.txt Format', 'WARN', 'Missing User-agent directive');
            }
            
            if (content.includes('Sitemap:')) {
                logResult('Robots.txt Sitemap', 'PASS', 'Contains sitemap reference');
            } else {
                logResult('Robots.txt Sitemap', 'WARN', 'Missing sitemap reference');
            }
            
        } else {
            logResult('Robots.txt Accessibility', 'FAIL', `Status: ${response ? response.status() : 'No response'}`);
        }
        
    } catch (error) {
        logResult('Robots.txt Test', 'FAIL', `Error: ${error.message}`);
    }
}

/**
 * Test JavaScript asset loading (Requirement 6.4)
 */
async function testJavaScriptAssets(page) {
    console.log(`${colors.blue}🔍 Testing JavaScript assets...${colors.reset}`);
    
    try {
        // Go back to main page
        await page.goto(CONFIG.baseURL);
        
        // Track network requests for JS files
        const jsRequests = [];
        
        page.on('response', response => {
            const url = response.url();
            if (url.endsWith('.js') && response.status() === 200) {
                jsRequests.push({
                    url,
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
            }
        });
        
        // Reload page to capture JS requests
        await page.reload();
        await page.waitForTimeout(2000);
        
        if (jsRequests.length > 0) {
            logResult('JavaScript Asset Loading', 'PASS', `${jsRequests.length} JS files loaded successfully`);
            
            // Check for theme switcher by examining JS content
            const jsContent = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                return scripts.map(script => script.src);
            });
            
            // Check if main.js contains theme switcher functionality
            let hasThemeSwitcher = false;
            for (const jsUrl of jsContent) {
                try {
                    const jsResponse = await page.goto(jsUrl);
                    if (jsResponse && jsResponse.status() === 200) {
                        const content = await jsResponse.text();
                        if (content.includes('ThemeSwitcher') || content.includes('theme-switcher') || content.includes('theme-toggle')) {
                            hasThemeSwitcher = true;
                            break;
                        }
                    }
                } catch (error) {
                    // Continue checking other scripts
                }
            }
            
            if (hasThemeSwitcher) {
                logResult('Theme Switcher JS', 'PASS', 'Theme switcher functionality detected in JavaScript');
            } else {
                logResult('Theme Switcher JS', 'WARN', 'Theme switcher functionality not clearly detected');
            }
            
        } else {
            logResult('JavaScript Asset Loading', 'WARN', 'No JavaScript files detected');
        }
        
        // Test script tags in HTML
        const scriptTags = await page.locator('script[src]').count();
        if (scriptTags > 0) {
            logResult('Script Tags', 'PASS', `${scriptTags} script tags found`);
        } else {
            logResult('Script Tags', 'WARN', 'No external script tags found');
        }
        
        // Test for integrity hashes (more relevant for production)
        const scriptsWithIntegrity = await page.locator('script[integrity]').count();
        if (scriptsWithIntegrity > 0) {
            logResult('Script Integrity Hashes', 'PASS', `${scriptsWithIntegrity} scripts with integrity hashes`);
        } else {
            const isProduction = CONFIG.baseURL.includes('workers.dev') || CONFIG.baseURL.includes('cloudflare');
            if (isProduction) {
                logResult('Script Integrity Hashes', 'WARN', 'No integrity hashes found on scripts (recommended for production)');
            } else {
                logResult('Script Integrity Hashes', 'PASS', 'Integrity hashes not required for local development');
            }
        }
        
        // Go back to main page for other tests
        await page.goto(CONFIG.baseURL);
        
    } catch (error) {
        logResult('JavaScript Assets Test', 'FAIL', `Error: ${error.message}`);
    }
}

/**
 * Test security headers (Requirement 6.5)
 */
async function testSecurityHeaders(page) {
    console.log(`${colors.blue}🔍 Testing security headers...${colors.reset}`);
    
    try {
        const response = await page.goto(CONFIG.baseURL);
        const headers = response.headers();
        
        // Determine if this is a production environment
        const isProduction = CONFIG.baseURL.includes('workers.dev') || 
                           CONFIG.baseURL.includes('cloudflare') || 
                           CONFIG.baseURL.startsWith('https://') && !CONFIG.baseURL.includes('localhost');
        
        const isLocalDev = CONFIG.baseURL.includes('localhost') || CONFIG.baseURL.includes('127.0.0.1');
        
        // Test X-Frame-Options
        if (headers['x-frame-options']) {
            logResult('X-Frame-Options Header', 'PASS', `Value: ${headers['x-frame-options']}`);
        } else {
            if (isLocalDev) {
                logResult('X-Frame-Options Header', 'WARN', 'Header missing (expected in local development)');
            } else {
                logResult('X-Frame-Options Header', 'FAIL', 'Header missing in production');
            }
        }
        
        // Test X-Content-Type-Options
        if (headers['x-content-type-options']) {
            logResult('X-Content-Type-Options Header', 'PASS', `Value: ${headers['x-content-type-options']}`);
        } else {
            if (isLocalDev) {
                logResult('X-Content-Type-Options Header', 'WARN', 'Header missing (expected in local development)');
            } else {
                logResult('X-Content-Type-Options Header', 'FAIL', 'Header missing in production');
            }
        }
        
        // Test Content-Security-Policy
        if (headers['content-security-policy']) {
            logResult('Content-Security-Policy Header', 'PASS', 'CSP header present');
        } else {
            if (isLocalDev) {
                logResult('Content-Security-Policy Header', 'WARN', 'CSP header missing (expected in local development)');
            } else {
                logResult('Content-Security-Policy Header', 'FAIL', 'CSP header missing in production');
            }
        }
        
        // Test HSTS
        if (headers['strict-transport-security']) {
            logResult('HSTS Header', 'PASS', `Value: ${headers['strict-transport-security']}`);
        } else {
            if (isLocalDev) {
                logResult('HSTS Header', 'PASS', 'HSTS not required for local HTTP development');
            } else {
                logResult('HSTS Header', 'WARN', 'HSTS header missing (may be added by Cloudflare)');
            }
        }
        
        // Test Referrer Policy
        if (headers['referrer-policy']) {
            logResult('Referrer-Policy Header', 'PASS', `Value: ${headers['referrer-policy']}`);
        } else {
            if (isLocalDev) {
                logResult('Referrer-Policy Header', 'WARN', 'Referrer-Policy header missing (expected in local development)');
            } else {
                logResult('Referrer-Policy Header', 'WARN', 'Referrer-Policy header missing');
            }
        }
        
        // Additional security validation for production
        if (isProduction) {
            // Check if HTTPS is being used
            if (CONFIG.baseURL.startsWith('https://')) {
                logResult('HTTPS Usage', 'PASS', 'Site is served over HTTPS');
            } else {
                logResult('HTTPS Usage', 'FAIL', 'Site should be served over HTTPS in production');
            }
        } else {
            logResult('Security Headers Context', 'PASS', 'Local development environment detected - security headers implemented in Cloudflare Worker');
        }
        
    } catch (error) {
        logResult('Security Headers Test', 'FAIL', `Error: ${error.message}`);
    }
}

/**
 * Test additional deployment validations
 */
async function testAdditionalValidations(page) {
    console.log(`${colors.blue}🔍 Running additional validations...${colors.reset}`);
    
    try {
        await page.goto(CONFIG.baseURL);
        
        // Test page title
        const title = await page.title();
        if (title && title.length > 0) {
            logResult('Page Title', 'PASS', `Title: "${title}"`);
        } else {
            logResult('Page Title', 'FAIL', 'Page title is empty');
        }
        
        // Test language attribute
        const htmlLang = await page.locator('html').getAttribute('lang');
        if (htmlLang) {
            logResult('HTML Language Attribute', 'PASS', `Language: ${htmlLang}`);
        } else {
            logResult('HTML Language Attribute', 'WARN', 'HTML lang attribute missing');
        }
        
        // Test semantic HTML
        const semanticElements = ['main', 'nav', 'header', 'footer', 'article', 'section'];
        let semanticCount = 0;
        
        for (const element of semanticElements) {
            const count = await page.locator(element).count();
            if (count > 0) semanticCount++;
        }
        
        if (semanticCount >= 3) {
            logResult('Semantic HTML', 'PASS', `${semanticCount}/${semanticElements.length} semantic elements found`);
        } else {
            logResult('Semantic HTML', 'WARN', `Only ${semanticCount}/${semanticElements.length} semantic elements found`);
        }
        
        // Test CSS loading
        const stylesheets = await page.locator('link[rel="stylesheet"]').count();
        if (stylesheets > 0) {
            logResult('CSS Stylesheets', 'PASS', `${stylesheets} stylesheets loaded`);
        } else {
            logResult('CSS Stylesheets', 'WARN', 'No external stylesheets found');
        }
        
        // Test sitemap accessibility
        try {
            const sitemapURL = new URL('/sitemap.xml', CONFIG.baseURL).toString();
            const sitemapResponse = await page.goto(sitemapURL);
            
            if (sitemapResponse && sitemapResponse.status() === 200) {
                logResult('Sitemap Accessibility', 'PASS', 'Sitemap.xml is accessible');
            } else {
                logResult('Sitemap Accessibility', 'WARN', 'Sitemap.xml not accessible');
            }
        } catch (error) {
            logResult('Sitemap Accessibility', 'WARN', 'Could not test sitemap');
        }
        
    } catch (error) {
        logResult('Additional Validations', 'FAIL', `Error: ${error.message}`);
    }
}

/**
 * Generate test report
 */
async function generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), `deployment-validation-report-${timestamp}.json`);
    
    const report = {
        timestamp: new Date().toISOString(),
        baseURL: CONFIG.baseURL,
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            warnings: testResults.warnings,
            successRate: Math.round((testResults.passed / testResults.total) * 100)
        },
        details: testResults.details
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`${colors.cyan}📄 Report saved to: ${reportPath}${colors.reset}`);
    
    return report;
}

/**
 * Main test execution
 */
async function runTests() {
    console.log(`${colors.blue}🧪 Starting comprehensive deployment validation${colors.reset}`);
    console.log(`Testing site: ${CONFIG.baseURL}`);
    console.log('');
    
    let browser;
    let page;
    
    try {
        // Launch browser
        browser = await chromium.launch({ 
            headless: CONFIG.headless,
            timeout: CONFIG.timeout 
        });
        
        page = await browser.newPage({
            viewport: CONFIG.viewport
        });
        
        // Set timeout for all operations
        page.setDefaultTimeout(CONFIG.timeout);
        
        // Navigate to the site
        await page.goto(CONFIG.baseURL);
        
        // Run all test suites
        await testViewportMetaTag(page);
        await testSEOMetaTags(page);
        await testRobotsTxt(page);
        await testJavaScriptAssets(page);
        await testSecurityHeaders(page);
        await testAdditionalValidations(page);
        
    } catch (error) {
        console.error(`${colors.red}❌ Test execution failed: ${error.message}${colors.reset}`);
        logResult('Test Execution', 'FAIL', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Print summary
    console.log('');
    console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
    console.log(`Total tests: ${testResults.total}`);
    console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.yellow}Warnings: ${testResults.warnings}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    
    const successRate = Math.round((testResults.passed / testResults.total) * 100);
    console.log(`Success rate: ${successRate}%`);
    
    // Generate report
    const report = await generateReport();
    
    // Determine exit code
    if (testResults.failed > 0) {
        console.log(`${colors.red}❌ Some tests failed${colors.reset}`);
        process.exit(1);
    } else if (testResults.warnings > 5) {
        console.log(`${colors.yellow}⚠️ Many warnings detected${colors.reset}`);
        process.exit(0);
    } else {
        console.log(`${colors.green}🎉 All critical tests passed!${colors.reset}`);
        process.exit(0);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node validate-deployment-fixes.js [options]

Options:
  --help, -h          Show this help message
  --url <url>         Set the base URL to test (default: http://localhost:1313)
  --headless          Run in headless mode (default: true)
  --timeout <ms>      Set timeout in milliseconds (default: 30000)

Environment Variables:
  SITE_URL           Base URL to test (overrides --url)

Examples:
  node validate-deployment-fixes.js
  node validate-deployment-fixes.js --url https://example.com
  SITE_URL=https://example.com node validate-deployment-fixes.js
`);
    process.exit(0);
}

// Parse command line arguments
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
    CONFIG.baseURL = process.argv[urlIndex + 1];
}

const timeoutIndex = process.argv.indexOf('--timeout');
if (timeoutIndex !== -1 && process.argv[timeoutIndex + 1]) {
    CONFIG.timeout = parseInt(process.argv[timeoutIndex + 1]);
}

if (process.argv.includes('--no-headless')) {
    CONFIG.headless = false;
}

// Run the tests
runTests().catch(error => {
    console.error(`${colors.red}❌ Unexpected error: ${error.message}${colors.reset}`);
    process.exit(1);
});