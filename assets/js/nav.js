/**
 * Mobile Navigation - Simplified Implementation
 * Handles mobile menu toggle functionality with accessibility support
 */
document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      
      // Toggle expanded state
      menuButton.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle menu visibility
      mobileMenu.classList.toggle('hidden');
      
      // Toggle menu accessibility
      mobileMenu.setAttribute('aria-hidden', isExpanded);
      
      // Update button label
      menuButton.setAttribute('aria-label', isExpanded ? 'Open mobile menu' : 'Close mobile menu');
      
      // Toggle icons
      const menuIcon = menuButton.querySelector('.menu-icon');
      const closeIcon = menuButton.querySelector('.close-icon');
      
      if (menuIcon && closeIcon) {
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
      if (!menuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
        if (menuButton.getAttribute('aria-expanded') === 'true') {
          menuButton.click();
        }
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        menuButton.click();
      }
    });
  }
});