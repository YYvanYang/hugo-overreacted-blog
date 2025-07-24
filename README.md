# Hugo Overreacted Blog Template

A production-ready blog template inspired by [overreacted.io](https://overreacted.io/). Built with Hugo, Tailwind CSS v4.1, and deployed on Cloudflare Workers.

[![Hugo](https://img.shields.io/badge/Hugo-0.148.1+-blue.svg)](https://gohugo.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Minimalist Design** - Clean, focused reading experience
- **Dual Theme Support** - Light and dark modes with instant switching
- **Performance Optimized** - 95+ Lighthouse score, sub-second loading
- **SEO Ready** - Complete meta tags, structured data, dynamic sitemap
- **Fully Responsive** - Mobile-first design with accessibility support
- **Modern Workflow** - GitHub Actions CI/CD with automated testing

## Quick Start

```bash
# Clone and install
git clone https://github.com/YYvanYang/hugo-overreacted-blog.git
cd hugo-overreacted-blog
npm ci

# Start development
npm run dev

# Build for production
npm run build:prod
```

**Requirements:** Hugo 0.148.1+ (extended), Node.js 18+, npm 9+

## Live Demo

- **Production:** https://hugo-overreacted-blog.workers.dev/
- **Staging:** https://hugo-overreacted-blog-staging.zjlgdx.workers.dev/

## Documentation

- **[📖 Complete Guide](docs/)** - Technical documentation and guides
- **[🚀 Deployment](docs/technical/deployment.md)** - Cloudflare Workers setup
- **[🎨 Customization](docs/technical/asset-processing.md)** - Theming and assets
- **[🔧 Development](CLAUDE.md)** - AI assistant guidelines

## Deployment

### Cloudflare Workers (Recommended)

1. Install Wrangler: `npm install -g wrangler`
2. Configure `wrangler.toml` with your settings
3. Deploy: `npm run deploy:production`

### GitHub Actions

Set repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Set repository variables:
- `STAGING_URL`
- `PRODUCTION_URL`

## Project Structure

```
├── assets/          # Stylesheets and JavaScript
├── content/         # Markdown content
├── layouts/         # Hugo templates
├── scripts/         # Build and deployment scripts
├── docs/           # Documentation
└── .github/        # CI/CD workflows
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/name`
3. Test your changes: `npm run test:all`
4. Submit a pull request

See [Contributing Guidelines](docs/development/) for details.

## Performance

- **Lighthouse Score:** 95+ across all categories
- **Core Web Vitals:** Optimal ratings
- **Bundle Size:** Minimized with tree-shaking
- **Loading Speed:** Sub-second first contentful paint

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

Inspired by [overreacted.io](https://overreacted.io/) by Dan Abramov.

---

**[Live Demo](https://hugo-overreacted-blog.workers.dev/)** • **[Documentation](docs/)** • **[Issues](https://github.com/YYvanYang/hugo-overreacted-blog/issues)**