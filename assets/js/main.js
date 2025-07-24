/**
 * Main JavaScript Initialization System
 * Coordinates all navigation and interactive features with robust error handling
 * 
 * Features:
 * - Centralized initialization with proper DOM ready checks
 * - Comprehensive error handling for missing DOM elements
 * - Console warnings for debugging navigation issues
 * - Event listener cleanup and conflict prevention
 * - Graceful degradation when components fail
 * - Performance monitoring and debugging utilities
 */

class NavigationController {
  constructor() {
    this.components = new Map();
    this.initializationErrors = [];
    this.debugMode = this.isDebugMode();
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.initializationTimeout = 10000; // 10 seconds
    
    // Bind methods to preserve context
    this.handleDOMReady = this.handleDOMReady.bind(this);
    this.handleWindowLoad = this.handleWindowLoad.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleError = this.handleError.bind(this);
    
    this.init();
  }
  
  /**
   * Initialize the navigation controller
   */
  init() {
    this.log('NavigationController: Starting initialization...');
    this.log('NavigationController: Debug mode:', this.debugMode);
    this.log('NavigationController: Document ready state:', document.readyState);
    this.log('NavigationController: User agent:', navigator.userAgent);
    
    // Set up global error handling
    this.setupGlobalErrorHandling();
    
    // Initialize based on document ready state
    if (document.readyState === 'loading') {
      this.log('NavigationController: DOM still loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', this.handleDOMReady, { once: true });
    } else {
      this.log('NavigationController: DOM ready, initializing immediately...');
      // Use setTimeout to ensure all scripts have loaded
      setTimeout(this.handleDOMReady, 0);
    }
    
    // Additional initialization on window load
    window.addEventListener('load', this.handleWindowLoad, { once: true });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload, { once: true });
    
    // Fallback initialization with timeout
    this.setupFallbackInitialization();
  }
  
  /**
   * Set up global error handling
   */
  setupGlobalErrorHandling() {
    // Catch JavaScript errors
    window.addEventListener('error', this.handleError);
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: 'Unhandled promise rejection: ' + event.reason,
        filename: 'Promise',
        lineno: 0,
        colno: 0,
        error: event.reason
      });
    });
  }
  
  /**
   * Handle DOM ready event
   */
  handleDOMReady() {
    this.log('NavigationController: DOM ready, starting component initialization...');
    
    try {
      this.validateEnvironment();
      this.initializeComponents();
      this.setupEventDelegation();
      this.performHealthCheck();
      
      this.log('NavigationController: Initialization completed successfully');
      
      // Dispatch custom event for other scripts
      this.dispatchEvent('navigationControllerReady', {
        components: Array.from(this.components.keys()),
        errors: this.initializationErrors
      });
      
    } catch (error) {
      this.handleError({
        message: 'Failed to initialize NavigationController',
        error: error
      });
    }
  }
  
  /**
   * Handle window load event
   */
  handleWindowLoad() {
    this.log('NavigationController: Window fully loaded');
    
    // Perform additional checks after all resources are loaded
    this.performPostLoadChecks();
    
    // Dispatch window load event
    this.dispatchEvent('navigationControllerLoaded');
  }
  
  /**
   * Handle page unload for cleanup
   */
  handleBeforeUnload() {
    this.log('NavigationController: Page unloading, cleaning up...');
    this.cleanup();
  }
  
  /**
   * Validate the environment before initialization
   */
  validateEnvironment() {
    this.log('NavigationController: Validating environment...');
    
    // Check for required browser features
    const requiredFeatures = [
      'addEventListener',
      'querySelector',
      'classList',
      'localStorage'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => {
      if (feature === 'localStorage') {
        try {
          return !window.localStorage;
        } catch (e) {
          return true;
        }
      }
      return !document[feature] && !Element.prototype[feature];
    });
    
    if (missingFeatures.length > 0) {
      throw new Error(`Missing required browser features: ${missingFeatures.join(', ')}`);
    }
    
    // Check document structure
    if (!document.body) {
      throw new Error('Document body not found');
    }
    
    this.log('NavigationController: Environment validation passed');
  }
  
  /**
   * Initialize all navigation components
   */
  initializeComponents() {
    this.log('NavigationController: Initializing components...');
    
    const componentInitializers = [
      { name: 'ThemeSwitcher', init: this.initializeThemeSwitcher.bind(this) },
      { name: 'MobileNavigation', init: this.initializeMobileNavigation.bind(this) },
      { name: 'AccessibilityManager', init: this.initializeAccessibilityManager.bind(this) }
    ];
    
    componentInitializers.forEach(({ name, init }) => {
      try {
        this.log(`NavigationController: Initializing ${name}...`);
        const component = init();
        
        if (component) {
          this.components.set(name, component);
          this.log(`NavigationController: ${name} initialized successfully`);
        } else {
          this.warn(`NavigationController: ${name} initialization returned null/undefined`);
        }
        
      } catch (error) {
        this.handleComponentError(name, error);
      }
    });
    
    this.log(`NavigationController: Initialized ${this.components.size} components`);
  }
  
  /**
   * Initialize theme switcher with error handling
   */
  initializeThemeSwitcher() {
    // Return existing instance if available
    if (window.themeSwitcher) {
      this.log('NavigationController: Using existing ThemeSwitcher instance');
      return window.themeSwitcher;
    }
    
    // Check if ThemeSwitcher class is available
    if (typeof ThemeSwitcher === 'undefined') {
      this.warn('NavigationController: ThemeSwitcher class not found');
      return null;
    }
    
    // Check for required DOM elements
    const themeButtons = [
      document.getElementById('theme-toggle'),
      document.getElementById('theme-toggle-mobile')
    ].filter(Boolean);
    
    if (themeButtons.length === 0) {
      this.warn('NavigationController: No theme toggle buttons found (#theme-toggle, #theme-toggle-mobile)');
    }
    
    try {
      // Create new instance only if none exists
      const instance = new ThemeSwitcher();
      return instance;
    } catch (error) {
      throw new Error(`ThemeSwitcher initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Initialize mobile navigation with error handling
   */
  initializeMobileNavigation() {
    // Return existing instance if available
    if (window.mobileNavigation) {
      this.log('NavigationController: Using existing MobileNavigation instance');
      return window.mobileNavigation;
    }
    
    // Check if MobileNavigation class is available
    if (typeof MobileNavigation === 'undefined') {
      this.warn('NavigationController: MobileNavigation class not found');
      return null;
    }
    
    // Check for required DOM elements
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileToggle) {
      this.warn('NavigationController: Mobile menu toggle not found (#mobile-menu-toggle)');
    }
    
    if (!mobileMenu) {
      this.warn('NavigationController: Mobile menu not found (#mobile-menu)');
    }
    
    if (!mobileToggle || !mobileMenu) {
      this.warn('NavigationController: Mobile navigation elements missing, skipping initialization');
      return null;
    }
    
    try {
      // Create new instance only if none exists
      const instance = new MobileNavigation();
      return instance;
    } catch (error) {
      throw new Error(`MobileNavigation initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Initialize accessibility manager with error handling
   */
  initializeAccessibilityManager() {
    // Return existing instance if available
    if (window.accessibilityManager) {
      this.log('NavigationController: Using existing AccessibilityManager instance');
      return window.accessibilityManager;
    }
    
    // Check if AccessibilityManager class is available
    if (typeof AccessibilityManager === 'undefined') {
      this.warn('NavigationController: AccessibilityManager class not found');
      return null;
    }
    
    try {
      // Create new instance only if none exists
      const instance = new AccessibilityManager();
      return instance;
    } catch (error) {
      throw new Error(`AccessibilityManager initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Set up event delegation for better performance and reliability
   */
  setupEventDelegation() {
    this.log('NavigationController: Setting up event delegation...');
    
    // Delegate click events for better performance
    document.addEventListener('click', this.handleDelegatedClick.bind(this), { passive: false });
    
    // Delegate keyboard events
    document.addEventListener('keydown', this.handleDelegatedKeydown.bind(this), { passive: false });
    
    // Handle focus events for accessibility
    document.addEventListener('focusin', this.handleDelegatedFocus.bind(this), { passive: true });
    
    this.log('NavigationController: Event delegation set up');
  }
  
  /**
   * Handle delegated click events
   */
  handleDelegatedClick(event) {
    const target = event.target.closest('[data-nav-action]');
    if (!target) return;
    
    const action = target.getAttribute('data-nav-action');
    this.log(`NavigationController: Delegated click action: ${action}`);
    
    try {
      switch (action) {
        case 'toggle-theme':
          this.handleThemeToggle(event, target);
          break;
        case 'toggle-mobile-menu':
          this.handleMobileMenuToggle(event, target);
          break;
        default:
          this.log(`NavigationController: Unknown action: ${action}`);
      }
    } catch (error) {
      this.handleError({
        message: `Delegated click handler failed for action: ${action}`,
        error: error
      });
    }
  }
  
  /**
   * Handle delegated keyboard events
   */
  handleDelegatedKeydown(event) {
    // Handle global keyboard shortcuts
    if (event.altKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          this.focusElement('#main-content', 'Jumped to main content');
          break;
        case '2':
          event.preventDefault();
          this.focusElement('#navigation', 'Jumped to navigation');
          break;
        case '3':
          event.preventDefault();
          this.focusElement('#footer', 'Jumped to footer');
          break;
      }
    }
  }
  
  /**
   * Handle delegated focus events
   */
  handleDelegatedFocus(event) {
    // Ensure focus is visible for keyboard users
    if (event.target.matches('button, a, input, textarea, select, [tabindex]')) {
      event.target.classList.add('focus-visible');
      
      // Remove on blur
      event.target.addEventListener('blur', () => {
        event.target.classList.remove('focus-visible');
      }, { once: true });
    }
  }
  
  /**
   * Handle theme toggle action
   */
  handleThemeToggle(event, target) {
    event.preventDefault();
    
    const themeSwitcher = this.components.get('ThemeSwitcher');
    if (themeSwitcher && typeof themeSwitcher.toggleTheme === 'function') {
      themeSwitcher.toggleTheme();
    } else {
      this.warn('NavigationController: ThemeSwitcher not available for toggle action');
    }
  }
  
  /**
   * Handle mobile menu toggle action
   */
  handleMobileMenuToggle(event, target) {
    event.preventDefault();
    
    const mobileNav = this.components.get('MobileNavigation');
    if (mobileNav && typeof mobileNav.toggleMenu === 'function') {
      mobileNav.toggleMenu();
    } else {
      this.warn('NavigationController: MobileNavigation not available for toggle action');
    }
  }
  
  /**
   * Focus an element with announcement
   */
  focusElement(selector, announcement) {
    const element = document.querySelector(selector);
    if (element) {
      // Make focusable if needed
      if (!element.hasAttribute('tabindex') && !element.matches('a, button, input, textarea, select')) {
        element.setAttribute('tabindex', '-1');
      }
      
      element.focus();
      
      // Announce to screen readers
      if (announcement) {
        this.announceToScreenReader(announcement);
      }
      
      // Remove temporary tabindex
      setTimeout(() => {
        if (element.getAttribute('tabindex') === '-1') {
          element.removeAttribute('tabindex');
        }
      }, 100);
    }
  }
  
  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    const accessibilityManager = this.components.get('AccessibilityManager');
    if (accessibilityManager && typeof accessibilityManager.announceToScreenReader === 'function') {
      accessibilityManager.announceToScreenReader(message);
    } else {
      // Fallback announcement
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    }
  }
  
  /**
   * Perform health check on initialized components
   */
  performHealthCheck() {
    this.log('NavigationController: Performing health check...');
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      components: {},
      domElements: {},
      errors: this.initializationErrors.slice()
    };
    
    // Check component health
    this.components.forEach((component, name) => {
      healthReport.components[name] = {
        initialized: !!component,
        hasRequiredMethods: this.validateComponentMethods(component, name)
      };
    });
    
    // Check critical DOM elements
    const criticalElements = [
      'mobile-menu-toggle',
      'mobile-menu',
      'theme-toggle',
      'main-content',
      'live-region'
    ];
    
    criticalElements.forEach(id => {
      const element = document.getElementById(id);
      healthReport.domElements[id] = {
        exists: !!element,
        visible: element ? !element.hidden && element.offsetParent !== null : false
      };
    });
    
    this.log('NavigationController: Health check completed', healthReport);
    
    // Store health report for debugging
    this.healthReport = healthReport;
    
    // Warn about missing critical elements
    Object.entries(healthReport.domElements).forEach(([id, status]) => {
      if (!status.exists) {
        this.warn(`NavigationController: Critical element missing: #${id}`);
      }
    });
  }
  
  /**
   * Validate component methods
   */
  validateComponentMethods(component, name) {
    const requiredMethods = {
      'ThemeSwitcher': ['toggleTheme', 'setTheme', 'getCurrentTheme'],
      'MobileNavigation': ['toggleMenu', 'openMenu', 'closeMenu'],
      'AccessibilityManager': ['announceToScreenReader', 'focusElement']
    };
    
    const required = requiredMethods[name] || [];
    return required.every(method => typeof component[method] === 'function');
  }
  
  /**
   * Perform post-load checks
   */
  performPostLoadChecks() {
    this.log('NavigationController: Performing post-load checks...');
    
    // Check for any elements that might have loaded late
    this.retryFailedInitializations();
    
    // Validate CSS has loaded
    this.validateCSSLoaded();
    
    // Check for JavaScript errors in console
    this.checkConsoleErrors();
  }
  
  /**
   * Retry failed component initializations
   */
  retryFailedInitializations() {
    if (this.initializationErrors.length === 0) return;
    
    this.log('NavigationController: Retrying failed initializations...');
    
    // Only retry if we haven't exceeded max attempts
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      
      // Clear previous errors and try again
      const previousErrors = this.initializationErrors.slice();
      this.initializationErrors = [];
      
      this.initializeComponents();
      
      // Log retry results
      if (this.initializationErrors.length < previousErrors.length) {
        this.log(`NavigationController: Retry ${this.retryAttempts} successful, reduced errors from ${previousErrors.length} to ${this.initializationErrors.length}`);
      }
    }
  }
  
  /**
   * Validate CSS has loaded properly
   */
  validateCSSLoaded() {
    // Check if critical CSS classes are available
    const testElement = document.createElement('div');
    testElement.className = 'hidden';
    document.body.appendChild(testElement);
    
    const isHidden = window.getComputedStyle(testElement).display === 'none';
    document.body.removeChild(testElement);
    
    if (!isHidden) {
      this.warn('NavigationController: CSS may not have loaded properly - .hidden class not working');
    }
  }
  
  /**
   * Check for JavaScript errors in console
   */
  checkConsoleErrors() {
    // This is a placeholder - in a real implementation you might
    // integrate with error tracking services
    if (this.initializationErrors.length > 0) {
      this.warn(`NavigationController: ${this.initializationErrors.length} initialization errors detected`);
    }
  }
  
  /**
   * Set up fallback initialization with timeout
   */
  setupFallbackInitialization() {
    setTimeout(() => {
      if (this.components.size === 0) {
        this.warn('NavigationController: Fallback initialization triggered - no components initialized within timeout');
        this.handleDOMReady();
      }
    }, this.initializationTimeout);
  }
  
  /**
   * Handle component initialization errors
   */
  handleComponentError(componentName, error) {
    const errorInfo = {
      component: componentName,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    this.initializationErrors.push(errorInfo);
    this.error(`NavigationController: ${componentName} initialization failed:`, error);
    
    // Continue with other components
  }
  
  /**
   * Handle global errors
   */
  handleError(errorEvent) {
    const error = {
      message: errorEvent.message || 'Unknown error',
      filename: errorEvent.filename || 'Unknown file',
      lineno: errorEvent.lineno || 0,
      colno: errorEvent.colno || 0,
      stack: errorEvent.error?.stack || 'No stack trace',
      timestamp: new Date().toISOString()
    };
    
    this.initializationErrors.push(error);
    this.error('NavigationController: Global error caught:', error);
  }
  
  /**
   * Dispatch custom events
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: {
        controller: this,
        ...detail
      }
    });
    
    document.dispatchEvent(event);
    this.log(`NavigationController: Dispatched event: ${eventName}`);
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    // Remove global event listeners
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleError);
    
    // Clean up components
    this.components.forEach((component, name) => {
      if (component && typeof component.destroy === 'function') {
        try {
          component.destroy();
          this.log(`NavigationController: Cleaned up ${name}`);
        } catch (error) {
          this.error(`NavigationController: Error cleaning up ${name}:`, error);
        }
      }
    });
    
    this.components.clear();
    this.log('NavigationController: Cleanup completed');
  }
  
  /**
   * Check if debug mode is enabled
   */
  isDebugMode() {
    return (
      localStorage.getItem('navigation-debug') === 'true' ||
      window.location.search.includes('debug=true') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('127.0.0.1')
    );
  }
  
  /**
   * Logging utilities
   */
  log(...args) {
    if (this.debugMode) {
      console.log(...args);
    }
  }
  
  warn(...args) {
    console.warn(...args);
  }
  
  error(...args) {
    console.error(...args);
  }
  
  /**
   * Get current status for debugging
   */
  getStatus() {
    return {
      initialized: this.components.size > 0,
      components: Array.from(this.components.keys()),
      errors: this.initializationErrors,
      healthReport: this.healthReport,
      debugMode: this.debugMode,
      retryAttempts: this.retryAttempts
    };
  }
}

// Initialize navigation controller
let navigationController;

// Prevent multiple initialization
if (!window.navigationController) {
  navigationController = new NavigationController();
  window.navigationController = navigationController;
  
  // Export for debugging
  if (typeof window !== 'undefined') {
    window.getNavigationStatus = () => navigationController.getStatus();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationController;
}