# Project Structure

## Directory Organization

```
hugo-overreacted-blog/
├── .github/workflows/          # CI/CD automation
├── .kiro/                      # Kiro AI assistant configuration
├── assets/                     # Source assets for processing
│   ├── css/                    # Stylesheets (main.css, chroma themes)
│   └── js/                     # JavaScript modules
├── content/                    # Hugo content files
│   ├── posts/                  # Blog posts
│   ├── resources/              # Resource pages
│   ├── _index.md              # Homepage content
│   └── about.md               # Static pages
├── layouts/                    # Hugo templates
│   ├── _default/              # Default templates
│   ├── _markup/               # Render hooks
│   ├── _partials/             # Reusable components
│   └── *.html                 # Page templates
├── scripts/                    # Build and deployment scripts
├── src/                       # Cloudflare Workers source
├── static/                    # Static assets (copied as-is)
├── public/                    # Generated site output
└── tmp/                       # Temporary build files
```

## Key Files

### Configuration
- `hugo.toml`: Hugo site configuration
- `package.json`: Node.js dependencies and scripts
- `wrangler.toml`: Cloudflare Workers deployment
- `postcss.config.js`: CSS processing pipeline

### Content Structure
- `content/posts/`: Blog posts in Markdown
- `content/_index.md`: Homepage content
- `content/about.md`: About page
- `content/resources/`: Documentation and examples

### Templates
- `layouts/baseof.html`: Base template
- `layouts/_partials/head.html`: HTML head section
- `layouts/_partials/header.html`: Site header
- `layouts/_partials/footer.html`: Site footer
- `layouts/_partials/seo.html`: SEO meta tags

### Assets
- `assets/css/main.css`: Main stylesheet with Tailwind
- `assets/css/chroma-*.css`: Syntax highlighting themes
- `assets/js/`: JavaScript modules for interactivity

## Naming Conventions

### Files
- Use kebab-case for filenames: `my-blog-post.md`
- Template files use descriptive names: `single.html`, `list.html`
- Partials prefixed with component purpose: `seo.html`, `navigation-menu.html`

### Content
- Blog posts in `content/posts/` with date-based naming
- Static pages directly in `content/`
- Use front matter for metadata (title, date, tags, categories)

### Assets
- CSS files use descriptive names: `main.css`, `chroma-dark.css`
- JavaScript modules use kebab-case: `theme-switcher.js`
- Images in `static/images/` with descriptive names

## Build Output
- `public/`: Generated static site
- `resources/_gen/`: Hugo's generated resources cache
- `tmp/hugo_cache/`: Hugo build cache for faster rebuilds