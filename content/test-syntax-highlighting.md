---
title: "Test Syntax Highlighting"
date: 2025-01-22T10:00:00Z
description: "Testing the dual-theme syntax highlighting system"
draft: false
---

# Syntax Highlighting Test

This page tests the dual-theme syntax highlighting system with various programming languages.

## JavaScript Example

```javascript
function greetUser(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  
  // Check if user is authenticated
  if (isAuthenticated()) {
    showDashboard();
  } else {
    redirectToLogin();
  }
}

// Arrow function example
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

## Go Example

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

func (s *Server) Start() error {
    http.HandleFunc("/", s.handleHome)
    http.HandleFunc("/api/health", s.handleHealth)
    
    fmt.Printf("Server starting on port %s\n", s.port)
    return http.ListenAndServe(":"+s.port, nil)
}

func (s *Server) handleHome(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Welcome to the Hugo blog!")
}

func main() {
    server := &Server{port: "8080"}
    if err := server.Start(); err != nil {
        log.Fatal(err)
    }
}
```

## CSS Example

```css
/* Theme-aware button styling */
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  background: var(--color-primary);
  color: var(--color-primary-text);
}

.btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* Dark theme overrides */
html.dark .btn {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
```

## HTML Example

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hugo Blog Template</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <header class="site-header">
    <nav aria-label="Main navigation">
      <ul class="nav-list">
        <li><a href="/" aria-current="page">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
    <button id="theme-toggle" aria-label="Switch theme">
      <span class="sr-only">Toggle theme</span>
    </button>
  </header>
  
  <main class="main-content">
    <h1>Welcome to the Blog</h1>
    <p>This is a minimalist Hugo blog template.</p>
  </main>
</body>
</html>
```

## Python Example

```python
from typing import List, Optional
import asyncio
import aiohttp

class BlogPost:
    def __init__(self, title: str, content: str, author: str):
        self.title = title
        self.content = content
        self.author = author
        self.created_at = datetime.now()
    
    def __repr__(self) -> str:
        return f"BlogPost(title='{self.title}', author='{self.author}')"

async def fetch_posts(url: str) -> List[BlogPost]:
    """Fetch blog posts from API endpoint."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                data = await response.json()
                return [BlogPost(**post) for post in data['posts']]
            else:
                raise Exception(f"Failed to fetch posts: {response.status}")

# Usage example
if __name__ == "__main__":
    posts = asyncio.run(fetch_posts("https://api.example.com/posts"))
    for post in posts:
        print(f"📝 {post.title} by {post.author}")
```

## Bash Example

```bash
#!/bin/bash

# Hugo blog deployment script
set -euo pipefail

SITE_DIR="./public"
DEPLOY_BRANCH="gh-pages"
COMMIT_MSG="Deploy site $(date '+%Y-%m-%d %H:%M:%S')"

echo "🚀 Starting Hugo blog deployment..."

# Clean and build the site
echo "📦 Building Hugo site..."
rm -rf "$SITE_DIR"
hugo --minify --gc

# Check if build was successful
if [ ! -d "$SITE_DIR" ]; then
    echo "❌ Build failed - public directory not found"
    exit 1
fi

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
cd "$SITE_DIR"
git init
git add .
git commit -m "$COMMIT_MSG"
git branch -M "$DEPLOY_BRANCH"
git remote add origin git@github.com:username/blog.git
git push -f origin "$DEPLOY_BRANCH"

echo "✅ Deployment complete!"
```

The syntax highlighting should automatically switch between light and dark themes based on your current theme preference. Try toggling the theme to see the code blocks change their appearance!