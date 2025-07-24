#!/usr/bin/env node

/**
 * Navigation Testing Script
 * Comprehensive testing of all navigation functionality
 * 
 * Tests:
 * - Dropdown menus on desktop browsers
 * - Mobile navigation on various screen sizes
 * - Theme switching across all pages and components
 * - Accessibility compliance with keyboard and screen readers
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class NavigationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:1313';
    this.testResults = {
      dropdownMenus: [],
      mobileNavigation: [],
      themeSwitching: [],
      accessibility: [],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };
  }

  async init() {
    console.log('🚀 Starting Navigation Testing...');
    
    this.browser = await chromium.launch({
      headless: true, // Set to false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set up console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      } else if (msg.type() === 'warn') {
        console.log('⚠️  Browser Console Warning:', msg.text());
      }
    });

    // Set up error handling
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    await this.page.goto(this.baseUrl);
    console.log('✅ Browser initialized and page loaded');
  }

  async runAllTests() {
    try {
      console.log('\n📋 Running all navigation tests...\n');

      // Test 1: Dropdown menus on desktop
      await this.testDropdownMenus();

      // Test 2: Mobile navigation
      await this.testMobileNavigation();

      // Test 3: Theme switching
      await this.testThemeSwitching();

      // Test 4: Accessibility compliance
      await this.testAccessibility();

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async testDropdownMenus() {
    console.log('🖱️  Testing dropdown menus on desktop...');

    // Set desktop viewport
    await this.page.setViewport({ width: 1200, height: 800 });

    const tests = [
      {
        name: 'Resources dropdown hover',
        test: async () => {
          // Find Resources menu item
          const resourcesMenu = await this.page.$('.nav-item-dropdown');
          if (!resourcesMenu) {
            throw new Error('Resources dropdown menu not found');
          }

          // Hover over the menu item
          await resourcesMenu.hover();

          // Wait for dropdown to appear
          await this.page.waitForSelector('.nav-submenu', { visible: true, timeout: 2000 });

          // Check if dropdown is visible
          const isVisible = await this.page.evaluate(() => {
            const submenu = document.querySelector('.nav-submenu');
            return submenu && window.getComputedStyle(submenu).opacity === '1';
          });

          if (!isVisible) {
            throw new Error('Dropdown menu not visible after hover');
          }

          // Check dropdown items
          const dropdownItems = await this.page.$$('.nav-sublink');
          if (dropdownItems.length === 0) {
            throw new Error('No dropdown items found');
          }

          return `Dropdown menu shows ${dropdownItems.length} items`;
        }
      },
      {
        name: 'Dropdown keyboard navigation',
        test: async () => {
          // Focus on the dropdown trigger
          await this.page.focus('.nav-item-dropdown .nav-link[aria-haspopup="true"]');

          // Press Enter to open dropdown
          await this.page.keyboard.press('Enter');

          // Wait for dropdown to appear
          await this.page.waitForSelector('.nav-submenu[aria-hidden="false"]', { timeout: 2000 });

          // Press ArrowDown to navigate to first item
          await this.page.keyboard.press('ArrowDown');

          // Check if first submenu item is focused
          const focusedElement = await this.page.evaluate(() => {
            return document.activeElement.classList.contains('nav-sublink');
          });

          if (!focusedElement) {
            throw new Error('First submenu item not focused after ArrowDown');
          }

          // Press Escape to close dropdown
          await this.page.keyboard.press('Escape');

          // Check if dropdown is closed
          const isClosed = await this.page.waitForSelector('.nav-submenu[aria-hidden="true"]', { timeout: 2000 });

          return 'Keyboard navigation working correctly';
        }
      },
      {
        name: 'Dropdown z-index and positioning',
        test: async () => {
          const resourcesMenu = await this.page.$('.nav-item-dropdown');
          await resourcesMenu.hover();

          await this.page.waitForSelector('.nav-submenu', { visible: true, timeout: 2000 });

          const zIndex = await this.page.evaluate(() => {
            const submenu = document.querySelector('.nav-submenu');
            return window.getComputedStyle(submenu).zIndex;
          });

          if (parseInt(zIndex) < 1000) {
            throw new Error(`Z-index too low: ${zIndex}`);
          }

          return `Z-index correctly set to ${zIndex}`;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult('dropdownMenus', test.name, true, result);
        console.log(`  ✅ ${test.name}: ${result}`);
      } catch (error) {
        this.addTestResult('dropdownMenus', test.name, false, error.message);
        console.log(`  ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testMobileNavigation() {
    console.log('📱 Testing mobile navigation...');

    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 768, height: 1024, name: 'iPad' }
    ];

    for (const viewport of viewports) {
      console.log(`  Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await this.page.setViewport(viewport);
      await this.page.reload();

      const tests = [
        {
          name: `Mobile menu toggle - ${viewport.name}`,
          test: async () => {
            // Find mobile menu toggle
            const toggle = await this.page.$('#mobile-menu-toggle');
            if (!toggle) {
              throw new Error('Mobile menu toggle not found');
            }

            // Check initial state
            const initialState = await this.page.evaluate(() => {
              const toggle = document.getElementById('mobile-menu-toggle');
              const menu = document.getElementById('mobile-menu');
              return {
                toggleVisible: toggle && window.getComputedStyle(toggle).display !== 'none',
                menuHidden: menu && menu.classList.contains('hidden'),
                ariaExpanded: toggle && toggle.getAttribute('aria-expanded')
              };
            });

            if (!initialState.toggleVisible) {
              throw new Error('Mobile menu toggle not visible');
            }

            if (!initialState.menuHidden) {
              throw new Error('Mobile menu should be hidden initially');
            }

            // Click toggle to open menu
            await toggle.click();

            // Wait for menu to open
            await this.page.waitForFunction(() => {
              const menu = document.getElementById('mobile-menu');
              return menu && !menu.classList.contains('hidden');
            }, { timeout: 2000 });

            // Check menu is open
            const openState = await this.page.evaluate(() => {
              const toggle = document.getElementById('mobile-menu-toggle');
              const menu = document.getElementById('mobile-menu');
              return {
                menuVisible: menu && !menu.classList.contains('hidden'),
                ariaExpanded: toggle && toggle.getAttribute('aria-expanded') === 'true'
              };
            });

            if (!openState.menuVisible) {
              throw new Error('Mobile menu not visible after toggle');
            }

            if (!openState.ariaExpanded) {
              throw new Error('aria-expanded not set to true');
            }

            // Click toggle again to close menu
            await toggle.click();

            // Wait for menu to close
            await this.page.waitForFunction(() => {
              const menu = document.getElementById('mobile-menu');
              return menu && menu.classList.contains('hidden');
            }, { timeout: 2000 });

            return 'Mobile menu toggle working correctly';
          }
        },
        {
          name: `Mobile menu outside click - ${viewport.name}`,
          test: async () => {
            const toggle = await this.page.$('#mobile-menu-toggle');
            
            // Open menu
            await toggle.click();
            await this.page.waitForFunction(() => {
              const menu = document.getElementById('mobile-menu');
              return menu && !menu.classList.contains('hidden');
            });

            // Click outside menu
            await this.page.click('body', { offset: { x: 10, y: 10 } });

            // Wait for menu to close
            await this.page.waitForFunction(() => {
              const menu = document.getElementById('mobile-menu');
              return menu && menu.classList.contains('hidden');
            }, { timeout: 2000 });

            return 'Outside click closes mobile menu';
          }
        },
        {
          name: `Mobile menu escape key - ${viewport.name}`,
          test: async () => {
            const toggle = await this.page.$('#mobile-menu-toggle');
            
            // Open menu
            await toggle.click();
            await this.page.waitForFunction(() => {
              const menu = document.getElementById('mobile-menu');
              return menu && !menu.classList.contains('hidden');
            });

            // Press Escape
            await this.page.keyboard.press('Escape');

            // Wait for menu to close
            await this.page.waitForFunction(() => {
              const menu = document.getElementById('mobile-menu');
              return menu && menu.classList.contains('hidden');
            }, { timeout: 2000 });

            return 'Escape key closes mobile menu';
          }
        }
      ];

      for (const test of tests) {
        try {
          const result = await test.test();
          this.addTestResult('mobileNavigation', test.name, true, result);
          console.log(`    ✅ ${test.name}: ${result}`);
        } catch (error) {
          this.addTestResult('mobileNavigation', test.name, false, error.message);
          console.log(`    ❌ ${test.name}: ${error.message}`);
        }
      }
    }
  }

  async testThemeSwitching() {
    console.log('🌓 Testing theme switching...');

    // Set desktop viewport
    await this.page.setViewport({ width: 1200, height: 800 });

    const tests = [
      {
        name: 'Theme toggle button functionality',
        test: async () => {
          // Find theme toggle button
          const themeToggle = await this.page.$('#theme-toggle');
          if (!themeToggle) {
            throw new Error('Theme toggle button not found');
          }

          // Get initial theme
          const initialTheme = await this.page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          });

          // Click theme toggle
          await themeToggle.click();

          // Wait for theme change
          await this.page.waitForFunction((expectedTheme) => {
            const isDark = document.documentElement.classList.contains('dark');
            const currentTheme = isDark ? 'dark' : 'light';
            return currentTheme !== expectedTheme;
          }, {}, initialTheme);

          // Verify theme changed
          const newTheme = await this.page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          });

          if (newTheme === initialTheme) {
            throw new Error('Theme did not change after toggle');
          }

          return `Theme switched from ${initialTheme} to ${newTheme}`;
        }
      },
      {
        name: 'Theme persistence in localStorage',
        test: async () => {
          // Set theme to dark
          await this.page.evaluate(() => {
            if (window.themeSwitcher) {
              window.themeSwitcher.setTheme('dark');
            }
          });

          // Check localStorage
          const storedTheme = await this.page.evaluate(() => {
            return localStorage.getItem('theme-preference');
          });

          if (storedTheme !== 'dark') {
            throw new Error(`Expected 'dark' in localStorage, got '${storedTheme}'`);
          }

          // Reload page
          await this.page.reload();

          // Check if theme persisted
          const persistedTheme = await this.page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          });

          if (persistedTheme !== 'dark') {
            throw new Error('Theme did not persist after page reload');
          }

          return 'Theme persisted correctly in localStorage';
        }
      },
      {
        name: 'Theme switching across pages',
        test: async () => {
          // Set theme to light
          await this.page.evaluate(() => {
            if (window.themeSwitcher) {
              window.themeSwitcher.setTheme('light');
            }
          });

          // Navigate to about page
          await this.page.goto(`${this.baseUrl}/about/`);

          // Check theme on about page
          const aboutPageTheme = await this.page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          });

          if (aboutPageTheme !== 'light') {
            throw new Error('Theme not consistent across pages');
          }

          // Switch theme on about page
          const themeToggle = await this.page.$('#theme-toggle');
          if (themeToggle) {
            await themeToggle.click();
          }

          // Navigate back to home
          await this.page.goto(this.baseUrl);

          // Check theme persisted
          const homePageTheme = await this.page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          });

          if (homePageTheme !== 'dark') {
            throw new Error('Theme change did not persist across page navigation');
          }

          return 'Theme switching works consistently across pages';
        }
      },
      {
        name: 'Syntax highlighting theme switching',
        test: async () => {
          // Navigate to a page with code blocks
          await this.page.goto(`${this.baseUrl}/posts/markdown-showcase/`);

          // Check for syntax highlighting stylesheets
          const stylesheets = await this.page.evaluate(() => {
            const lightCSS = document.getElementById('chroma-light-css');
            const darkCSS = document.getElementById('chroma-dark-css');
            return {
              hasLight: !!lightCSS,
              hasDark: !!darkCSS,
              lightMedia: lightCSS ? lightCSS.media : null,
              darkMedia: darkCSS ? darkCSS.media : null
            };
          });

          if (!stylesheets.hasLight || !stylesheets.hasDark) {
            throw new Error('Syntax highlighting stylesheets not found');
          }

          // Switch to dark theme
          await this.page.evaluate(() => {
            if (window.themeSwitcher) {
              window.themeSwitcher.setTheme('dark');
            }
          });

          // Check stylesheet media attributes
          const darkThemeMedia = await this.page.evaluate(() => {
            const lightCSS = document.getElementById('chroma-light-css');
            const darkCSS = document.getElementById('chroma-dark-css');
            return {
              lightMedia: lightCSS ? lightCSS.media : null,
              darkMedia: darkCSS ? darkCSS.media : null
            };
          });

          if (darkThemeMedia.darkMedia !== 'all' || darkThemeMedia.lightMedia === 'all') {
            throw new Error('Syntax highlighting stylesheets not switched correctly');
          }

          return 'Syntax highlighting themes switch correctly';
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult('themeSwitching', test.name, true, result);
        console.log(`  ✅ ${test.name}: ${result}`);
      } catch (error) {
        this.addTestResult('themeSwitching', test.name, false, error.message);
        console.log(`  ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testAccessibility() {
    console.log('♿ Testing accessibility compliance...');

    // Set desktop viewport
    await this.page.setViewport({ width: 1200, height: 800 });

    const tests = [
      {
        name: 'Keyboard navigation - Tab order',
        test: async () => {
          await this.page.goto(this.baseUrl);

          // Start from the beginning
          await this.page.keyboard.press('Tab');

          // Get the focused element
          const firstFocused = await this.page.evaluate(() => {
            return document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : '');
          });

          // Continue tabbing through navigation
          const focusedElements = [firstFocused];
          for (let i = 0; i < 10; i++) {
            await this.page.keyboard.press('Tab');
            const focused = await this.page.evaluate(() => {
              return document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : '');
            });
            focusedElements.push(focused);
          }

          // Check if navigation elements are in the focus order
          const hasNavigation = focusedElements.some(el => 
            el.includes('theme-toggle') || el.includes('mobile-menu-toggle') || el.includes('nav-link')
          );

          if (!hasNavigation) {
            throw new Error('Navigation elements not in tab order');
          }

          return `Tab order includes navigation elements: ${focusedElements.slice(0, 5).join(', ')}...`;
        }
      },
      {
        name: 'ARIA attributes - Dropdown menus',
        test: async () => {
          const ariaAttributes = await this.page.evaluate(() => {
            const dropdown = document.querySelector('.nav-item-dropdown .nav-link[aria-haspopup="true"]');
            const submenu = document.querySelector('.nav-submenu');
            
            if (!dropdown || !submenu) {
              throw new Error('Dropdown elements not found');
            }

            return {
              hasPopup: dropdown.getAttribute('aria-haspopup'),
              expanded: dropdown.getAttribute('aria-expanded'),
              submenuHidden: submenu.getAttribute('aria-hidden'),
              submenuRole: submenu.getAttribute('role'),
              submenuLabelledBy: submenu.getAttribute('aria-labelledby')
            };
          });

          const requiredAttributes = ['hasPopup', 'expanded', 'submenuHidden', 'submenuRole'];
          const missingAttributes = requiredAttributes.filter(attr => !ariaAttributes[attr]);

          if (missingAttributes.length > 0) {
            throw new Error(`Missing ARIA attributes: ${missingAttributes.join(', ')}`);
          }

          return 'All required ARIA attributes present';
        }
      },
      {
        name: 'ARIA attributes - Mobile menu',
        test: async () => {
          await this.page.setViewport({ width: 375, height: 667 });

          const mobileAriaAttributes = await this.page.evaluate(() => {
            const toggle = document.getElementById('mobile-menu-toggle');
            const menu = document.getElementById('mobile-menu');
            
            if (!toggle || !menu) {
              throw new Error('Mobile menu elements not found');
            }

            return {
              toggleExpanded: toggle.getAttribute('aria-expanded'),
              toggleLabel: toggle.getAttribute('aria-label'),
              menuHidden: menu.getAttribute('aria-hidden')
            };
          });

          if (!mobileAriaAttributes.toggleExpanded) {
            throw new Error('Mobile toggle missing aria-expanded');
          }

          if (!mobileAriaAttributes.toggleLabel) {
            throw new Error('Mobile toggle missing aria-label');
          }

          return 'Mobile menu ARIA attributes correct';
        }
      },
      {
        name: 'Focus indicators visibility',
        test: async () => {
          await this.page.setViewport({ width: 1200, height: 800 });

          // Focus on theme toggle
          await this.page.focus('#theme-toggle');

          // Check if focus indicator is visible
          const focusVisible = await this.page.evaluate(() => {
            const element = document.getElementById('theme-toggle');
            const styles = window.getComputedStyle(element, ':focus-visible');
            return {
              outline: styles.outline,
              outlineWidth: styles.outlineWidth,
              outlineColor: styles.outlineColor
            };
          });

          // Also check computed styles for focus
          const actualFocus = await this.page.evaluate(() => {
            const element = document.getElementById('theme-toggle');
            const styles = window.getComputedStyle(element);
            return {
              outline: styles.outline,
              boxShadow: styles.boxShadow
            };
          });

          if (!actualFocus.outline || actualFocus.outline === 'none') {
            if (!actualFocus.boxShadow || actualFocus.boxShadow === 'none') {
              throw new Error('No visible focus indicator');
            }
          }

          return 'Focus indicators are visible';
        }
      },
      {
        name: 'Screen reader announcements',
        test: async () => {
          // Check for live region
          const liveRegion = await this.page.$('#live-region');
          if (!liveRegion) {
            // Try to trigger creation of live region
            await this.page.evaluate(() => {
              if (window.accessibilityManager && window.accessibilityManager.announceToScreenReader) {
                window.accessibilityManager.announceToScreenReader('Test announcement');
              }
            });

            // Check again
            const liveRegionAfter = await this.page.$('#live-region');
            if (!liveRegionAfter) {
              throw new Error('Live region not created for screen reader announcements');
            }
          }

          // Test theme toggle announcement
          const themeToggle = await this.page.$('#theme-toggle');
          await themeToggle.click();

          // Wait a moment for announcement
          await this.page.waitForTimeout(500);

          // Check if live region was used
          const liveRegionContent = await this.page.evaluate(() => {
            const region = document.getElementById('live-region');
            return region ? region.textContent : '';
          });

          // Note: This test is limited as we can't actually test screen reader behavior
          return 'Live region exists for screen reader announcements';
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult('accessibility', test.name, true, result);
        console.log(`  ✅ ${test.name}: ${result}`);
      } catch (error) {
        this.addTestResult('accessibility', test.name, false, error.message);
        console.log(`  ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  addTestResult(category, name, passed, message) {
    this.testResults[category].push({
      name,
      passed,
      message,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.testResults.summary.passed++;
    } else {
      this.testResults.summary.failed++;
    }
    this.testResults.summary.total++;
  }

  generateReport() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${this.testResults.summary.total}`);
    console.log(`Passed: ${this.testResults.summary.passed}`);
    console.log(`Failed: ${this.testResults.summary.failed}`);
    console.log(`Success Rate: ${((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1)}%`);

    // Detailed results by category
    Object.entries(this.testResults).forEach(([category, results]) => {
      if (category === 'summary') return;

      console.log(`\n${category.toUpperCase()}:`);
      results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${result.name}: ${result.message}`);
      });
    });

    // Save detailed report to file
    const reportPath = path.join(__dirname, '..', 'navigation-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Return success/failure
    return this.testResults.summary.failed === 0;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new NavigationTester();
  
  tester.init()
    .then(() => tester.runAllTests())
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = NavigationTester;