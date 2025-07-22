# Design Document

## Overview

This design document outlines the architecture and implementation approach for a minimalist Hugo blog template that mimics the overreacted.io aesthetic. The template leverages Hugo's modern template system (v0.146.0+), Tailwind CSS v4.1's CSS-first configuration approach, and Cloudflare Workers for deployment. The design prioritizes content readability, performance, and maintainability while providing a seamless dark/light theme switching experience.

## Architecture

### High-Level Architecture

The blog template follows a static site generation architecture with the following key components:

1. **Hugo Static Site Generator**: Core content processing and template rendering
2. **Tailwind CSS v4.1**: Utility-first CSS framework with CSS-first configuration
3. **Asset Pipeline**: Hugo's built-in asset processing with Tailwind integration
4. **Cloudflare Workers**: Edge deployment platform for global performance
5. **Theme System**: CSS variable-based dual theme implementation

### Technology Stack

- **Hugo**: v0.128.0+ (extended version required)
- **Tailwind CSS**: v4.1+ with CSS-first configuration
- **Node.js**: v20+ for build tools
- **Deployment**: Cloudflare Workers with static assets
- **Build Tools**: Hugo's native asset pipeline with Tailwind integration

## Components and Interfaces

### 1. Hugo Template System

#### Modern Template Structure (Hugo v0.146.0+)
Based on Hugo's new template system, the layout structure eliminates the `_default` folder and uses a flatter hierarchy:

```
layouts/
├── baseof.html              # Base template
├── home.html               # Homepage template  
├── page.html               # Single page template
├── section.html            # Section list template
├── _partials/              # Renamed from partials/
│   ├── head.html
│   ├── header.html
│   ├── footer.html
│   ├── css.html
│   ├── scripts.html
│   └── seo.html
├── _shortcodes/            # Renamed from shortcodes/
└── _markup/                # Render hooks
    ├── render-link.html
    ├── render-image.html
    └── render-heading.html
```

#### Template Interfaces

**Base Template Interface (`baseof.html`)**:
- Provides HTML document structure
- Includes head, header, main, and footer blocks
- Integrates CSS and JavaScript assets
- Supports theme switching without flash

**Content Templates**:
- `home.html`: Blog post listing with date sorting
- `page.html`: Individual post/page rendering
- `section.html`: Section-based content organization

**Partial Templates**:
- Modular components for reusability
- SEO optimization partial
- Asset processing partials
- Navigation components

### 2. Tailwind CSS v4.1 Integration

#### CSS-First Configuration Approach

Tailwind v4.1 introduces a CSS-first configuration paradigm, eliminating the need for `tailwind.config.js`:

```css
/* assets/css/main.css */
@import "tailwindcss";
@source "hugo_stats.json";

@theme {
  /* Custom design tokens */
  --font-display: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --color-bg: #ffffff;
  --color-text: #282c35;
  --color-heading: #000000;
  --color-link: #d23669;
  /* ... */
}
```

#### Asset Processing Pipeline

Hugo's asset pipeline integrates with Tailwind through:

1. **Source Detection**: `@source "hugo_stats.json"` directive
2. **Build Stats**: Hugo generates class usage statistics
3. **CSS Processing**: `css.TailwindCSS` function processes styles
4. **Optimization**: Minification and fingerprinting in production

### 3. Theme System Architecture

#### CSS Variable-Based Theming

The theme system uses CSS custom properties for seamless switching:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #282c35;
  /* Light theme values */
}

html.dark {
  --color-bg: #282c35;
  --color-text: #dcdfe4;
  /* Dark theme values */
}
```

#### Theme Switching Implementation

1. **Detection**: System preference detection on page load
2. **Storage**: localStorage persistence of user preference
3. **Application**: CSS class toggle without page flash
4. **Syntax Highlighting**: Separate CSS files for light/dark code themes

### 4. Content Processing System

#### Markdown Enhancement

Hugo's Goldmark renderer with extensions:
- **Typographer**: Enhanced punctuation and typography
- **Render Hooks**: Custom link, image, and heading processing
- **Syntax Highlighting**: Chroma engine with custom themes

#### SEO and Metadata

Comprehensive SEO implementation:
- Dynamic meta tag generation
- Open Graph and Twitter Card support
- JSON-LD structured data
- Canonical URL management

## Data Models

### 1. Site Configuration Model

```toml
# hugo.toml
baseURL = "https://example.com/"
languageCode = "en-us"
title = "Blog Title"

[markup.goldmark.renderer]
  unsafe = true
[markup.goldmark.extensions]
  typographer = true

[markup.highlight]
  codeFences = true
  guessSyntax = true
  style = "monokai"

[build]
  writeStats = true
  [[build.cachebusters]]
    source = ":hugo_stats.json"
    target = "css"

[module]
  [[module.mounts]]
    source = "hugo_stats.json"
    target = "assets/hugo_stats.json"
```

### 2. Content Model

**Front Matter Structure**:
```yaml
---
title: "Post Title"
date: 2025-01-01T00:00:00Z
description: "Post description for SEO"
draft: false
---
```

**Menu Configuration**:
```toml
[menu]
  [[menu.main]]
    name = "Home"
    pageRef = "/"
    weight = 10
  [[menu.main]]
    name = "About"
    pageRef = "/about"
    weight = 20
```

### 3. Asset Model

**CSS Assets**:
- `main.css`: Primary stylesheet with Tailwind imports
- `chroma-light.css`: Light theme syntax highlighting
- `chroma-dark.css`: Dark theme syntax highlighting

**JavaScript Assets**:
- `theme-switcher.js`: Theme toggle functionality

## Error Handling

### 1. Build-Time Error Handling

**Hugo Build Errors**:
- Template syntax validation
- Content processing errors
- Asset pipeline failures

**Tailwind Processing Errors**:
- Class detection failures
- CSS compilation errors
- Asset optimization issues

### 2. Runtime Error Handling

**Theme Switching**:
- Graceful fallback to system preference
- localStorage access error handling
- CSS loading failure recovery

**Content Rendering**:
- Missing template fallbacks
- Image loading error handling
- Syntax highlighting failures

### 3. Deployment Error Handling

**Cloudflare Workers**:
- Asset serving failures
- 404 page handling
- Build deployment errors

## Testing Strategy

### 1. Template Testing

**Hugo Template Validation**:
- Template syntax checking
- Content rendering verification
- Asset pipeline testing

**Cross-Browser Testing**:
- Theme switching functionality
- CSS compatibility
- JavaScript functionality

### 2. Performance Testing

**Build Performance**:
- Hugo build time optimization
- Tailwind compilation speed
- Asset processing efficiency

**Runtime Performance**:
- Page load speed
- Theme switching performance
- Asset delivery optimization

### 3. Accessibility Testing

**WCAG Compliance**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Focus management

### 4. Content Testing

**Markdown Processing**:
- Render hook functionality
- Syntax highlighting accuracy
- Link and image processing

**SEO Validation**:
- Meta tag generation
- Structured data validation
- Canonical URL correctness

## Implementation Considerations

### 1. Hugo Version Requirements

- Minimum Hugo v0.128.0 (extended)
- Modern template system features
- Enhanced asset pipeline support

### 2. Tailwind CSS v4.1 Features

- CSS-first configuration approach
- Enhanced performance with Rust engine
- New utility classes and features
- Improved dark mode support

### 3. Cloudflare Workers Integration

- Static asset serving capabilities
- Custom domain support
- Automatic HTTPS certificates
- Global edge distribution

### 4. Development Workflow

**Local Development**:
- Hugo development server
- Live reload functionality
- Asset watching and rebuilding

**Production Build**:
- Asset optimization and minification
- Fingerprinting for cache busting
- Deployment automation

This design provides a solid foundation for implementing a modern, performant, and maintainable Hugo blog template that meets all the specified requirements while leveraging the latest features of Hugo and Tailwind CSS.