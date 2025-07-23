# Hugo Overreacted Blog

A minimalist Hugo blog template inspired by [overreacted.io](https://overreacted.io) with modern development practices, automated deployment, and comprehensive CI/CD support.

![Hugo](https://img.shields.io/badge/Hugo-v0.148.1+-FF4088?style=flat&logo=hugo)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1+-38B2AC?style=flat&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Deployed-F38020?style=flat&logo=cloudflare)

## ✨ Features

### 🎨 **Modern Design**
- Clean, minimalist design inspired by overreacted.io
- Responsive layout with mobile-first approach
- Dark/light theme switching with no-flash loading
- Typography optimized for readability

### 🚀 **Performance Optimized**
- Asset minification and compression
- Fingerprinting and cache busting
- Integrity hashes for security
- Global CDN distribution via Cloudflare Workers

### 🛠 **Developer Experience**
- Modern Hugo v0.148.1+ with extended features
- Tailwind CSS v4.1 with CSS-first configuration
- Comprehensive build automation
- CI/CD pipeline with GitHub Actions
- Multi-environment deployment (dev/staging/production)

### ♿ **Accessibility First**
- WCAG 2.1 compliant
- Semantic HTML5 structure
- Keyboard navigation support
- Screen reader optimized
- Focus management and indicators

### 📈 **SEO Optimized**
- Open Graph and Twitter Card meta tags
- JSON-LD structured data
- Automatic sitemap generation
- Canonical URLs and meta descriptions
- Performance-optimized loading

### 🔧 **Advanced Features**
- Syntax highlighting with dual themes
- Markdown render hooks for enhanced content
- Automatic external link handling
- Image optimization with lazy loading
- Comprehensive testing suite

## 🚀 Quick Start

### Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.148.1+ (extended version)
- [Node.js](https://nodejs.org/) v18.0.0+
- [npm](https://www.npmjs.com/) v9.0.0+
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/hugo-overreacted-blog.git
   cd hugo-overreacted-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify system requirements**
   ```bash
   npm run test:system
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:1313
   ```

## 📝 Usage

### Development Workflow

1. **Create new content**
   ```bash
   hugo new posts/my-new-post.md
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build:production
   ```

4. **Test the build**
   ```bash
   npm run validate
   ```

### Content Management

#### Blog Posts
Create new blog posts in `content/posts/`:

```markdown
---
title: "My New Post"
date: 2024-01-15T10:00:00Z
draft: false
tags: ["hugo", "blog"]
categories: ["tutorials"]
description: "A brief description of the post"
---

Your content here...
```

#### Pages
Create static pages in `content/`:

```markdown
---
title: "About"
date: 2024-01-15T10:00:00Z
menu:
  main:
    weight: 20
---

About page content...
```

### Theme Customization

#### Colors and Typography
Edit `assets/css/main.css` to customize the theme:

```css
@theme {
  --color-primary: theme(colors.blue.600);
  --color-secondary: theme(colors.gray.600);
  /* Add your custom properties */
}
```

#### Layout Modifications
Templates are located in `layouts/`:
- `layouts/baseof.html` - Base template
- `layouts/index.html` - Homepage
- `layouts/_default/single.html` - Single post/page
- `layouts/_default/list.html` - List pages
- `layouts/partials/` - Reusable components

## 🚀 Deployment

### Cloudflare Workers (Recommended)

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy to staging**
   ```bash
   npm run deploy:staging
   ```

4. **Deploy to production**
   ```bash
   npm run deploy:production
   ```

### GitHub Actions (Automated)

1. **Set up repository secrets**
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Push to deploy**
   - Push to `develop` branch → deploys to staging
   - Push to `main` branch → deploys to production

3. **Manual deployment**
   - Go to Actions tab in GitHub
   - Run "Build and Deploy Hugo Blog" workflow
   - Select environment (staging/production)

### Other Platforms

The template generates static files in `public/` that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting provider

## 🛠 Configuration

### Hugo Configuration (`hugo.toml`)

Key settings you might want to customize:

```toml
baseURL = 'https://yourdomain.com/'
title = 'Your Blog Title'

[params]
  description = "Your blog description"
  author = "Your Name"
  
  [params.social]
    twitter = "yourusername"
    github = "yourusername"
```

### Wrangler Configuration (`wrangler.toml`)

Update for your domain:

```toml
name = "your-blog-name"

[env.production]
name = "your-blog-name-prod"
# routes = [
#   { pattern = "yourdomain.com/*", custom_domain = true }
# ]
```

### Menu Configuration

Add menu items in `hugo.toml`:

```toml
[[menu.main]]
  name = "Home"
  pageRef = "/"
  weight = 10

[[menu.main]]
  name = "About"
  pageRef = "/about"
  weight = 20
```

## 📦 Available Scripts

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

### Testing Scripts
```bash
npm run test:system         # Validate system requirements
npm run test:deployment     # Test deployed site
npm run validate           # Validate build output
```

### Deployment Scripts
```bash
npm run deploy             # Deploy to staging
npm run deploy:staging     # Deploy to staging
npm run deploy:production  # Deploy to production
npm run deploy:dry-run     # Test deployment without deploying
```

### Utility Scripts
```bash
npm run version:check      # Check tool versions
npm run optimize          # Build and validate for production
```

## 🧪 Testing

### System Validation
```bash
npm run test:system
```
Tests system dependencies, project structure, and configuration.

### Deployment Testing
```bash
npm run test:deployment
```
Comprehensive testing of deployed site including:
- Connectivity and HTTP status codes
- Content validation
- Asset loading
- Performance metrics
- SEO and accessibility
- Security headers

### Build Validation
```bash
npm run validate
```
Validates build output and critical files.

## 📁 Project Structure

```
hugo-overreacted-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── assets/
│   ├── css/
│   │   ├── main.css           # Main stylesheet
│   │   ├── chroma-light.css   # Light theme syntax highlighting
│   │   └── chroma-dark.css    # Dark theme syntax highlighting
│   └── js/
│       ├── theme-switcher.js  # Theme switching logic
│       └── accessibility.js   # Accessibility enhancements
├── content/
│   ├── posts/                 # Blog posts
│   ├── _index.md             # Homepage content
│   └── about.md              # About page
├── layouts/
│   ├── _default/
│   │   ├── baseof.html       # Base template
│   │   ├── single.html       # Single post/page
│   │   ├── list.html         # List pages
│   │   └── _markup/          # Render hooks
│   ├── partials/
│   │   ├── head.html         # HTML head
│   │   ├── header.html       # Site header
│   │   ├── footer.html       # Site footer
│   │   └── seo.html          # SEO meta tags
│   └── index.html            # Homepage template
├── scripts/
│   ├── build-assets.sh       # Build script
│   ├── deploy.sh            # Deployment script
│   ├── test-deployment.sh   # Deployment testing
│   └── test-system.sh       # System validation
├── static/
│   ├── images/              # Static images
│   ├── 404.html            # Custom 404 page
│   └── robots.txt          # Robots.txt
├── hugo.toml               # Hugo configuration
├── package.json            # Node.js dependencies
├── wrangler.toml          # Cloudflare Workers config
├── postcss.config.js      # PostCSS configuration
└── BUILD-AUTOMATION.md    # Detailed build documentation
```

## 🔧 Customization

### Adding New Features

1. **Custom Shortcodes**
   Create in `layouts/shortcodes/`:
   ```html
   <!-- layouts/shortcodes/note.html -->
   <div class="note">
     {{ .Inner }}
   </div>
   ```

2. **Custom CSS**
   Add to `assets/css/main.css`:
   ```css
   .custom-component {
     @apply bg-gray-100 dark:bg-gray-800 p-4 rounded;
   }
   ```

3. **Custom JavaScript**
   Add to `assets/js/` and include in templates:
   ```html
   {{ $js := resources.Get "js/custom.js" | js.Build }}
   <script src="{{ $js.RelPermalink }}" defer></script>
   ```

### Theme Modifications

1. **Color Scheme**
   Edit the `@theme` directive in `assets/css/main.css`

2. **Typography**
   Modify font settings in the CSS custom properties

3. **Layout**
   Edit templates in `layouts/` directory

## 🐛 Troubleshooting

### Common Issues

1. **Hugo Version Mismatch**
   ```bash
   hugo version
   # Ensure v0.148.1+ extended
   ```

2. **Node.js Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build Failures**
   ```bash
   npm run test:system
   npm run clean
   npm run build:development
   ```

4. **Deployment Issues**
   ```bash
   wrangler whoami
   npm run deploy:dry-run
   ```

### Debug Commands

```bash
# Check system requirements
npm run version:check

# Validate configuration
npm run test:system

# Test build process
npm run build:development

# Validate build output
npm run validate

# Test deployment
npm run deploy:dry-run
```

## 📚 Documentation

- [BUILD-AUTOMATION.md](BUILD-AUTOMATION.md) - Comprehensive build and deployment guide
- [Hugo Documentation](https://gohugo.io/documentation/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Clone your fork
2. Install dependencies: `npm install`
3. Run system validation: `npm run test:system`
4. Start development: `npm run dev`
5. Run tests: `npm run test:deployment`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Dan Abramov's overreacted.io](https://overreacted.io)
- Built with [Hugo](https://gohugo.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)

## 📞 Support

- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/username/hugo-overreacted-blog/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/username/hugo-overreacted-blog/discussions)

---

**Made with ❤️ and Hugo**