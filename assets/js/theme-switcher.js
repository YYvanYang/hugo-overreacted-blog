/**
 * Theme Switching System with No-Flash Loading
 * Implements modern JavaScript theme switching patterns with accessibility best practices
 * 
 * Features:
 * - System preference detection
 * - localStorage persistence
 * - No-flash loading
 * - Accessibility support with ARIA labels and screen reader announcements
 * - CSS class-based theme application
 * - Keyboard navigation support
 */

class ThemeSwitcher {
  constructor() {
    this.STORAGE_KEY = 'theme-preference';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    };
    
    this.currentTheme = this.getStoredTheme();
    this.systemPreference = this.getSystemPreference();
    
    this.init();
  }
  
  /**
   * Initialize the theme switcher
   */
  init() {
    // Apply theme immediately to prevent flash
    this.applyTheme(this.getEffectiveTheme());
    
    // Set up event listeners after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
    
    // Listen for system preference changes
    this.watchSystemPreference();
  }
  
  /**
   * Set up event listeners for theme toggle buttons and keyboard shortcuts
   */
  setupEventListeners() {
    // Theme toggle button
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggleTheme());
      toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
      
      // Update button state
      this.updateToggleButton(toggleButton);
    }
    
    // Keyboard shortcut (Ctrl/Cmd + Shift + L)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
  
  /**
   * Get the stored theme preference from localStorage
   * @returns {string} The stored theme or system default
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || this.THEMES.SYSTEM;
    } catch (error) {
      console.warn('Failed to access localStorage for theme preference:', error);
      return this.THEMES.SYSTEM;
    }
  }
  
  /**
   * Get the system color scheme preference
   * @returns {string} 'dark' or 'light'
   */
  getSystemPreference() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? this.THEMES.DARK 
        : this.THEMES.LIGHT;
    }
    return this.THEMES.LIGHT;
  }
  
  /**
   * Get the effective theme (resolving 'system' to actual preference)
   * @returns {string} 'dark' or 'light'
   */
  getEffectiveTheme() {
    if (this.currentTheme === this.THEMES.SYSTEM) {
      return this.systemPreference;
    }
    return this.currentTheme;
  }
  
  /**
   * Apply the theme to the document
   * @param {string} theme - 'dark' or 'light'
   */
  applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === this.THEMES.DARK;
    
    // Apply CSS class
    html.classList.toggle('dark', isDark);
    
    // Set data attribute for CSS targeting
    html.setAttribute('data-theme', theme);
    
    // Update color-scheme for form controls
    html.style.colorScheme = theme;
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
    
    // Load appropriate syntax highlighting stylesheet
    this.loadSyntaxHighlightingCSS(theme);
  }
  
  /**
   * Load the appropriate syntax highlighting CSS based on theme
   * @param {string} theme - 'dark' or 'light'
   */
  loadSyntaxHighlightingCSS(theme) {
    const isDark = theme === this.THEMES.DARK;
    
    // Get the existing syntax highlighting stylesheets
    const lightCSS = document.getElementById('chroma-light-css');
    const darkCSS = document.getElementById('chroma-dark-css');
    
    if (lightCSS && darkCSS) {
      // Update media attributes to enable/disable stylesheets
      if (isDark) {
        lightCSS.media = 'not all'; // Disable light theme CSS
        darkCSS.media = 'all';      // Enable dark theme CSS
      } else {
        lightCSS.media = 'all';     // Enable light theme CSS
        darkCSS.media = 'not all';  // Disable dark theme CSS
      }
    } else {
      // Fallback: Log warning if stylesheets are not found
      console.warn('Syntax highlighting stylesheets not found. Make sure chroma-light-css and chroma-dark-css elements exist.');
    }
  }
  
  /**
   * Update the meta theme-color for mobile browsers
   * @param {string} theme - 'dark' or 'light'
   */
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Use CSS custom properties values
    const colors = {
      light: '#ffffff',
      dark: '#282c35'
    };
    
    metaThemeColor.content = colors[theme] || colors.light;
  }
  
  /**
   * Store the theme preference in localStorage
   * @param {string} theme - The theme to store
   */
  storeTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to store theme preference:', error);
    }
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const newTheme = effectiveTheme === this.THEMES.DARK 
      ? this.THEMES.LIGHT 
      : this.THEMES.DARK;
    
    this.setTheme(newTheme);
  }
  
  /**
   * Set a specific theme
   * @param {string} theme - The theme to set ('light', 'dark', or 'system')
   */
  setTheme(theme) {
    if (!Object.values(this.THEMES).includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }
    
    this.currentTheme = theme;
    this.storeTheme(theme);
    
    const effectiveTheme = this.getEffectiveTheme();
    this.applyTheme(effectiveTheme);
    
    // Update UI elements
    this.updateToggleButton();
    this.announceThemeChange(effectiveTheme);
    
    // Dispatch custom event for other components
    this.dispatchThemeChangeEvent(effectiveTheme);
  }
  
  /**
   * Update the theme toggle button state
   * @param {HTMLElement} button - The toggle button element
   */
  updateToggleButton(button = null) {
    const toggleButton = button || document.getElementById('theme-toggle');
    if (!toggleButton) return;
    
    const effectiveTheme = this.getEffectiveTheme();
    const isDark = effectiveTheme === this.THEMES.DARK;
    
    // Update ARIA label
    const label = isDark 
      ? 'Switch to light mode' 
      : 'Switch to dark mode';
    toggleButton.setAttribute('aria-label', label);
    toggleButton.title = label;
    
    // Update icon visibility
    const sunIcon = toggleButton.querySelector('.sun-icon');
    const moonIcon = toggleButton.querySelector('.moon-icon');
    
    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', isDark);
      moonIcon.classList.toggle('hidden', !isDark);
    }
    
    // Update pressed state for screen readers
    toggleButton.setAttribute('aria-pressed', isDark.toString());
  }
  
  /**
   * Announce theme change to screen readers
   * @param {string} theme - The new theme
   */
  announceThemeChange(theme) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Switched to ${theme} mode`;
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }
  
  /**
   * Dispatch a custom theme change event
   * @param {string} theme - The new effective theme
   */
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: theme,
        preference: this.currentTheme
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Watch for system preference changes
   */
  watchSystemPreference() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        this.systemPreference = e.matches ? this.THEMES.DARK : this.THEMES.LIGHT;
        
        // Only apply if user hasn't set a specific preference
        if (this.currentTheme === this.THEMES.SYSTEM) {
          this.applyTheme(this.systemPreference);
          this.updateToggleButton();
          this.announceThemeChange(this.systemPreference);
          this.dispatchThemeChangeEvent(this.systemPreference);
        }
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
    }
  }
  
  /**
   * Get the current effective theme
   * @returns {string} The current effective theme ('light' or 'dark')
   */
  getCurrentTheme() {
    return this.getEffectiveTheme();
  }
  
  /**
   * Get the current theme preference (may be 'system')
   * @returns {string} The current theme preference
   */
  getCurrentPreference() {
    return this.currentTheme;
  }
}

// Initialize theme switcher immediately to prevent flash
const themeSwitcher = new ThemeSwitcher();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.themeSwitcher = themeSwitcher;
}