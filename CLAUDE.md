# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo Overreacted Blog - a minimalist blog template inspired by overreacted.io, built with Hugo static site generator, Tailwind CSS v4.1, and deployed on Cloudflare Workers. The project features a sophisticated build pipeline with asset optimization, dual-theme support, and comprehensive CI/CD automation.

## Essential Commands

### Development Commands
- `npm run dev` - Start Hugo development server with drafts and future posts
- `npm run serve` - Start basic Hugo server  
- `npm run build:dev` - Build for development with source maps
- `npm run build:prod` - Build for production with full optimization
- `npm run build` - Alias for production build
- `npm run clean` - Clean all build artifacts and cache

### Testing and Validation
- `npm run test:system` - Validate system requirements and project structure
- `npm run test:deployment` - Test deployed site (connectivity, performance, SEO)
- `npm run test:all` - Run all tests (system + deployment)
- `npm run test` - Alias for system testing
- `npm run validate:build` - Validate build output and critical files
- `npm run version:check` - Check tool versions (Hugo, Node.js, npm)

### Deployment Commands
- `npm run deploy:staging` - Deploy to Cloudflare Workers staging
- `npm run deploy:production` - Deploy to Cloudflare Workers production
- `npm run deploy:dry-run` - Test deployment configuration without deploying
- `npm run deploy` - Alias for staging deployment

### CI/CD Integration Commands
- `npm run ci:build` - CI-specific production build
- `npm run ci:test` - CI-specific deployment testing
- `npm run ci:deploy:staging` - CI-specific staging deployment
- `npm run ci:deploy:prod` - CI-specific production deployment

### Wrangler Commands
- `wrangler dev --env staging` - Start local Cloudflare Workers development
- `wrangler deploy --env staging` - Deploy to staging environment
- `wrangler deploy --env production` - Deploy to production environment

## Build System Architecture

### Asset Processing Pipeline
The build system uses a custom script `scripts/build-assets.sh` that orchestrates:

1. **Hugo Build**: Static site generation with enhanced configuration
2. **Tailwind CSS Processing**: CSS optimization with Tailwind v4.1 CSS-first approach
3. **JavaScript Processing**: Minification with Terser
4. **Asset Optimization**: Fingerprinting, integrity hashes, compression

### Environment-Specific Builds
- **Development**: Source maps enabled, no minification, debug output
- **Production**: Full optimization, minification, asset fingerprinting
- **CI**: Automated builds with validation and testing

### Wrangler Configuration Strategy
The project uses a sophisticated Wrangler setup to handle different environments:

- **Top-level `[build]`**: Used for local development only
- **`[env.staging.build]` & `[env.production.build]`**: Empty sections to prevent build inheritance
- **CI/CD Strategy**: GitHub Actions builds static files, Wrangler deploys pre-built artifacts

This prevents "Hugo not installed" errors in CI while maintaining local development functionality.

## Content Architecture

### Content Structure
- `content/posts/` - Blog posts with frontmatter (title, date, draft, tags, categories, description)
- `content/` - Static pages (about.md, etc.)
- `content/_index.md` - Homepage content

### Layout System
- `layouts/baseof.html` - Base template with essential HTML structure
- `layouts/home.html` - Homepage template
- `layouts/page.html` - Single page template
- `layouts/section.html` - Section list template
- `layouts/robots.txt` - Dynamic robots.txt template with environment-aware sitemap URLs
- `layouts/_partials/` - Reusable components (head, header, footer, SEO)
- `layouts/_markup/` - Markdown render hooks for enhanced content processing

### Theme and Styling
- `assets/css/main.css` - Main stylesheet with Tailwind CSS v4.1 `@theme` configuration
- `assets/css/chroma-light.css` & `assets/css/chroma-dark.css` - Syntax highlighting themes
- `assets/js/theme-switcher.js` - Theme switching with no-flash loading
- `assets/js/accessibility.js` - Accessibility enhancements

## Configuration Files

### Hugo Configuration (`hugo.toml`)
Key features:
- Hugo v0.148.1+ extended required
- `enableRobotsTXT = true` for dynamic robots.txt generation
- Goldmark renderer with typographer extensions
- Comprehensive cache busters for asset processing
- Module mounts including `hugo_stats.json` for Tailwind
- Security settings allowing specific external commands
- Menu configuration with nested structure support

### Package Configuration (`package.json`)
- Node.js v18+ and npm v9+ required
- **Reorganized NPM Scripts**: Logical grouping with comment separators for better organization
  - `//-- BUILD TASKS --//`: build:assets, build:dev, build:prod, build
  - `//-- DEVELOPMENT --//`: dev, serve, clean
  - `//-- VALIDATION & TESTING --//`: validate:build, test:system, test:deployment, test:all, test
  - `//-- DEPLOYMENT --//`: deploy:staging, deploy:production, deploy:dry-run, deploy
  - `//-- CI/CD INTEGRATION --//`: ci:build, ci:test, ci:deploy:staging, ci:deploy:prod
  - `//-- UTILITIES --//`: version:check
- Key dependencies: Tailwind CSS v4.1, PostCSS, Terser, Wrangler

### Wrangler Configuration (`wrangler.toml`)
- Static asset serving from `public/` directory
- Environment-specific configurations without build inheritance
- Variables for different deployment environments
- Custom 404 page handling and HTTPS configuration

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)
Multi-job pipeline:
1. **Build Job**: Installs Hugo, Node.js dependencies, builds static files
2. **Deploy Staging**: Deploys to staging on `develop` branch
3. **Deploy Production**: Deploys to production on `main` branch  
4. **Validation**: Comprehensive testing of deployed sites

### Required Secrets
- `CLOUDFLARE_API_TOKEN` - Cloudflare API authentication
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier

### Required Variables
- `STAGING_URL` - Staging environment URL (e.g., `https://hugo-overreacted-blog-staging.zjlgdx.workers.dev`)
- `PRODUCTION_URL` - Production environment URL (e.g., `https://hugo-overreacted-blog-prod.zjlgdx.workers.dev`)

**Note**: Set these variables in GitHub repository Settings → Secrets and variables → Actions → Variables tab.

## Development Patterns

### Creating New Content
```bash
hugo new posts/my-new-post.md
```

### Theme Customization
- Modify `@theme` directive in `assets/css/main.css` for colors
- Edit templates in `layouts/` for structural changes
- Use Tailwind utility classes following the project's CSS-first approach

### Asset Processing
- CSS files automatically processed through Tailwind and PostCSS
- JavaScript files minified in production builds
- Images served from `static/images/` with lazy loading support

### Testing Strategy
- System validation before builds
- Build output validation after builds  
- Comprehensive deployment testing including performance, SEO, and accessibility
- Local testing with `npm run dev` before deployment

## Performance Considerations

- Asset fingerprinting and cache busting for optimal caching
- Minification and compression in production builds
- Lazy loading for images and non-critical assets
- CDN distribution via Cloudflare Workers global network
- Integrity hashes for security and cache validation

## Common Issues and Solutions

### Build Failures
1. Run `npm run test:system` to validate requirements
2. Check Hugo version (must be v0.148.1+ extended)
3. Clean build artifacts: `npm run clean`
4. Rebuild: `npm run build:dev` (development) or `npm run build:prod` (production)

### TailwindCSS CLI Issues
**Problem**: `binary with name "tailwindcss" not found using npx`
**Root Cause**: Incorrect package installation location - TailwindCSS packages were installed in `devDependencies`

**Critical Learning**: 
- When facing complex technical issues, **always check official documentation first**
- Simple solutions are often correct - avoid complex workarounds until root cause is found
- Package placement (`dependencies` vs `devDependencies`) matters significantly in production builds

**Incorrect Installation** (causes production build failures):
```bash
npm install -D tailwindcss @tailwindcss/cli  # ❌ Wrong - devDependencies
```

**Correct Installation** (per https://tailwindcss.com/docs/installation/tailwind-cli):
```bash
npm install tailwindcss @tailwindcss/cli     # ✅ Correct - dependencies
```

**Why This Matters**:
- Hugo's `css.TailwindCSS` function with `minify: true` requires TailwindCSS CLI in production builds
- `NODE_ENV=production` causes npm to skip `devDependencies` installation in CI environments
- Development builds work (`minify: false`) but production builds fail (`minify: true`)

**Key Lesson**: Before implementing complex workarounds, verify that packages are installed in the correct location according to official documentation. Many "complex" problems have simple solutions that are documented in official guides.

### Deployment Issues  
1. Verify Wrangler authentication: `wrangler whoami`
2. Test deployment configuration: `npm run deploy:dry-run`
3. Check Cloudflare Workers logs for runtime errors

### Development Environment
- Ensure Hugo extended version is installed
- Node.js v18+ and npm v9+ required
- Run `npm install` to install all dependencies
- Use `npm run version:check` to verify tool versions

### GitHub Actions Reusable Workflow Issues
**Problem**: `Unrecognized named-value: 'env'` when calling reusable workflows
**Cause**: The `env` context is not available in the `with` parameter when calling reusable workflows
**Solution**: Use `vars` context instead of `env` context
- ❌ Wrong: `environment_url: ${{ env.STAGING_URL }}`
- ✅ Correct: `environment_url: ${{ vars.STAGING_URL }}`
- Variables must be set in GitHub repository Settings → Secrets and variables → Actions → Variables tab

### Dynamic robots.txt Configuration
**Current Implementation**: Uses Hugo's official `enableRobotsTXT = true` approach
- ✅ **Correct**: `layouts/robots.txt` template with `{{ "sitemap.xml" | absURL }}`
- ✅ **Required**: `enableRobotsTXT = true` in `hugo.toml`
- ❌ **Deprecated**: Static `static/robots.txt` files (removed for SEO optimization)

**Why Dynamic Generation is Essential**:
- Ensures correct sitemap URLs across different environments (staging/production)
- Provides proper SEO optimization with `Allow: /` and sitemap directives
- Hugo's default template only includes `User-agent: *` without sitemap information

### Performance Testing Script Optimization
**Improvement**: Replaced `bc` command with `awk` for better POSIX compliance
- ✅ **Current**: `awk -v time="$RESPONSE_TIME" 'BEGIN { print (time < 2.0) }'`
- ❌ **Previous**: `echo "$RESPONSE_TIME < 2.0" | bc -l`
- **Benefit**: Enhanced cross-platform compatibility, no external dependency on `bc`