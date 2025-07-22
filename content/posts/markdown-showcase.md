---
title: "Markdown Showcase: Testing All Features"
date: 2025-01-23T09:15:00Z
description: "A comprehensive test of all markdown features including code blocks, images, links, tables, and more to validate the Hugo template's rendering capabilities."
draft: false
tags: ["markdown", "testing", "showcase", "features"]
categories: ["testing"]
images: ["images/markdown-showcase.jpg"]
keywords: ["markdown features", "hugo testing", "content validation"]
---

# Markdown Feature Showcase

This post demonstrates all the markdown features supported by our Hugo template to ensure proper rendering and styling.

## Typography and Headings

### This is an H3 heading
#### This is an H4 heading
##### This is an H5 heading
###### This is an H6 heading

Regular paragraph text with **bold text**, *italic text*, and ***bold italic text***. We also support ~~strikethrough text~~ and `inline code`.

## Links and External References

Here are different types of links:

- [Internal link to about page](/about)
- [External link to Hugo documentation](https://gohugo.io/documentation/)
- [Link with title](https://tailwindcss.com "Tailwind CSS Official Site")
- Email link: [contact@example.com](mailto:contact@example.com)

## Code Blocks and Syntax Highlighting

### JavaScript Example

```javascript
// Theme switching functionality
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.classList.toggle('dark');
  localStorage.setItem('theme', newTheme);
  
  // Update syntax highlighting
  updateSyntaxHighlighting(newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
});
```

### CSS Example

```css
/* Theme-aware custom properties */
:root {
  --color-bg: #ffffff;
  --color-text: #282c35;
  --color-heading: #000000;
  --color-link: #d23669;
  --color-border: #e5e7eb;
}

html.dark {
  --color-bg: #282c35;
  --color-text: #dcdfe4;
  --color-heading: #ffffff;
  --color-link: #ff6b9d;
  --color-border: #374151;
}

/* Responsive typography */
.prose {
  max-width: 65ch;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .prose {
    padding: 0 2rem;
  }
}
```

### Go Example

```go
package main

import (
    "fmt"
    "net/http"
    "log"
)

type Server struct {
    port string
}

func NewServer(port string) *Server {
    return &Server{port: port}
}

func (s *Server) Start() error {
    http.HandleFunc("/", s.handleHome)
    http.HandleFunc("/health", s.handleHealth)
    
    fmt.Printf("Server starting on port %s\n", s.port)
    return http.ListenAndServe(":"+s.port, nil)
}

func (s *Server) handleHome(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Welcome to the Hugo blog!")
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintf(w, "OK")
}

func main() {
    server := NewServer("8080")
    if err := server.Start(); err != nil {
        log.Fatal("Server failed to start:", err)
    }
}
```

### Python Example

```python
#!/usr/bin/env python3
"""
Hugo blog content generator script
"""

import os
import datetime
from pathlib import Path
from typing import Dict, List, Optional

class BlogPost:
    def __init__(self, title: str, content: str, tags: List[str] = None):
        self.title = title
        self.content = content
        self.tags = tags or []
        self.date = datetime.datetime.now()
    
    def generate_frontmatter(self) -> str:
        """Generate Hugo frontmatter for the post"""
        frontmatter = f"""---
title: "{self.title}"
date: {self.date.isoformat()}Z
description: "Auto-generated blog post"
draft: false
tags: {self.tags}
---

"""
        return frontmatter
    
    def save_to_file(self, output_dir: Path) -> None:
        """Save the blog post to a markdown file"""
        filename = self.title.lower().replace(' ', '-').replace(',', '') + '.md'
        filepath = output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(self.generate_frontmatter())
            f.write(self.content)
        
        print(f"Created: {filepath}")

def main():
    posts_dir = Path("content/posts")
    posts_dir.mkdir(parents=True, exist_ok=True)
    
    sample_post = BlogPost(
        title="Sample Generated Post",
        content="This is auto-generated content for testing.",
        tags=["automation", "python", "hugo"]
    )
    
    sample_post.save_to_file(posts_dir)

if __name__ == "__main__":
    main()
```

### Shell Script Example

```bash
#!/bin/bash

# Hugo blog deployment script
set -e

echo "🚀 Starting Hugo blog deployment..."

# Build the site
echo "📦 Building Hugo site..."
hugo --minify --gc

# Optimize images (if imagemin is available)
if command -v imagemin &> /dev/null; then
    echo "🖼️  Optimizing images..."
    imagemin public/images/* --out-dir=public/images/
fi

# Deploy to Cloudflare Workers
echo "☁️  Deploying to Cloudflare Workers..."
wrangler deploy

# Purge Cloudflare cache
if [ -n "$CF_ZONE_ID" ] && [ -n "$CF_API_TOKEN" ]; then
    echo "🧹 Purging Cloudflare cache..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
         -H "Authorization: Bearer $CF_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}'
fi

echo "✅ Deployment complete!"
```

## Lists and Organization

### Unordered Lists

- First level item
  - Second level item
  - Another second level item
    - Third level item
    - Another third level item
- Back to first level

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

### Task Lists

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task

## Tables

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Dark/Light Theme | ✅ Complete | High | Fully implemented |
| Syntax Highlighting | ✅ Complete | High | Dual theme support |
| Responsive Design | ✅ Complete | High | Mobile-first approach |
| SEO Optimization | ✅ Complete | Medium | Meta tags & structured data |
| Accessibility | ✅ Complete | High | WCAG 2.1 compliant |
| Performance | 🔄 In Progress | High | Asset optimization |

## Blockquotes

> This is a simple blockquote to test styling.

> This is a longer blockquote that spans multiple lines to test how the template handles longer quoted content. It should maintain proper spacing and visual hierarchy.
> 
> — Author Name

> ### Blockquote with heading
> 
> Blockquotes can contain other markdown elements like **bold text**, *italic text*, and even `inline code`.
> 
> ```javascript
> // Even code blocks!
> console.log("Hello from inside a blockquote");
> ```

## Horizontal Rules

Content above the rule.

---

Content below the rule.

## Images and Media

![Sample image alt text](https://via.placeholder.com/800x400/d23669/ffffff?text=Sample+Blog+Image "Sample image title")

*Caption: This is a sample image to test image rendering and styling.*

## Inline HTML

<div style="background: linear-gradient(45deg, #d23669, #ff6b9d); padding: 1rem; border-radius: 0.5rem; color: white; text-align: center; margin: 1rem 0;">
  <strong>Custom HTML Block</strong><br>
  This tests inline HTML support in markdown.
</div>

## Special Characters and Entities

Testing special characters: © ® ™ § ¶ † ‡ • … ‰ ′ ″ ‹ › « » ‚ „ ' ' " "

Math symbols: ± × ÷ ≠ ≤ ≥ ∞ ∑ ∏ √ ∫ ∂ Δ π α β γ δ ε

Arrows: ← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓ ⇔ ⇕

## Conclusion

This comprehensive markdown showcase tests all the major features of our Hugo template. It ensures that:

1. **Typography** renders correctly across all heading levels
2. **Code syntax highlighting** works for multiple languages
3. **Links** (internal and external) function properly
4. **Lists and tables** display with proper formatting
5. **Images and media** load and display correctly
6. **Special content** like blockquotes and HTML work as expected

The template should handle all these elements gracefully while maintaining the clean, minimalist aesthetic inspired by overreacted.io.