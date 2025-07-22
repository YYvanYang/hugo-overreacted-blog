# Cloudflare Workers Deployment Guide

This guide covers deploying the Hugo Overreacted Blog to Cloudflare Workers with static asset serving, custom 404 handling, and HTTPS certificate support.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Domain (Optional)**: For custom domain deployment
3. **Node.js**: Version 18+ required
4. **Hugo**: Extended version 0.128.0+ required

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Deploy to Staging

```bash
npm run deploy:staging
```

Your site will be available at: `https://hugo-overreacted-blog-staging.workers.dev`

## Deployment Environments

### Development
- **Command**: `npm run deploy`
- **URL**: `https://hugo-overreacted-blog.workers.dev`
- **Use**: Local testing and development

### Staging
- **Command**: `npm run deploy:staging`
- **URL**: `https://hugo-overreacted-blog-staging.workers.dev`
- **Use**: Pre-production testing

### Production
- **Command**: `npm run deploy:production`
- **URL**: Your custom domain (requires configuration)
- **Use**: Live production site

## Custom Domain Setup

### 1. Add Domain to Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers to Cloudflare's
3. Wait for DNS propagation

### 2. Configure Custom Domain in wrangler.toml

Edit `wrangler.toml` and uncomment the routes section:

```toml
[env.production]
name = "hugo-overreacted-blog-prod"
routes = [
  { pattern = "yourdomain.com/*", custom_domain = true }
]
```

Replace `yourdomain.com` with your actual domain.

### 3. Deploy to Production

```bash
npm run deploy:production
```

## HTTPS Certificate Support

Cloudflare Workers automatically provides HTTPS certificates for:

- **Workers.dev subdomains**: Automatic SSL/TLS
- **Custom domains**: Automatic SSL/TLS with Universal SSL
- **Advanced certificates**: Available through Cloudflare dashboard

### Certificate Features

- **Automatic renewal**: Certificates auto-renew before expiration
- **Modern TLS**: TLS 1.2+ support with modern cipher suites
- **HTTP/2 & HTTP/3**: Automatic protocol upgrades
- **HSTS**: HTTP Strict Transport Security headers

## 404 Error Handling

The deployment includes a custom 404 page with:

- **Responsive design**: Works on all device sizes
- **Theme support**: Matches light/dark theme preferences
- **SEO friendly**: Proper HTTP 404 status codes
- **User-friendly**: Clear messaging and navigation back to home

### 404 Configuration

The `wrangler.toml` includes:

```toml
[assets]
not_found_handling = "404-page"
```

This serves `/public/404.html` for unmatched routes with proper 404 status.

## Build Process

### Automatic Build

The deployment script automatically:

1. Cleans previous builds
2. Runs Hugo with minification
3. Optimizes assets
4. Deploys to Cloudflare Workers

### Manual Build

```bash
# Build only
hugo --minify

# Build and deploy
npm run deploy
```

## Environment Variables

Configure different environments in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "development"

[env.production.vars]
ENVIRONMENT = "production"

[env.staging.vars]
ENVIRONMENT = "staging"
```

## Monitoring and Analytics

### Cloudflare Analytics

Access analytics through:
1. Cloudflare Dashboard
2. Workers Analytics tab
3. Real-time and historical data

### Available Metrics

- **Requests**: Total requests and status codes
- **Bandwidth**: Data transfer statistics
- **Performance**: Response times and cache hit rates
- **Errors**: Error rates and debugging information

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean and rebuild
   npm run clean
   npm run build
   ```

2. **Authentication Issues**
   ```bash
   # Re-authenticate
   npx wrangler logout
   npx wrangler login
   ```

3. **Domain Configuration**
   - Verify DNS settings in Cloudflare dashboard
   - Check SSL/TLS encryption mode (Full or Full Strict)
   - Ensure domain is active in Cloudflare

4. **Hugo Build Command Issues in CI/CD**
   
   **Problem**: When using GitHub Actions with wrangler-action, you may encounter the error:
   ```
   [custom build] /bin/sh: 1: hugo: not found
   ✘ [ERROR] Error: Command failed with exit code 127: hugo --minify --gc
   ```
   
   **Root Cause**: The `--no-bundle` flag only skips Wrangler's internal bundling process but does NOT skip custom build commands defined in the `[build]` section of `wrangler.toml`.
   
   **Solution**: Use `preCommands` in wrangler-action to temporarily disable the build section during CI deployment:
   
   ```yaml
   - name: Deploy to Cloudflare Workers
     uses: cloudflare/wrangler-action@v3
     with:
       apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
       accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
       wranglerVersion: "latest"
       preCommands: |
         # Temporarily disable build section for CI deployment
         sed -i 's/^\[build\]$/# [build]/' wrangler.toml
         sed -i 's/^command = /# command = /' wrangler.toml
         sed -i 's/^cwd = /# cwd = /' wrangler.toml
         sed -i 's/^watch_dir = /# watch_dir = /' wrangler.toml
       command: deploy --env staging
       workingDirectory: "."
   ```
   
   **Why This Works**:
   - Hugo build is already handled by GitHub Actions in earlier steps
   - `preCommands` runs before deployment and temporarily comments out the build configuration
   - Original `wrangler.toml` remains unchanged for local development
   - `wrangler dev` continues to work normally for local development
   
   **Key Wrangler Flags Explained**:
   - `--no-bundle`: Skips Wrangler's internal bundling (esbuild) but NOT custom build commands
   - `--env <name>`: Specifies deployment environment (staging/production)
   - Custom build commands in `[build]` section always execute unless the section is disabled

### Debug Commands

```bash
# Test local development
npm run wrangler:dev

# View deployment logs
npx wrangler tail

# Check configuration
npx wrangler whoami
```

## Performance Optimization

### Asset Optimization

- **Minification**: HTML, CSS, and JS minified
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Aggressive caching with cache busting
- **CDN**: Global edge distribution

### Best Practices

1. **Image optimization**: Use WebP format when possible
2. **Asset fingerprinting**: Enabled for cache busting
3. **HTTP/2 Push**: Automatic for critical resources
4. **Edge caching**: Static assets cached at edge locations

## Security Features

### Automatic Security

- **DDoS protection**: Built-in DDoS mitigation
- **SSL/TLS**: Automatic HTTPS with modern protocols
- **Security headers**: CSP, HSTS, and other security headers
- **Bot protection**: Cloudflare's bot management

### Additional Security

Configure additional security in Cloudflare dashboard:
- Web Application Firewall (WAF)
- Rate limiting
- IP access rules
- Security level settings

## Cost Considerations

### Workers Pricing

- **Free tier**: 100,000 requests/day
- **Paid tier**: $5/month for 10M requests
- **Additional requests**: $0.50 per million

### Bandwidth

- **Free**: Unlimited bandwidth for Workers
- **Custom domains**: May incur bandwidth charges based on plan

## Support and Resources

### Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hugo Documentation](https://gohugo.io/documentation/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

### Community

- [Cloudflare Community](https://community.cloudflare.com/)
- [Hugo Community](https://discourse.gohugo.io/)
- [GitHub Issues](https://github.com/username/hugo-overreacted-blog/issues)

## Next Steps

1. **Configure custom domain** for production deployment
2. **Set up CI/CD** for automated deployments
3. **Configure analytics** and monitoring
4. **Optimize performance** based on usage patterns
5. **Set up backup** and disaster recovery procedures