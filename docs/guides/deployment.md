# Cloudflare Workers Deployment Guide

This guide covers deploying the Hugo Overreacted Blog to Cloudflare Workers using our automated CI/CD pipeline and manual deployment options.

**Version**: 2.0  
**Date**: 2025-07-25  
**Status**: Updated for current project setup

## Overview

This project uses a sophisticated CI/CD pipeline with GitHub Actions to automatically deploy to Cloudflare Workers. The deployment process includes:

- **Automated builds** with Hugo and asset optimization
- **Environment-specific deployments** (staging/production)
- **Static asset serving** from Cloudflare Workers
- **Custom 404 handling** and HTTPS certificates
- **Comprehensive validation** and testing

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Domain (Optional)**: For custom domain deployment
3. **GitHub Repository**: Forked or cloned project repository
4. **Local Development**: Node.js v18+ and Hugo v0.148.1+ extended

## Setting Up CI/CD Deployment

### 1. Create Cloudflare API Token

The most critical step is creating a proper API token for GitHub Actions:

1. **Navigate to API Tokens**: Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)

2. **Use Template**: Click "Use template" for **"Edit Cloudflare Workers"**
   - This template provides the exact permissions needed for Workers deployment
   - It includes `Cloudflare Workers:Edit` and `Account:Read` permissions
   - Pre-configured for Workers management without additional setup

3. **Configure Token** (if using the template):
   ```
   Token Name: Hugo Blog Deployment
   
   Account Resources:
   - Include: [Your Account Name]
   
   Zone Resources (only if using custom domain):
   - Include: [Your Domain Zone]
   ```

   **Alternative: Custom Token** (if template not available):
   ```
   Permissions:
   - Cloudflare Workers:Edit
   - Account:Read
   - Zone:Read (only if using custom domain)
   ```

4. **Copy the Token**: Save the generated token immediately - you won't see it again

5. **Get Account ID**: 
   - Go to your Cloudflare dashboard
   - Select any domain or go to Workers & Pages
   - Copy the Account ID from the right sidebar

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. **Go to Repository Settings**: Navigate to Settings → Secrets and variables → Actions

2. **Add Repository Secrets**:
   - `CLOUDFLARE_API_TOKEN`: The API token created above
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

3. **Add Repository Variables** (in the Variables tab):
   - `STAGING_URL`: `hugo-overreacted-blog-staging.zjlgdx.workers.dev`
   - `PRODUCTION_URL`: `hugo-overreacted-blog-prod.zjlgdx.workers.dev` (or your custom domain)

### 3. Update Worker Names

Edit `wrangler.toml` to customize your worker names:

```toml
name = "your-blog-name"

[env.production]
name = "your-blog-name-prod"

[env.staging]
name = "your-blog-name-staging"
```

## Deployment Process

### Automatic Deployment (Recommended)

The CI/CD pipeline automatically deploys based on Git branches:

#### Staging Deployment
- **Trigger**: Push to `develop` branch
- **Environment**: Staging
- **URL**: `https://your-blog-name-staging.your-subdomain.workers.dev`
- **Build**: Development configuration with drafts

#### Production Deployment
- **Trigger**: Push to `main` branch
- **Environment**: Production  
- **URL**: `https://your-blog-name-prod.your-subdomain.workers.dev`
- **Build**: Production configuration with optimizations

#### Manual Deployment
- **Trigger**: GitHub Actions → Run workflow
- **Options**: Choose staging or production
- **Use Case**: Deploy specific commits or test changes

### Local Development

For local development and testing:

```bash
# Install dependencies
npm install

# Start Hugo development server
npm run dev

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Test local Wrangler development
npx wrangler dev
```

### Manual Deployment Commands

If you need to deploy manually (after setting up `wrangler` authentication):

```bash
# Authenticate with Cloudflare
npx wrangler login

# Deploy to staging
npm run deploy:staging

# Deploy to production  
npm run deploy:production

# Dry run (test without deploying)
npm run deploy:dry-run
```

## Environment Configuration

### Staging Environment
- **Purpose**: Pre-production testing and validation
- **Configuration**: Development Hugo settings with drafts enabled
- **URL**: Workers.dev subdomain
- **Assets**: Unminified for debugging

### Production Environment
- **Purpose**: Live production site
- **Configuration**: Production Hugo settings with full optimization
- **URL**: Custom domain or Workers.dev subdomain
- **Assets**: Minified, fingerprinted, and optimized

## Custom Domain Setup

### 1. Add Domain to Cloudflare

1. Add your domain to Cloudflare (if not already added)
2. Update nameservers to Cloudflare's nameservers
3. Wait for DNS propagation (usually 24-48 hours)

### 2. Configure Custom Domain

Edit `wrangler.toml` for production environment:

```toml
[env.production]
name = "your-blog-name-prod"
routes = [
  { pattern = "yourdomain.com/*", custom_domain = true },
  { pattern = "www.yourdomain.com/*", custom_domain = true }
]
```

### 3. Update Environment Variables

Update the `PRODUCTION_URL` variable in GitHub:
- Go to Settings → Secrets and variables → Actions → Variables
- Update `PRODUCTION_URL` to `https://yourdomain.com`

### 4. Deploy

Push to `main` branch or manually trigger the production deployment.

## Monitoring and Validation

### Deployment Status

Monitor deployments through:
1. **GitHub Actions**: Check workflow status and logs
2. **Cloudflare Dashboard**: View deployment history and analytics
3. **Automatic Validation**: Built-in testing after each deployment

### Health Checks

The deployment includes automatic validation:
- **Connectivity**: Verify site accessibility
- **Content**: Check page rendering and assets
- **Performance**: Validate response times
- **Security**: Verify HTTPS and security headers

### Analytics

Access analytics through Cloudflare Dashboard:
- Request metrics and response codes  
- Performance data and caching statistics
- Error tracking and debugging information

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```
Error: Authentication error
```
**Solution**: Verify API token permissions and account ID

#### 2. Build Failures
```
Error: Command failed with exit code 1
```
**Solution**: Check Hugo version and Node.js dependencies:
```bash
npm run test:system  # Validate system requirements
npm run build:dev    # Test local build
```

#### 3. Domain Configuration Issues
- Verify domain is active in Cloudflare
- Check DNS settings and SSL/TLS configuration
- Ensure custom domain routes are properly configured

#### 4. Worker Name Conflicts
```
Error: Worker name already exists
```
**Solution**: Update worker names in `wrangler.toml` to be unique

### Debug Commands

```bash
# Check Wrangler authentication
npx wrangler whoami

# View deployment logs
npx wrangler tail --env production

# Test local build
npm run build:dev && npm run validate:build

# Check system requirements
npm run test:system
```

## Security Considerations

### API Token Security
- Use minimal required permissions
- Regularly rotate API tokens
- Never commit tokens to repository
- Use GitHub secrets for token storage

### Deployment Security
- Enable security headers (configured automatically)
- Use HTTPS only (enforced by Cloudflare)
- Validate deployments before going live
- Monitor for unauthorized changes

## Best Practices

### Development Workflow
1. **Develop locally**: Use `npm run dev` for development
2. **Test builds**: Validate with `npm run build:dev`
3. **Deploy to staging**: Push to `develop` branch
4. **Validate staging**: Test functionality and performance
5. **Deploy to production**: Merge to `main` branch
6. **Monitor production**: Check analytics and error rates

### Performance Optimization
- Assets are automatically optimized in production builds
- Use Cloudflare's global CDN for edge caching
- Monitor Core Web Vitals through Cloudflare Analytics
- Implement caching strategies for dynamic content

## Support and Resources

### Documentation
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/fundamentals/api/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Getting Help
- [Cloudflare Community Forum](https://community.cloudflare.com/)
- [GitHub Issues](https://github.com/YYvanYang/hugo-overreacted-blog/issues)
- [Hugo Community](https://discourse.gohugo.io/)

---

**Last Updated**: 2025-07-25  
**Maintained By**: Project Contributors