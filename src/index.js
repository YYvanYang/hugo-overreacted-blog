/**
 * Cloudflare Worker for Hugo Overreacted Blog
 * Handles static asset serving with security headers and custom routing
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Add security headers to all responses
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };

    try {
      // Try to serve static assets first
      const response = await env.ASSETS.fetch(request);
      
      // Add security headers to the response
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          ...securityHeaders,
        },
      });

      // Add CSP header for HTML pages
      if (response.headers.get('content-type')?.includes('text/html')) {
        newResponse.headers.set(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
        );
      }

      return newResponse;
    } catch (error) {
      // If asset serving fails, return a basic error response
      return new Response('Internal Server Error', {
        status: 500,
        headers: securityHeaders,
      });
    }
  },
};