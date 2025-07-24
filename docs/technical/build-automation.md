# Build Automation and Deployment Workflow

This document describes the comprehensive build automation and deployment workflow for the Hugo Overreacted Blog template. The workflow supports both local development and CI/CD environments with automated testing, optimization, and deployment to Cloudflare Workers.

## Overview

The build automation system consists of:

- **GitHub Actions Workflow**: Automated CI/CD pipeline
- **Build Scripts**: Asset processing and optimization
- **Deployment Scripts**: Cloudflare Workers deployment
- **Testing Scripts**: Comprehensive validation and testing
- **Environment Configuration**: Support for development, staging, and production

## GitHub Actions Workflow

### Workflow File: `.github/workflows/deploy.yml`

The workflow is triggered by:
- Push to `main` branch (production deployment)
- Push to `develop` branch (staging deployment)
- Pull requests to `main` branch (build and test only)
- Manual dispatch with environment selection

### Jobs

#### 1. Build Job
- **Runs on**: All triggers
- **Purpose**: Build Hugo site with asset optimization
- **Steps**:
  - Checkout repository with full history
  - Setup Node.js (v20) with npm cache
  - Setup Go (v1.21) for Hugo
  - Setup Hugo (v0.148.1 extended)
  - Verify Hugo version requirements
  - Install Node.js dependencies
  - Build site (development or production)
  - Validate build output
  - Generate build artifacts

#### 2. Deploy to Staging
- **Runs on**: `develop` branch or manual dispatch (staging)
- **Purpose**: Deploy to staging environment
- **Environment**: `staging`
- **URL**: `https://hugo-overreacted-blog-staging.zjlgdx.workers.dev`
- **Steps**:
  - Download build artifacts
  - Deploy using Wrangler CLI
  - Test deployment accessibility
  - Update deployment status

#### 3. Deploy to Production
- **Runs on**: `main` branch or manual dispatch (production)
- **Purpose**: Deploy to production environment
- **Environment**: `production`
- **URL**: `https://hugo-overreacted-blog-prod.zjlgdx.workers.dev`
- **Steps**:
  - Download build artifacts
  - Deploy using Wrangler CLI
  - Test deployment accessibility
  - Run performance tests
  - Update deployment status

#### 4. Validate Deployment
- **Runs on**: After successful deployment
- **Purpose**: Comprehensive deployment validation
- **Steps**:
  - Run deployment tests
  - Generate test reports
  - Validate accessibility and performance

### Environment Variables

Required secrets in GitHub repository:
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers permissions
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

## Build Scripts

### 1. Asset Build Script: `scripts/build-assets.sh`

**Purpose**: Complete asset processing pipeline

**Features**:
- Environment detection (CI/CD support)
- Hugo version validation (minimum v0.148.1)
- Node.js dependency management
- Tailwind CSS compilation
- Syntax highlighting CSS generation
- Production optimizations (minification, compression)
- Build validation and statistics
- GitHub Actions integration

**Usage**:
```bash
# Development build
HUGO_ENV=development ./scripts/build-assets.sh

# Production build
HUGO_ENV=production ./scripts/build-assets.sh

# Validation only
./scripts/build-assets.sh --validate

# CI/CD build
CI=true GITHUB_ACTIONS=true ./scripts/build-assets.sh
```

**Environment Variables**:
- `HUGO_ENV`: `development` or `production`
- `NODE_ENV`: `development` or `production`
- `CI`: `true` for CI environments
- `GITHUB_ACTIONS`: `true` for GitHub Actions

### 2. Deployment Script: `scripts/deploy.sh`

**Purpose**: Deploy to Cloudflare Workers with comprehensive testing

**Features**:
- Environment validation (staging/production)
- Pre-deployment checks
- Cloudflare authentication verification
- Build verification and statistics
- Deployment with timing metrics
- Post-deployment testing
- Performance validation
- Security header checks

**Usage**:
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Dry run (validation only)
DRY_RUN=true ./scripts/deploy.sh staging

# CI/CD deployment
CI=true GITHUB_ACTIONS=true ./scripts/deploy.sh production
```

**Environment Variables**:
- `CLOUDFLARE_API_TOKEN`: Required for deployment
- `CLOUDFLARE_ACCOUNT_ID`: Required for deployment
- `DRY_RUN`: `true` for validation without deployment
- `CI`: `true` for CI environments

## Testing Scripts

### 1. System Validation: `scripts/test-system.sh`

**Purpose**: Comprehensive system and environment validation

**Tests**:
- System dependencies (Hugo, Node.js, npm, Git, Wrangler)
- Project structure validation
- Configuration file validation
- Node.js dependencies
- Build process validation
- Content structure
- Asset structure
- Template structure
- Development environment
- Deployment readiness

**Usage**:
```bash
# Run system validation
./scripts/test-system.sh

# Generate detailed report
./scripts/test-system.sh --report

# CI/CD validation
CI=true GITHUB_ACTIONS=true ./scripts/test-system.sh
```

### 2. Deployment Testing: `scripts/test-deployment.sh`

**Purpose**: Comprehensive deployed site testing

**Tests**:
- Basic connectivity
- HTTP status codes
- Content validation
- Asset loading (CSS/JS)
- Performance metrics
- SEO and meta tags
- Security headers
- Accessibility features
- Hugo-specific features
- Theme functionality
- Cloudflare Workers features

**Usage**:
```bash
# Test staging deployment
SITE_URL="https://hugo-overreacted-blog-staging.zjlgdx.workers.dev" ./scripts/test-deployment.sh

# Test production deployment
SITE_URL="https://hugo-overreacted-blog-prod.zjlgdx.workers.dev" ./scripts/test-deployment.sh

# Generate detailed report
./scripts/test-deployment.sh --report

# CI/CD testing
CI=true GITHUB_ACTIONS=true ./scripts/test-deployment.sh
```

## NPM Scripts

### Build Scripts
```bash
npm run build                 # Default build
npm run build:production      # Production build with optimizations
npm run build:development     # Development build
npm run build:ci             # CI-specific build
```

### Development Scripts
```bash
npm run dev                  # Start development server
npm run serve               # Start Hugo server
npm run clean               # Clean build artifacts
```

### Validation Scripts
```bash
npm run validate            # Validate build output
npm run optimize           # Build and validate for production
npm run test:system        # Run system validation
npm run test:deployment    # Test deployed site
```

### Deployment Scripts
```bash
npm run deploy             # Deploy to staging
npm run deploy:staging     # Deploy to staging
npm run deploy:production  # Deploy to production
npm run deploy:dry-run     # Dry run deployment
```

### CI/CD Scripts
```bash
npm run ci:build           # CI build
npm run ci:test            # CI testing
npm run ci:deploy          # CI deployment
```

### Utility Scripts
```bash
npm run version:check      # Check tool versions
npm run wrangler:whoami    # Check Wrangler authentication
```

## Configuration Files

### Hugo Configuration: `hugo.toml`

Key configurations for CI/CD:
- Hugo version requirements (minimum v0.148.1 extended)
- Build stats generation for Tailwind CSS
- Asset optimization settings
- Cache busting configuration
- Module mounts for asset processing

### Package Configuration: `package.json`

Key configurations:
- Node.js engine requirements (v18+)
- npm version requirements (v9+)
- Build and deployment scripts
- Dependencies for Tailwind CSS and Wrangler

### Wrangler Configuration: `wrangler.toml`

Key configurations:
- Static asset serving from `./public`
- Environment-specific settings
- Compatibility date for Workers runtime
- Custom 404 page handling
- Build command integration

## Environment Management

### Development Environment
- **Hugo Environment**: `development`
- **Features**: Draft content, future posts, faster builds
- **URL**: `http://localhost:1313`

### Staging Environment
- **Hugo Environment**: `development`
- **Cloudflare Environment**: `staging`
- **URL**: `https://hugo-overreacted-blog-staging.zjlgdx.workers.dev`
- **Purpose**: Testing and validation

### Production Environment
- **Hugo Environment**: `production`
- **Cloudflare Environment**: `production`
- **URL**: `https://hugo-overreacted-blog-prod.zjlgdx.workers.dev`
- **Features**: Full optimization, minification, compression

## Performance Optimizations

### Build-Time Optimizations
- Hugo asset minification and fingerprinting
- Tailwind CSS purging and optimization
- JavaScript compression with Terser
- HTML minification
- Integrity hash generation
- Gzip compression

### Runtime Optimizations
- Cloudflare Workers edge caching
- Static asset serving
- Automatic HTTPS
- Global CDN distribution

## Monitoring and Validation

### Build Monitoring
- Build time tracking
- Asset size monitoring
- Dependency validation
- Configuration validation

### Deployment Monitoring
- Deployment success/failure tracking
- Response time monitoring
- Asset loading validation
- Security header validation

### Performance Monitoring
- Page load time tracking
- Asset optimization validation
- Cache performance monitoring
- Error rate tracking

## Troubleshooting

### Common Issues

1. **Hugo Version Mismatch**
   - Ensure Hugo v0.148.1+ extended is installed
   - Check `hugo version` output

2. **Node.js Dependencies**
   - Run `npm ci` for clean installation
   - Verify Node.js v18+ is installed

3. **Wrangler Authentication**
   - Set `CLOUDFLARE_API_TOKEN` environment variable
   - Set `CLOUDFLARE_ACCOUNT_ID` environment variable
   - Run `wrangler whoami` to verify

4. **Build Failures**
   - Check Hugo configuration syntax
   - Verify all required files exist
   - Run `npm run test:system` for validation

5. **Deployment Failures**
   - Verify Cloudflare credentials
   - Check wrangler.toml configuration
   - Run `npm run deploy:dry-run` for validation

### Debug Commands

```bash
# Check system requirements
npm run version:check

# Validate system configuration
npm run test:system

# Test build process
npm run build:development

# Validate build output
npm run validate

# Test deployment (dry run)
npm run deploy:dry-run

# Test deployed site
npm run test:deployment
```

## Security Considerations

### Secrets Management
- Store sensitive credentials in GitHub Secrets
- Use environment variables for configuration
- Never commit API tokens or credentials

### Build Security
- Verify dependency integrity
- Use npm ci for reproducible builds
- Generate and verify asset integrity hashes

### Deployment Security
- Use least-privilege API tokens
- Enable security headers
- Validate deployment before going live

## Best Practices

### Development Workflow
1. Make changes locally
2. Test with `npm run dev`
3. Validate with `npm run test:system`
4. Build with `npm run build:development`
5. Commit and push to `develop` branch
6. Verify staging deployment
7. Merge to `main` for production

### CI/CD Best Practices
1. Use specific tool versions
2. Cache dependencies for faster builds
3. Run comprehensive tests
4. Generate build artifacts
5. Validate deployments
6. Monitor performance metrics

### Maintenance
1. Regularly update dependencies
2. Monitor build performance
3. Review deployment logs
4. Update Hugo and Node.js versions
5. Validate security configurations

This build automation and deployment workflow provides a robust, scalable, and maintainable solution for the Hugo Overreacted Blog template with comprehensive testing, optimization, and deployment capabilities.