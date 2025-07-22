# SEO Implementation Guide

This Hugo blog template includes comprehensive SEO optimization with meta tags, Open Graph, Twitter Cards, and JSON-LD structured data.

## Features Implemented

### 1. Basic SEO Meta Tags
- Meta description (page-specific or site-wide fallback)
- Language and copyright information
- Author information
- Canonical URLs

### 2. Open Graph Meta Tags
- Complete Open Graph implementation for social media sharing
- Dynamic image selection (page-specific → page resources → site default)
- Article-specific tags (published/modified dates, author, tags, series)
- Proper content type detection (article vs website)

### 3. Twitter Cards
- Summary with large image cards
- Twitter site and creator handles
- Proper image and description handling

### 4. JSON-LD Structured Data
- BlogPosting schema for individual posts
- Article schema for enhanced article markup
- WebSite schema for the homepage with search action
- WebPage schema for other pages
- BreadcrumbList schema for navigation
- Organization and Person schemas for publisher/author

## Configuration

### Site-Level Configuration (hugo.toml)

```toml
[params]
  description = "Your site description"
  author = "Your Name"
  images = ["images/site-feature-image.jpg"]  # Default Open Graph images
  keywords = ["keyword1", "keyword2", "keyword3"]
  
  [params.social]
    twitter = "yourtwitterhandle"  # Without @
    github = "yourgithub"
    facebook_admin = "your_facebook_page_id"  # For Facebook Domain Insights
```

### Page-Level Front Matter

```yaml
---
title: "Your Post Title"
date: 2025-01-20T10:00:00Z
lastmod: 2025-01-20T10:00:00Z  # Optional, defaults to date
description: "Detailed description for SEO and social sharing"
images: ["images/post-specific-image.jpg"]  # Optional, overrides site default
keywords: ["specific", "keywords", "for", "this", "post"]
tags: ["tag1", "tag2", "tag3"]
categories: ["category1"]
series: ["Series Name"]  # Optional, for related content
audio: ["https://example.com/audio.mp3"]  # Optional
videos: ["https://example.com/video.mp4"]  # Optional
---
```

## Image Handling

The SEO system automatically selects images in this priority order:

1. **Page-specific images**: From front matter `images` array
2. **Page resources**: Looks for images with "feature", "cover", or "thumbnail" in filename
3. **First page resource**: Any image in the page bundle
4. **Site default**: From `params.images` in configuration

## Structured Data Types

### For Individual Posts (BlogPosting + Article)
- Headline, description, URL
- Publication and modification dates
- Author and publisher information
- Keywords from tags
- Featured image

### For Homepage (WebSite)
- Site information and description
- Search action for site search functionality
- Publisher organization details

### For Other Pages (WebPage)
- Basic page information
- Publisher and author details
- Breadcrumb navigation

## SEO Best Practices Implemented

1. **Canonical URLs**: Prevents duplicate content issues
2. **Proper meta descriptions**: Unique for each page with fallbacks
3. **Open Graph optimization**: Rich social media previews
4. **Structured data**: Enhanced search engine understanding
5. **Image optimization**: Automatic selection and proper sizing
6. **Breadcrumb navigation**: Helps search engines understand site structure
7. **Article markup**: Enhanced article display in search results

## Testing Your SEO

### Tools to Validate Implementation:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### What to Check:
- Meta tags are properly generated
- Open Graph images display correctly
- Structured data validates without errors
- Canonical URLs are correct
- Breadcrumbs appear in search results

## Customization

The SEO partial is located at `layouts/_partials/seo.html` and can be customized for specific needs. The implementation follows Hugo best practices and modern SEO standards.

## Performance Notes

- JSON-LD structured data is minified in production builds
- Images are properly referenced with absolute URLs
- Meta tags are efficiently generated with minimal template processing
- Fallback mechanisms ensure no broken references