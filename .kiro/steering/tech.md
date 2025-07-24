# Technology Stack

## Core Technologies

- **Hugo**: v0.148.1+ (extended version required)
- **Node.js**: v18.0.0+ 
- **Tailwind CSS**: v4.1+ with CSS-first configuration
- **PostCSS**: Asset processing with autoprefixer and cssnano
- **Cloudflare Workers**: Primary deployment platform

## Build System

### Asset Processing Pipeline
- Hugo handles content generation and template rendering
- PostCSS processes CSS with Tailwind, autoprefixer, and minification
- Asset fingerprinting and integrity hashes for security
- Automatic compression (gzip) for static assets

### Build Scripts
```bash
# Development
npm run dev                    # Start Hugo dev server
npm run build:development      # Development build

# Production
npm run build:production       # Optimized production build
npm run optimize              # Build + validate

# Deployment
npm run deploy:staging        # Deploy to staging
npm run deploy:production     # Deploy to production

# Testing & Validation
npm run test:system          # Validate dependencies
npm run test:deployment      # Test deployed site
npm run validate            # Validate build output
```

### Development Server Management

**Important**: When running development servers for testing or development tasks, use background execution to prevent blocking other operations:

```bash
# First, check for and stop any existing Hugo processes
pkill -f hugo || true

# Start development server in background
npm run dev &
DEV_PID=$!

# Your testing or development work here...

# Always stop the background server when done
kill $DEV_PID
```

**Best Practices**:
- Always check for and stop existing Hugo processes before starting new ones to prevent conflicts
- Use `pkill -f hugo || true` to safely terminate any running Hugo processes
- Always run development servers in background (`&`) when executing automated tasks
- Store the process ID (`$!`) to properly terminate the server later
- Remember to stop background services after completing tests or tasks
- Use `ps aux | grep hugo` to check for running Hugo processes if needed
- For Wrangler dev server: `pkill -f wrangler || true` then `npm run wrangler:dev &` (same pattern)

## Configuration Files

- `hugo.toml`: Hugo configuration with asset processing
- `package.json`: Node.js dependencies and scripts
- `wrangler.toml`: Cloudflare Workers deployment config
- `postcss.config.js`: CSS processing pipeline
- `.github/workflows/deploy.yml`: CI/CD automation

## Development Requirements

- Hugo extended version (for SCSS processing)
- Node.js and npm for asset pipeline
- Wrangler CLI for Cloudflare Workers deployment
- Git for version control

## Asset Optimization

- CSS/JS minification in production
- Asset fingerprinting for cache busting
- Integrity hashes for security
- Automatic gzip compression
- Chroma syntax highlighting generation