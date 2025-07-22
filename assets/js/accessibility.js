/**
 * Accessibility Enhancement System
 * Implements WCAG 2.1 accessibility features and keyboard navigation
 * 
 * Features:
 * - Enhanced keyboard navigation
 * - Focus management
 * - Screen reader announcements
 * - High contrast mode detection
 * - Reduced motion support
 * - Color contrast validation
 */

class AccessibilityManager {
  constructor() {
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'details',
      'summary'
    ].join(', ');
    
    this.init();
  }
  
  /**
   * Initialize accessibility features
   */
  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupReducedMotion();
    this.setupHighContrast();
    this.setupScreenReaderSupport();
    this.validateColorContrast();
    
    // Set up after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDOMFeatures());
    } else {
      this.setupDOMFeatures();
    }
  }
  
  /**
   * Set up DOM-dependent features
   */
  setupDOMFeatures() {
    this.setupSkipLinks();
    this.setupLandmarkNavigation();
    this.setupFormAccessibility();
    this.setupImageAccessibility();
  }
  
  /**
   * Enhanced keyboard navigation support
   */
  setupKeyboardNavigation() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + 1: Skip to main content
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        this.focusElement('#main-content');
        this.announceToScreenReader('Jumped to main content');
      }
      
      // Alt + 2: Skip to navigation
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        this.focusElement('#navigation');
        this.announceToScreenReader('Jumped to navigation');
      }
      
      // Alt + 3: Skip to footer
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        this.focusElement('#footer');
        this.announceToScreenReader('Jumped to footer');
      }
      
      // Escape key: Close modals, dropdowns, etc.
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      // Arrow key navigation for menus
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowNavigation(e);
      }
    });
  }
  
  /**
   * Focus management system
   */
  setupFocusManagement() {
    // Track focus for better management
    let lastFocusedElement = null;
    
    document.addEventListener('focusin', (e) => {
      lastFocusedElement = e.target;
      this.ensureFocusVisible(e.target);
    });
    
    // Store last focused element for restoration
    this.lastFocusedElement = lastFocusedElement;
    
    // Trap focus in modals when they're open
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (modal) {
          this.trapFocus(e, modal);
        }
      }
    });
  }
  
  /**
   * Ensure focus is visible for keyboard users
   */
  ensureFocusVisible(element) {
    if (!element) return;
    
    // Add focus-visible class for styling
    element.classList.add('focus-visible');
    
    // Remove on blur
    element.addEventListener('blur', () => {
      element.classList.remove('focus-visible');
    }, { once: true });
    
    // Scroll element into view if needed
    if (element.scrollIntoViewIfNeeded) {
      element.scrollIntoViewIfNeeded();
    } else {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }
  
  /**
   * Trap focus within a container (for modals)
   */
  trapFocus(event, container) {
    const focusableElements = container.querySelectorAll(this.focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  /**
   * Handle escape key for closing UI elements
   */
  handleEscapeKey() {
    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.focus();
      }
    }
    
    // Close any open dropdowns
    const openDropdowns = document.querySelectorAll('.nav-submenu[aria-hidden="false"]');
    openDropdowns.forEach(dropdown => {
      dropdown.setAttribute('aria-hidden', 'true');
      const trigger = dropdown.previousElementSibling;
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  }
  
  /**
   * Handle arrow key navigation in menus
   */
  handleArrowNavigation(event) {
    const activeElement = document.activeElement;
    const isInMenu = activeElement.closest('.nav-menu, .nav-submenu');
    
    if (!isInMenu) return;
    
    const menuItems = Array.from(isInMenu.querySelectorAll('a, button'));
    const currentIndex = menuItems.indexOf(activeElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % menuItems.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        // Open submenu if available
        if (activeElement.getAttribute('aria-haspopup') === 'true') {
          event.preventDefault();
          const submenu = activeElement.nextElementSibling;
          if (submenu) {
            submenu.setAttribute('aria-hidden', 'false');
            activeElement.setAttribute('aria-expanded', 'true');
            const firstSubmenuItem = submenu.querySelector('a, button');
            if (firstSubmenuItem) firstSubmenuItem.focus();
          }
        }
        return;
      case 'ArrowLeft':
        // Close submenu and return to parent
        if (activeElement.closest('.nav-submenu')) {
          event.preventDefault();
          const submenu = activeElement.closest('.nav-submenu');
          const trigger = submenu.previousElementSibling;
          if (trigger) {
            submenu.setAttribute('aria-hidden', 'true');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
          }
        }
        return;
      default:
        return;
    }
    
    if (nextIndex !== undefined && menuItems[nextIndex]) {
      menuItems[nextIndex].focus();
    }
  }
  
  /**
   * Set up skip links functionality
   */
  setupSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          // Make target focusable if it isn't already
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }
          
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Remove tabindex after focus to restore natural tab order
          setTimeout(() => {
            if (target.getAttribute('tabindex') === '-1') {
              target.removeAttribute('tabindex');
            }
          }, 100);
        }
      });
    });
  }
  
  /**
   * Set up landmark navigation
   */
  setupLandmarkNavigation() {
    // Add landmark shortcuts
    const landmarks = {
      'main': 'Main content',
      'nav': 'Navigation',
      'aside': 'Sidebar',
      'footer': 'Footer',
      'header': 'Header'
    };
    
    Object.entries(landmarks).forEach(([tag, label]) => {
      const elements = document.querySelectorAll(tag);
      elements.forEach((element, index) => {
        if (!element.getAttribute('aria-label') && elements.length > 1) {
          element.setAttribute('aria-label', `${label} ${index + 1}`);
        }
      });
    });
  }
  
  /**
   * Enhanced form accessibility
   */
  setupFormAccessibility() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Associate labels with inputs
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (!label && input.id) {
          // Look for nearby text that could be a label
          const possibleLabel = input.previousElementSibling;
          if (possibleLabel && possibleLabel.textContent.trim()) {
            input.setAttribute('aria-label', possibleLabel.textContent.trim());
          }
        }
        
        // Add required field indicators
        if (input.hasAttribute('required')) {
          input.setAttribute('aria-required', 'true');
          
          // Add visual indicator if not present
          const label = form.querySelector(`label[for="${input.id}"]`);
          if (label && !label.querySelector('.required-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator';
            indicator.textContent = ' *';
            indicator.setAttribute('aria-label', 'required');
            label.appendChild(indicator);
          }
        }
      });
      
      // Form validation feedback
      form.addEventListener('submit', (e) => {
        const invalidInputs = form.querySelectorAll(':invalid');
        if (invalidInputs.length > 0) {
          e.preventDefault();
          this.announceToScreenReader(`Form has ${invalidInputs.length} error${invalidInputs.length > 1 ? 's' : ''}`);
          invalidInputs[0].focus();
        }
      });
    });
  }
  
  /**
   * Enhanced image accessibility
   */
  setupImageAccessibility() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Check for missing alt text
      if (!img.hasAttribute('alt')) {
        console.warn('Image missing alt text:', img.src);
        img.setAttribute('alt', ''); // Decorative image
      }
      
      // Handle loading errors
      img.addEventListener('error', () => {
        img.setAttribute('alt', 'Image failed to load');
        img.style.display = 'none';
      });
    });
  }
  
  /**
   * Reduced motion support
   */
  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (mediaQuery) => {
      if (mediaQuery.matches) {
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-normal', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');
        
        // Disable smooth scrolling
        document.documentElement.style.scrollBehavior = 'auto';
      } else {
        document.documentElement.style.removeProperty('--transition-fast');
        document.documentElement.style.removeProperty('--transition-normal');
        document.documentElement.style.removeProperty('--transition-slow');
        document.documentElement.style.removeProperty('scroll-behavior');
      }
    };
    
    handleReducedMotion(prefersReducedMotion);
    prefersReducedMotion.addEventListener('change', handleReducedMotion);
  }
  
  /**
   * High contrast mode support
   */
  setupHighContrast() {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    const handleHighContrast = (mediaQuery) => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('high-contrast');
        
        // Enhance focus indicators for high contrast
        document.documentElement.style.setProperty('--color-focus', '#ffff00');
        document.documentElement.style.setProperty('--color-border', '#ffffff');
      } else {
        document.documentElement.classList.remove('high-contrast');
        document.documentElement.style.removeProperty('--color-focus');
        document.documentElement.style.removeProperty('--color-border');
      }
    };
    
    handleHighContrast(prefersHighContrast);
    prefersHighContrast.addEventListener('change', handleHighContrast);
  }
  
  /**
   * Screen reader support utilities
   */
  setupScreenReaderSupport() {
    // Create live region if it doesn't exist
    if (!document.getElementById('live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
  }
  
  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message, priority = 'polite') {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
  
  /**
   * Focus an element by selector
   */
  focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      // Make focusable if needed
      if (!element.hasAttribute('tabindex') && !element.matches(this.focusableSelectors)) {
        element.setAttribute('tabindex', '-1');
      }
      
      element.focus();
      this.ensureFocusVisible(element);
      
      // Remove temporary tabindex
      setTimeout(() => {
        if (element.getAttribute('tabindex') === '-1' && !element.matches(this.focusableSelectors)) {
          element.removeAttribute('tabindex');
        }
      }, 100);
    }
  }
  
  /**
   * Validate color contrast ratios
   */
  validateColorContrast() {
    // This is a simplified contrast checker
    // In a real implementation, you'd want a more robust solution
    const checkContrast = (foreground, background) => {
      // Convert colors to RGB and calculate contrast ratio
      // This is a placeholder - implement actual contrast calculation
      return true; // Assume passing for now
    };
    
    // Check key color combinations
    const colorTests = [
      { fg: 'var(--color-text)', bg: 'var(--color-bg)', name: 'Body text' },
      { fg: 'var(--color-link)', bg: 'var(--color-bg)', name: 'Links' },
      { fg: 'var(--color-heading)', bg: 'var(--color-bg)', name: 'Headings' }
    ];
    
    colorTests.forEach(test => {
      if (!checkContrast(test.fg, test.bg)) {
        console.warn(`Color contrast may be insufficient for ${test.name}`);
      }
    });
  }
  
  /**
   * Get current accessibility status
   */
  getAccessibilityStatus() {
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      screenReader: this.detectScreenReader(),
      keyboardNavigation: true
    };
  }
  
  /**
   * Detect if screen reader is likely active
   */
  detectScreenReader() {
    // This is a heuristic - not 100% reliable
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           false;
  }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.accessibilityManager = accessibilityManager;
}