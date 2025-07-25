# Hugo Overreacted Blog

<div align="center">

[![Hugo](https://img.shields.io/badge/Hugo-0.148.1+-FF4088?logo=hugo&logoColor=white)](https://gohugo.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**A minimalist blog template inspired by [overreacted.io](https://overreacted.io/)**

[Live Demo](https://hugo-overreacted-blog-prod.zjlgdx.workers.dev/) · [Documentation](docs/) · [Getting Started](docs/guides/deployment.md) · [Report Bug](https://github.com/YYvanYang/hugo-overreacted-blog/issues)

</div>

## Features

- 🎨 **Minimalist Design** — Clean, distraction-free reading experience
- 🌓 **Dual Themes** — Light/dark mode with system preference detection
- ⚡ **Performance First** — 95+ Lighthouse scores, sub-second loading
- 📱 **Mobile Optimized** — Responsive design with accessibility support
- 🔍 **SEO Ready** — Dynamic sitemaps, structured data, meta optimization
- 🚀 **CI/CD Pipeline** — Automated testing and deployment workflows

## Quick Start

```bash
git clone https://github.com/YYvanYang/hugo-overreacted-blog.git
cd hugo-overreacted-blog
npm ci
npm run dev
```

Open [http://localhost:1313](http://localhost:1313) to view the site.

## Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Hugo | 0.148.1+ (extended) | Static site generation |
| Node.js | 18+ | Build tools and dependencies |
| npm | 9+ | Package management |

## Commands

```bash
# Development
npm run dev              # Start dev server with drafts
npm run build:dev        # Development build
npm run build:prod       # Production build

# Testing
npm run test:system      # Validate requirements
npm run test:deployment  # Test deployed site
npm run test:all         # Run all tests

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:production # Deploy to production
```

## Deployment

### Cloudflare Workers

1. **Create API Token**: Use the ["Edit Cloudflare Workers" template](https://dash.cloudflare.com/profile/api-tokens)

2. **Configure GitHub Secrets**:
   - `CLOUDFLARE_API_TOKEN` (from step 1)
   - `CLOUDFLARE_ACCOUNT_ID` (from Cloudflare dashboard)

3. **Set GitHub Variables**:
   - `STAGING_URL` and `PRODUCTION_URL`

4. **Deploy**: Push to `develop` (staging) or `main` (production)

📖 **Detailed Setup**: See [Deployment Guide](docs/guides/deployment.md) for complete instructions.

## Architecture

```
├── assets/              # CSS, JS, and other assets
│   ├── css/            # Tailwind CSS files
│   └── js/             # JavaScript modules
├── content/            # Markdown content
│   └── posts/          # Blog posts
├── docs/               # Project documentation
│   ├── guides/         # Deployment and setup guides
│   ├── technical/      # Technical documentation
│   └── reports/        # Testing and validation reports
├── layouts/            # Hugo templates
│   ├── _default/       # Default templates
│   └── partials/       # Reusable components
├── scripts/            # Build automation
└── .github/workflows/  # CI/CD pipelines
```

## Documentation

- 📖 **[Deployment Guide](docs/guides/deployment.md)** - Complete Cloudflare Workers setup
- 🔧 **[Build System](docs/technical/build-system.md)** - CI/CD pipeline and asset processing
- 🎨 **[FOUC Optimization](docs/guides/fouc-optimization.md)** - Performance and loading optimization
- 📊 **[All Documentation](docs/)** - Browse complete documentation

## Contributing

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run tests: `npm run test:all`
4. Submit a pull request

## License

MIT © [YYvanYang](https://github.com/YYvanYang)

---

<div align="center">

**Built with [Hugo](https://gohugo.io/) • Styled with [Tailwind CSS](https://tailwindcss.com/) • Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)**

</div>