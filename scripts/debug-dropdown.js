#!/usr/bin/env node

/**
 * Debug Dropdown Hover Issue
 */

const { chromium } = require('playwright');

async function debugDropdown() {
  console.log('🔍 Debugging dropdown hover issue...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:1313', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Check if dropdown elements exist
    const dropdownExists = await page.locator('.nav-item-dropdown').count();
    console.log(`Found ${dropdownExists} dropdown items`);
    
    if (dropdownExists === 0) {
      console.log('❌ No dropdown items found - checking menu structure...');
      
      // Check menu structure
      const menuStructure = await page.evaluate(() => {
        const menu = document.querySelector('.nav-menu');
        if (!menu) return 'No nav-menu found';
        
        const items = Array.from(menu.querySelectorAll('.nav-item'));
        return items.map(item => ({
          hasDropdown: item.classList.contains('nav-item-dropdown'),
          text: item.textContent.trim(),
          hasSubmenu: !!item.querySelector('.nav-submenu')
        }));
      });
      
      console.log('Menu structure:', JSON.stringify(menuStructure, null, 2));
      await browser.close();
      return;
    }
    
    // Test hover functionality
    const dropdown = page.locator('.nav-item-dropdown').first();
    
    // Get initial state
    const initialState = await page.evaluate(() => {
      const submenu = document.querySelector('.nav-submenu');
      if (!submenu) return 'No submenu found';
      
      const styles = window.getComputedStyle(submenu);
      return {
        opacity: styles.opacity,
        visibility: styles.visibility,
        transform: styles.transform,
        display: styles.display
      };
    });
    
    console.log('Initial submenu state:', initialState);
    
    // Hover over dropdown
    await dropdown.hover();
    
    // Wait a moment for CSS transition
    await page.waitForTimeout(500);
    
    // Check state after hover
    const hoverState = await page.evaluate(() => {
      const submenu = document.querySelector('.nav-submenu');
      if (!submenu) return 'No submenu found';
      
      const styles = window.getComputedStyle(submenu);
      return {
        opacity: styles.opacity,
        visibility: styles.visibility,
        transform: styles.transform,
        display: styles.display,
        zIndex: styles.zIndex
      };
    });
    
    console.log('After hover state:', hoverState);
    
    // Check if hover CSS rules are applied
    const cssRules = await page.evaluate(() => {
      const submenu = document.querySelector('.nav-submenu');
      const dropdown = document.querySelector('.nav-item-dropdown');
      
      if (!submenu || !dropdown) return 'Elements not found';
      
      // Check if parent has hover state
      const parentHover = dropdown.matches(':hover');
      
      // Check CSS rules
      const allRules = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || sheet.rules || []);
          } catch (e) {
            return [];
          }
        })
        .filter(rule => rule.selectorText && rule.selectorText.includes('nav-submenu'))
        .map(rule => ({
          selector: rule.selectorText,
          cssText: rule.cssText
        }));
      
      return {
        parentHover,
        cssRules: allRules
      };
    });
    
    console.log('CSS analysis:', JSON.stringify(cssRules, null, 2));
    
    // Keep browser open for manual inspection
    console.log('Browser kept open for manual inspection. Press Ctrl+C to close.');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugDropdown();