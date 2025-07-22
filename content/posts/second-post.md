---
title: "Building with Hugo and Tailwind CSS"
date: 2025-01-22T14:30:00Z
description: "Learn how to build fast, modern websites with Hugo and Tailwind CSS v4.1"
draft: false
tags: ["hugo", "tailwind", "css", "web-development"]
---

# Building Modern Websites with Hugo and Tailwind CSS

Hugo combined with Tailwind CSS v4.1 creates a powerful stack for building fast, modern websites. In this post, we'll explore how they work together.

## Why Hugo?

Hugo is incredibly fast because it's built in Go and generates static sites. Key benefits include:

- **Speed**: Builds sites in milliseconds
- **Flexibility**: Powerful templating system
- **SEO-friendly**: Generates clean, semantic HTML
- **No runtime dependencies**: Pure static output

## Tailwind CSS v4.1 Features

The latest version of Tailwind introduces CSS-first configuration:

```css
@import "tailwindcss";
@source "hugo_stats.json";

@theme {
  --color-primary: #d23669;
  --font-display: system-ui, sans-serif;
}
```

This approach eliminates the need for `tailwind.config.js` files and integrates beautifully with Hugo's asset pipeline.

## Integration Benefits

When you combine Hugo with Tailwind CSS:

1. **Automatic class detection** via `hugo_stats.json`
2. **CSS optimization** through Hugo's asset pipeline
3. **Theme-aware styling** with CSS custom properties
4. **Fast rebuilds** during development

## Performance Results

Our blog template achieves:

- **100/100** Lighthouse performance score
- **< 1s** first contentful paint
- **< 50KB** total CSS bundle size
- **Zero** JavaScript for core functionality

The combination of Hugo's speed and Tailwind's utility-first approach creates websites that are both developer-friendly and performant.

## Next Steps

Try building your own Hugo + Tailwind site:

```bash
# Create new Hugo site
hugo new site my-blog

# Add Tailwind CSS
npm install tailwindcss@latest

# Start developing
hugo server
```

Happy building!