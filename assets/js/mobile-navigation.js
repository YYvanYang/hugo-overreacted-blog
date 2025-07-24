/**
 * Mobile Navigation System
 * Implements responsive mobile navigation with proper accessibility support
 * 
 * Features:
 * - Mobile menu toggle functionality
 * - Icon switching (hamburger to close)
 * - Outside-click closing
 * - Escape key handling
 * - Proper ARIA attributes
 * - Error handling for missing DOM elements
 * - Keyboard navigation support
 */

class MobileNavigation {
  constructor() {
    this.toggle = null;
    this.menu = null;
    this.menuIcon = null;
    this.closeIcon = null;
    this.isOpen = false;
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 10;
    
    // Bind methods to preserve 'this' context
    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleToggleKeydown = this.handleToggleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
    
    this.init();
  }
  
  /**
   * Initialize the mobile navigation system
   */
  init() {
    console.log('Mobile Navigation: Initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      console.log('Mobile Navigation: DOM still loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', () => this.setupElements());
    } else {
      console.log('Mobile Navigation: DOM ready, setting up elements...');
      this.setupElements();
    }
  }
  
  /**
   * Set up DOM elements and event listeners
   */
  setupElements() {
    try {
      console.log(`Mobile Navigation: Setup attempt ${this.retryCount + 1}/${this.maxRetries}`);
      console.log('Mobile Navigation: Document ready state:', document.readyState);
      console.log('Mobile Navigation: DOM body exists:', !!document.body);
      
      // Get DOM elements
      this.toggle = document.getElementById('mobile-menu-toggle');
      this.menu = document.getElementById('mobile-menu');
      
      console.log('Mobile Navigation: Found elements:', {
        toggle: !!this.toggle,
        menu: !!this.menu
      });
      
      // If elements not found and we haven't exceeded retry limit, retry
      if ((!this.toggle || !this.menu) && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Mobile Navigation: Elements not found, retrying in 100ms (attempt ${this.retryCount}/${this.maxRetries})`);
        
        // Debug: List all IDs in the document
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        console.log('Mobile Navigation: Available element IDs:', allIds);
        
        setTimeout(() => this.setupElements(), 100);
        return;
      }
      
      // If still not found after retries, log error and continue with what we have
      if (!this.toggle) {
        console.error('Mobile Navigation: Toggle button not found after retries (#mobile-menu-toggle)');
        return;
      }
      
      if (!this.menu) {
        console.error('Mobile Navigation: Menu element not found after retries (#mobile-menu)');
        return;
      }
      
      // Get icon elements
      this.menuIcon = this.toggle.querySelector('.menu-icon');
      this.closeIcon = this.toggle.querySelector('.close-icon');
      
      console.log('Mobile Navigation: Found icons:', {
        menuIcon: !!this.menuIcon,
        closeIcon: !!this.closeIcon
      });
      
      if (!this.menuIcon || !this.closeIcon) {
        console.warn('Mobile Navigation: Menu icons not found (.menu-icon, .close-icon)');
      }
      
      // Set initial state based on current attributes
      this.isOpen = this.toggle.getAttribute('aria-expanded') === 'true';
      console.log('Mobile Navigation: Initial state - isOpen:', this.isOpen);
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Ensure proper initial state
      this.updateMenuState(this.isOpen, false);
      
      this.isInitialized = true;
      console.log('Mobile Navigation: Successfully initialized');
      
    } catch (error) {
      console.error('Mobile Navigation: Failed to initialize', error);
    }
  }
  
  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    if (!this.toggle || !this.menu) {
      console.warn('Mobile Navigation: Cannot attach listeners - missing elements');
      return;
    }
    
    console.log('Mobile Navigation: Attaching event listeners...');
    
    // Remove any existing listeners to prevent duplicates
    this.removeEventListeners();
    
    try {
      // Toggle button click handler
      this.toggle.addEventListener('click', this.handleToggleClick, { passive: false });
      console.log('Mobile Navigation: Click listener attached to toggle');
      
      // Toggle button keyboard handler
      this.toggle.addEventListener('keydown', this.handleToggleKeydown, { passive: false });
      console.log('Mobile Navigation: Keydown listener attached to toggle');
      
      // Outside click handler
      document.addEventListener('click', this.handleOutsideClick, { passive: true });
      console.log('Mobile Navigation: Outside click listener attached');
      
      // Escape key handler
      document.addEventListener('keydown', this.handleEscapeKey, { passive: false });
      console.log('Mobile Navigation: Escape key listener attached');
      
      // Window resize handler to close menu on desktop
      window.addEventListener('resize', this.handleWindowResize, { passive: true });
      console.log('Mobile Navigation: Resize listener attached');
      
      // Focus trap for accessibility
      this.menu.addEventListener('keydown', this.handleTabNavigation, { passive: false });
      console.log('Mobile Navigation: Tab navigation listener attached');
      
      console.log('Mobile Navigation: All event listeners attached successfully');
      
    } catch (error) {
      console.error('Mobile Navigation: Error attaching event listeners:', error);
    }
  }
  
  /**
   * Remove event listeners to prevent memory leaks
   */
  removeEventListeners() {
    if (this.toggle) {
      this.toggle.removeEventListener('click', this.handleToggleClick);
      this.toggle.removeEventListener('keydown', this.handleToggleKeydown);
    }
    
    if (this.menu) {
      this.menu.removeEventListener('keydown', this.handleTabNavigation);
    }
    
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);
    window.removeEventListener('resize', this.handleWindowResize);
  }
  
  /**
   * Handle toggle button click
   */
  handleToggleClick(e) {
    console.log('Mobile Navigation: Toggle button clicked', e);
    
    try {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Mobile Navigation: Event prevented, calling toggleMenu');
      this.toggleMenu();
      
    } catch (error) {
      console.error('Mobile Navigation: Error in handleToggleClick:', error);
    }
  }
  
  /**
   * Handle toggle button keyboard events
   */
  handleToggleKeydown(e) {
    console.log('Mobile Navigation: Toggle keydown:', e.key);
    
    if (e.key === 'Enter' || e.key === ' ') {
      try {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Mobile Navigation: Keyboard event prevented, calling toggleMenu');
        this.toggleMenu();
        
      } catch (error) {
        console.error('Mobile Navigation: Error in handleToggleKeydown:', error);
      }
    }
  }
  
  /**
   * Toggle the mobile menu open/closed
   */
  toggleMenu() {
    console.log('Mobile Navigation: toggleMenu called');
    
    if (!this.isInitialized) {
      console.warn('Mobile Navigation: Not initialized, cannot toggle menu');
      return;
    }
    
    if (!this.toggle || !this.menu) {
      console.error('Mobile Navigation: Missing elements, cannot toggle menu');
      return;
    }
    
    console.log('Mobile Navigation: Toggling menu from', this.isOpen, 'to', !this.isOpen);
    
    try {
      this.isOpen = !this.isOpen;
      this.updateMenuState(this.isOpen, true);
      
      console.log('Mobile Navigation: Menu toggled successfully to', this.isOpen);
      
      // Announce to screen readers
      if (window.accessibilityManager && window.accessibilityManager.announceToScreenReader) {
        const message = this.isOpen ? 'Mobile menu opened' : 'Mobile menu closed';
        window.accessibilityManager.announceToScreenReader(message);
      }
      
    } catch (error) {
      console.error('Mobile Navigation: Error in toggleMenu:', error);
    }
  }
  
  /**
   * Open the mobile menu
   */
  openMenu() {
    if (!this.isOpen) {
      this.toggleMenu();
    }
  }
  
  /**
   * Close the mobile menu
   */
  closeMenu() {
    if (this.isOpen) {
      this.toggleMenu();
    }
  }
  
  /**
   * Update the menu state and UI
   * @param {boolean} isOpen - Whether the menu should be open
   * @param {boolean} shouldFocus - Whether to manage focus
   */
  updateMenuState(isOpen, shouldFocus = false) {
    console.log('Mobile Navigation: updateMenuState called with isOpen:', isOpen, 'shouldFocus:', shouldFocus);
    
    if (!this.toggle || !this.menu) {
      console.error('Mobile Navigation: Cannot update state - missing elements');
      return;
    }
    
    try {
      this.isOpen = isOpen;
      
      // Update menu visibility
      console.log('Mobile Navigation: Updating menu visibility...');
      if (isOpen) {
        this.menu.classList.remove('hidden');
        this.menu.setAttribute('aria-hidden', 'false');
        console.log('Mobile Navigation: Menu shown');
      } else {
        this.menu.classList.add('hidden');
        this.menu.setAttribute('aria-hidden', 'true');
        console.log('Mobile Navigation: Menu hidden');
      }
      
      // Update toggle button state
      console.log('Mobile Navigation: Updating toggle button state...');
      this.toggle.setAttribute('aria-expanded', isOpen.toString());
      this.toggle.setAttribute('aria-label', isOpen ? 'Close mobile menu' : 'Open mobile menu');
      
      // Update icons
      if (this.menuIcon && this.closeIcon) {
        console.log('Mobile Navigation: Updating icons...');
        if (isOpen) {
          this.menuIcon.classList.add('hidden');
          this.closeIcon.classList.remove('hidden');
          console.log('Mobile Navigation: Showing close icon');
        } else {
          this.menuIcon.classList.remove('hidden');
          this.closeIcon.classList.add('hidden');
          console.log('Mobile Navigation: Showing menu icon');
        }
      } else {
        console.warn('Mobile Navigation: Icons not found, cannot update');
      }
      
      // Focus management
      if (shouldFocus) {
        console.log('Mobile Navigation: Managing focus...');
        if (isOpen) {
          // Focus first menu item when opening
          const firstMenuItem = this.menu.querySelector('a, button');
          if (firstMenuItem) {
            setTimeout(() => {
              firstMenuItem.focus();
              console.log('Mobile Navigation: Focused first menu item');
            }, 100);
          }
        } else {
          // Return focus to toggle button when closing
          this.toggle.focus();
          console.log('Mobile Navigation: Returned focus to toggle');
        }
      }
      
      // Add/remove body scroll lock for mobile
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        console.log('Mobile Navigation: Body scroll locked');
      } else {
        document.body.style.overflow = '';
        console.log('Mobile Navigation: Body scroll unlocked');
      }
      
      console.log('Mobile Navigation: State updated successfully');
      
    } catch (error) {
      console.error('Mobile Navigation: Error updating menu state:', error);
    }
  }
  
  /**
   * Handle clicks outside the mobile menu
   * @param {Event} event - The click event
   */
  handleOutsideClick(event) {
    console.log('Mobile Navigation: Outside click detected', event.target);
    
    if (!this.isOpen) {
      console.log('Mobile Navigation: Menu not open, ignoring outside click');
      return;
    }
    
    if (!this.toggle || !this.menu) {
      console.log('Mobile Navigation: Missing elements, cannot handle outside click');
      return;
    }
    
    // Check if click is outside both toggle and menu
    const isClickInsideToggle = this.toggle.contains(event.target);
    const isClickInsideMenu = this.menu.contains(event.target);
    
    console.log('Mobile Navigation: Outside click analysis:', {
      isClickInsideToggle,
      isClickInsideMenu,
      target: event.target.tagName + (event.target.id ? '#' + event.target.id : '') + (event.target.className ? '.' + event.target.className : '')
    });
    
    if (!isClickInsideToggle && !isClickInsideMenu) {
      console.log('Mobile Navigation: Click is outside, closing menu');
      this.closeMenu();
    } else {
      console.log('Mobile Navigation: Click is inside, keeping menu open');
    }
  }
  
  /**
   * Handle escape key press
   */
  handleEscapeKey(event) {
    console.log('Mobile Navigation: Key pressed:', event.key);
    
    if (event.key === 'Escape') {
      if (this.isOpen) {
        console.log('Mobile Navigation: Escape pressed, closing menu');
        this.closeMenu();
      } else {
        console.log('Mobile Navigation: Escape pressed but menu not open');
      }
    }
  }
  
  /**
   * Handle window resize events
   */
  handleWindowResize() {
    // Close mobile menu when switching to desktop view
    if (window.innerWidth > 768 && this.isOpen) {
      this.updateMenuState(false, false);
    }
  }
  
  /**
   * Handle tab navigation within the mobile menu for focus trapping
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleTabNavigation(event) {
    if (!this.isOpen) return;
    
    const focusableElements = this.menu.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  /**
   * Get the current state of the mobile menu
   * @returns {Object} Current state information
   */
  getState() {
    return {
      isOpen: this.isOpen,
      isInitialized: this.isInitialized,
      hasToggle: !!this.toggle,
      hasMenu: !!this.menu,
      hasIcons: !!(this.menuIcon && this.closeIcon)
    };
  }
  
  /**
   * Destroy the mobile navigation instance
   */
  destroy() {
    if (this.toggle) {
      this.toggle.removeEventListener('click', this.toggleMenu);
      this.toggle.removeEventListener('keydown', this.handleKeydown);
    }
    
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);
    window.removeEventListener('resize', this.handleWindowResize);
    
    // Reset body scroll
    document.body.style.overflow = '';
    
    this.isInitialized = false;
    console.log('Mobile Navigation: Destroyed');
  }
}

// Initialize mobile navigation
let mobileNavigation;

// Initialize when DOM is ready
function initializeMobileNavigation() {
  console.log('Mobile Navigation: initializeMobileNavigation called');
  console.log('Mobile Navigation: Document ready state:', document.readyState);
  
  try {
    // Prevent multiple initialization
    if (mobileNavigation) {
      console.log('Mobile Navigation: Already initialized, skipping');
      return;
    }
    
    console.log('Mobile Navigation: Creating new MobileNavigation instance');
    mobileNavigation = new MobileNavigation();
    
    // Export for use in other scripts and debugging
    if (typeof window !== 'undefined') {
      window.mobileNavigation = mobileNavigation;
      console.log('Mobile Navigation: Exported to window.mobileNavigation');
    }
    
    console.log('Mobile Navigation: Initialization complete');
    
  } catch (error) {
    console.error('Mobile Navigation: Failed to initialize:', error);
  }
}

// Multiple initialization strategies to ensure it works
console.log('Mobile Navigation: Setting up initialization...');

if (document.readyState === 'loading') {
  console.log('Mobile Navigation: DOM loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', initializeMobileNavigation);
} else {
  console.log('Mobile Navigation: DOM ready, initializing immediately');
  initializeMobileNavigation();
}

// Fallback initialization after a delay
setTimeout(() => {
  if (!mobileNavigation) {
    console.log('Mobile Navigation: Fallback initialization after 1 second');
    initializeMobileNavigation();
  }
}, 1000);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileNavigation;
}