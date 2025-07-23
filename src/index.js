/**
 * Cloudflare Worker for Hugo Overreacted Blog
 * Handles static asset serving with comprehensive security headers and custom routing
 * 
 * Security Headers Implementation:
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - Content-Security-Policy: Controls resource loading and prevents XSS
 * - Strict-Transport-Security: Enforces HTTPS connections
 * - Referrer-Policy: Controls referrer information leakage
 * - Permissions-Policy: Restricts browser features
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Comprehensive security headers based on OWASP recommendations and modern web standards
    const securityHeaders = {
      // X-Frame-Options: Prevents clickjacking attacks by denying iframe embedding
      'X-Frame-Options': 'DENY',
      
      // X-Content-Type-Options: Prevents MIME sniffing attacks
      'X-Content-Type-Options': 'nosniff',
      
      // Strict-Transport-Security: Enforces HTTPS for 1 year with subdomains
      // max-age=31536000 (1 year), includeSubDomains, preload for HSTS preload list
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Referrer-Policy: Controls referrer information sent to external sites
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions-Policy: Restricts access to browser features
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
      
      // X-XSS-Protection: Modern browsers ignore this, but kept for legacy support
      // Set to 0 as recommended by OWASP to avoid conflicts with CSP
      'X-XSS-Protection': '0',
      
      // Cross-Origin policies for enhanced security
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };

    // Headers to remove for security (information disclosure prevention)
    const blockedHeaders = [
      'Server',
      'X-Powered-By',
      'X-AspNet-Version',
      'X-AspNetMvc-Version',
      'Public-Key-Pins', // Deprecated and potentially dangerous
    ];

    // Enforce minimum TLS version (Cloudflare Workers automatically handle this)
    const tlsVersion = request.cf?.tlsVersion;
    if (tlsVersion && !['TLSv1.2', 'TLSv1.3'].includes(tlsVersion)) {
      return new Response('TLS version 1.2 or higher is required for security.', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
          ...securityHeaders,
        },
      });
    }

    try {
      // Try to serve static assets first
      const response = await env.ASSETS.fetch(request);
      
      // Clone response headers to make them mutable
      const newHeaders = new Headers(response.headers);
      
      // Add all security headers
      Object.entries(securityHeaders).forEach(([name, value]) => {
        newHeaders.set(name, value);
      });
      
      // Remove blocked headers that might leak information
      blockedHeaders.forEach(header => {
        newHeaders.delete(header);
      });

      // Content-Security-Policy: Tailored for Hugo blog with theme switching
      if (response.headers.get('content-type')?.includes('text/html')) {
        // CSP policy optimized for Hugo blog with JavaScript theme switching
        const cspPolicy = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // Allow inline scripts for theme switching
          "style-src 'self' 'unsafe-inline'", // Allow inline styles for Hugo and theme CSS
          "img-src 'self' data: https:", // Allow images from same origin, data URLs, and HTTPS
          "font-src 'self' data:", // Allow fonts from same origin and data URLs
          "connect-src 'self'", // Restrict AJAX/fetch to same origin
          "media-src 'self'", // Restrict media to same origin
          "object-src 'none'", // Block plugins like Flash
          "base-uri 'self'", // Prevent base tag injection
          "form-action 'self'", // Restrict form submissions to same origin
          "frame-ancestors 'none'", // Prevent framing (redundant with X-Frame-Options but more flexible)
          "upgrade-insecure-requests", // Automatically upgrade HTTP to HTTPS
        ].join('; ');
        
        newHeaders.set('Content-Security-Policy', cspPolicy);
      }

      // Create new response with security headers
      const secureResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });

      return secureResponse;
      
    } catch (error) {
      // If asset serving fails, return a secure error response
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          ...securityHeaders,
        },
      });
    }
  },
};