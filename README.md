# Hugo Overreacted Blog Template

A **minimalist, high-performance, and highly customizable** blog template inspired by [overreacted.io](https://overreacted.io/). Built with [Hugo](https://gohugo.io/) static site generator, [Tailwind CSS v4.1](https://tailwindcss.com/), and deployed on [Cloudflare Workers](https://workers.cloudflare.com/) for global edge distribution.

## 🚀 Live Demo

- **Production**: https://hugo-overreacted-blog.workers.dev/
- **Staging**: https://hugo-overreacted-blog-staging.zjlgdx.workers.dev/

Experience seamless light/dark theme switching, syntax highlighting, responsive design, and optimal typography.

## ✨ Key Features

### 🎨 **Design & UX**
- **Minimalist Design**: Clean single-column layout with system font stack
- **Dual Theme Support**: Instant light/dark mode switching with CSS variables
- **Fully Responsive**: Mobile-first design with viewport optimization
- **Typography Excellence**: Carefully crafted spacing, line heights, and font scales

### 🔧 **Technical Excellence**
- **Modern Build Pipeline**: Custom asset processing with Tailwind CSS v4.1
- **Performance Optimized**: Asset fingerprinting, compression, and CDN distribution
- **SEO Ready**: Complete meta tags, Open Graph, Twitter Cards, and structured data
- **Accessibility First**: WCAG-compliant with keyboard navigation and ARIA attributes

### 🚀 **Deployment & CI/CD**
- **Automated Workflows**: GitHub Actions for build, test, and deployment
- **Multi-Environment**: Separate staging and production environments
- **Edge Distribution**: Global deployment via Cloudflare Workers
- **Security Hardened**: Content Security Policy and security headers

### 📝 **Content Management**
- **Markdown Enhanced**: Custom render hooks and syntax highlighting
- **Dynamic Content**: Automated sitemap and robots.txt generation
- **Flexible Taxonomies**: Tags, categories, and custom taxonomies support
- **Draft & Future Posts**: Development-friendly content workflow

## 📋 Requirements

| Tool | Version | Notes |
|------|---------|-------|
| **Hugo** | `>=0.148.1` (extended) | Static site generator |
| **Node.js** | `>=18.0.0` | JavaScript runtime |
| **npm** | `>=9.0.0` | Package manager |
| **Wrangler** | Latest | Cloudflare Workers CLI |

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/YYvanYang/hugo-overreacted-blog.git
cd hugo-overreacted-blog
npm ci
```

### 2. Development
```bash
# Start development server (with drafts and future posts)
npm run dev

# Basic Hugo server
npm run serve

# Check system requirements
npm run version:check
```

### 3. Build
```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Validate build output
npm run validate:build
```

### 4. Testing
```bash
# System validation
npm run test:system

# Deployment testing
npm run test:deployment

# Run all tests
npm run test:all
```

### 5. Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Dry run (test configuration)
npm run deploy:dry-run
```

## 📁 Project Structure

```
├── .github/workflows/          # GitHub Actions CI/CD
│   ├── deploy.yml             # Main deployment workflow
│   └── reusable-deploy.yml    # Reusable deployment logic
├── archetypes/                # Hugo content templates
├── assets/                    # Source assets
│   ├── css/
│   │   ├── main.css          # Main stylesheet (Tailwind v4.1)
│   │   ├── chroma-light.css  # Light syntax highlighting
│   │   └── chroma-dark.css   # Dark syntax highlighting
│   └── js/
│       ├── theme-switcher.js # Theme toggle functionality
│       └── accessibility.js  # A11y enhancements
├── content/                   # Markdown content
│   ├── posts/                # Blog posts
│   └── _index.md             # Homepage content
├── layouts/                   # Hugo templates
│   ├── _partials/            # Reusable components
│   │   ├── head.html         # HTML head section
│   │   ├── header.html       # Site header
│   │   ├── footer.html       # Site footer
│   │   └── seo.html          # SEO meta tags
│   ├── baseof.html           # Base template
│   ├── home.html             # Homepage layout
│   ├── page.html             # Single page layout
│   └── robots.txt            # Dynamic robots.txt template
├── scripts/                  # Build and deployment scripts
│   ├── build-assets.sh       # Asset processing pipeline
│   ├── deploy.sh             # Deployment script
│   ├── test-system.sh        # System validation
│   └── test-deployment.sh    # Deployment testing
├── static/                   # Static assets
├── hugo.toml                 # Hugo configuration
├── wrangler.toml             # Cloudflare Workers config
├── package.json              # Node.js dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── CLAUDE.md                 # AI assistant instructions
```

## ⚙️ Configuration

### Hugo Configuration (`hugo.toml`)

Key settings in the main configuration file:

```toml
baseURL = 'https://your-domain.com/'
languageCode = 'en-us'
title = 'Your Blog Title'
enableRobotsTXT = true

[params]
  description = "Your blog description"
  author = "Your Name"
  
[menu]
  [[menu.main]]
    name = "Home"
    pageRef = "/"
    weight = 10
```

### Environment Variables

For CI/CD deployment, configure these in GitHub repository settings:

**Secrets:**
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**Variables:**
- `STAGING_URL`: Staging environment URL
- `PRODUCTION_URL`: Production environment URL

### Tailwind CSS Customization

Modify `assets/css/main.css` to customize the design:

```css
@theme {
  --color-background: #ffffff;
  --color-foreground: #1f2937;
  --color-primary: #3b82f6;
  /* Add your custom colors */
}
```

## 🎨 Customization Guide

### Theme Colors
Edit CSS variables in `assets/css/main.css`:
- `--color-background`: Background colors
- `--color-foreground`: Text colors  
- `--color-primary`: Accent colors
- `--color-border`: Border colors

### Layout Templates
Modify templates in `layouts/`:
- `baseof.html`: Base HTML structure
- `home.html`: Homepage layout
- `page.html`: Single page layout
- `_partials/`: Reusable components

### Content Types
Create new content with:
```bash
hugo new posts/your-post.md
```

Add frontmatter:
```yaml
---
title: "Your Post Title"
date: 2025-01-24
draft: false
tags: ["tag1", "tag2"]
categories: ["category1"]
description: "Post description for SEO"
---
```

### Navigation Menu
Configure in `hugo.toml`:
```toml
[[menu.main]]
  name = "About"
  pageRef = "/about"
  weight = 20
```

## 🚀 Deployment

### Cloudflare Workers Setup

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Configure Environments:**
   Update `wrangler.toml` with your Worker names and routes.

3. **Deploy:**
   ```bash
   # Staging
   npm run deploy:staging
   
   # Production  
   npm run deploy:production
   ```

### GitHub Actions Workflow

The CI/CD pipeline automatically:
1. **Builds** the Hugo site with environment-specific configuration
2. **Tests** the build output and validates deployment
3. **Deploys** to staging (develop branch) or production (main branch)
4. **Validates** the deployed site with comprehensive testing

### Manual Deployment

Use the workflow dispatch feature in GitHub Actions to manually deploy to either environment.

## 🧪 Testing & Validation

### System Testing
```bash
npm run test:system
```
Validates Hugo version, Node.js setup, and build dependencies.

### Deployment Testing
```bash
npm run test:deployment
```
Comprehensive testing including:
- HTTP status codes and connectivity
- Asset loading (CSS/JS)
- Performance metrics
- SEO meta tags
- Security headers
- Accessibility features

### Build Validation
```bash
npm run validate:build
```
Validates build output integrity and asset optimization.

## 🔧 Troubleshooting

### Common Issues

**Build Fails with "tailwindcss not found":**
- Ensure `tailwindcss` and `@tailwindcss/cli` are in `dependencies`, not `devDependencies`
- Run `npm install tailwindcss @tailwindcss/cli` (without `-D` flag)

**GitHub Actions Fails:**
- Check that repository variables `STAGING_URL` and `PRODUCTION_URL` are set
- Verify Cloudflare secrets are correctly configured
- Ensure Hugo version matches requirements in workflow

**robots.txt Not Generated:**
- Verify `enableRobotsTXT = true` in `hugo.toml`
- Check that `layouts/robots.txt` template exists
- Rebuild the site with `npm run build:prod`

**Performance Issues:**
- Run `npm run clean` to clear caches
- Check asset optimization in build output
- Verify CDN configuration in Cloudflare

### Getting Help

1. Check the [Hugo documentation](https://gohugo.io/documentation/)
2. Review [Tailwind CSS v4 docs](https://tailwindcss.com/)
3. Consult [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
4. Open an issue in this repository

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Test** your changes: `npm run test:all`
4. **Commit** your changes: `git commit -m 'Add amazing feature'`
5. **Push** to the branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Test all changes locally before submitting
- Update documentation as needed
- Ensure all validation scripts pass

### Testing Before Submission

```bash
npm run version:check    # Verify tool versions
npm run test:system      # System validation
npm run build:prod       # Production build test
npm run validate:build   # Build validation
npm run test:deployment  # Deployment testing
```

## 📚 Documentation

### Project Documentation
- **[📖 Complete Documentation](docs/)** - Comprehensive technical guides and reports
- **[🤖 AI Assistant Guidelines](CLAUDE.md)** - Development instructions for Claude Code

### Technical Documentation
- **[🔧 Asset Processing](docs/technical/asset-processing.md)** - Build pipeline and optimization
- **[🚀 Build Automation](docs/technical/build-automation.md)** - CI/CD workflow and deployment
- **[☁️ Deployment Guide](docs/technical/deployment.md)** - Cloudflare Workers deployment
- **[🔍 SEO Implementation](docs/technical/seo-implementation.md)** - Search optimization features

### Testing & Validation Reports  
- **[📊 System Validation](docs/reports/system-validation.md)** - Environment and requirements testing
- **[🧪 Deployment Testing](docs/reports/deployment-validation.md)** - Connectivity and performance validation
- **[🧭 Navigation Testing](docs/reports/navigation-test.md)** - UI and accessibility testing
- **[⚙️ Workflow Testing](docs/reports/workflow-test.md)** - CI/CD pipeline validation

### External Resources
- [Hugo Configuration Guide](https://gohugo.io/getting-started/configuration/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## 🏆 Performance

This template achieves excellent performance metrics:
- **Lighthouse Score**: 95+ across all categories
- **Core Web Vitals**: Optimal ratings
- **Bundle Size**: Minimized CSS/JS with tree-shaking
- **Loading Speed**: Sub-second first contentful paint
- **SEO Score**: 100/100 with comprehensive meta tags

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [overreacted.io](https://overreacted.io/) by Dan Abramov
- Built with [Hugo](https://gohugo.io/) static site generator
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)

---

**Made with ❤️ and modern web technologies**