/**
 * Theme Switching - Simplified Implementation
 * Handles theme toggle with localStorage persistence
 */
document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('theme-toggle');

  if (toggleButton) {
    toggleButton.addEventListener('click', function () {
        // Toggle dark class and get current state
        const isDark = document.documentElement.classList.toggle('dark');
        
        // Save user preference to localStorage
        localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
        
        // Update data attribute and color-scheme
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
        
        // Update meta theme-color for mobile browsers
        const colors = { light: '#ffffff', dark: '#282c35' };
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.content = colors[isDark ? 'dark' : 'light'];
        }
        
        // Update syntax highlighting CSS
        const lightCSS = document.getElementById('chroma-light-css');
        const darkCSS = document.getElementById('chroma-dark-css');
        
        if (lightCSS && darkCSS) {
          if (isDark) {
            lightCSS.media = 'not all';
            darkCSS.media = 'all';
          } else {
            lightCSS.media = 'all';
            darkCSS.media = 'not all';
          }
        }
      });
  }
});