# Hugo Overreacted Blog 模板

此仓库提供了一个**极简主义、高性能、易定制**的博客模板，灵感源自 [overreacted.io](https://overreacted.io/)。模板基于 [Hugo](https://gohugo.io/) 静态站点生成器和 [Tailwind CSS 4.1](https://tailwindcss.com/) 构建，并通过 [Cloudflare Workers](https://workers.cloudflare.com/) 部署到全球边缘网络，提供优秀的响应速度和可扩展性。

## 在线演示

- **生产环境**：<https://hugo-overreacted-blog-prod.zjlgdx.workers.dev/>
- **测试环境**：<https://hugo-overreacted-blog-staging.zjlgdx.workers.dev/>

在访问链接时可以体验到亮暗主题切换、无闪烁加载、代码高亮和优秀的排版布局等功能。

## 核心特性

- **极简主义设计**：单列内容布局、系统字体栈、精心配置的间距和配色，让读者专注于内容本身:contentReference[oaicite:0]{index=0}。
- **双主题支持**：通过 CSS 变量实现亮色和暗色模式，主题切换瞬间生效，无跳闪:contentReference[oaicite:1]{index=1}。
- **完全响应式**：移动端自动适配，视口元标签和布局约束确保良好的阅读体验:contentReference[oaicite:2]{index=2}。
- **Markdown 渲染优化**：使用 Hugo 的 Markdown hook 和 Chroma 高亮生成器，自定义代码主题以复刻 shiki 风格:contentReference[oaicite:3]{index=3}。
- **SEO 与社交媒体优化**：模板自动插入 meta 描述、Canonical URL、Open Graph 和 Twitter 卡片，并生成 JSON‑LD 结构化数据:contentReference[oaicite:4]{index=4}。
- **无障碍支持**：遵循 WCAG 标准的 ARIA 属性、键盘导航和焦点管理，确保残障用户可访问:contentReference[oaicite:5]{index=5}。
- **现代构建与部署**：利用 GitHub Actions 自动完成安装、构建、测试、部署工作流，采用指纹和 SRI 提升缓存命中率与安全:contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}。
- **丰富的文档**：仓库内包含构建、SEO、部署、验证报告等多篇文档，便于快速上手和二次开发:contentReference[oaicite:8]{index=8}。

## 环境要求

- **Hugo**：`>=0.148.1`（须使用 extended 版）:contentReference[oaicite:9]{index=9}
- **Node.js**：`>=18.0.0` 和 npm `>=9`:contentReference[oaicite:10]{index=10}
- **Tailwind CSS CLI**：必须安装在 `dependencies` 中，生产环境会跳过 devDependencies:contentReference[oaicite:11]{index=11}
- **Wrangler CLI**：用于部署到 Cloudflare Workers

## 快速开始

1. 克隆仓库并安装依赖：
   ```bash
   git clone https://github.com/YYvanYang/hugo-overreacted-blog.git
   cd hugo-overreacted-blog
   npm ci
````

2. 本地开发：

   ```bash
   npm run dev
   # 或仅使用 Hugo 服务器
   npm run serve
   ```
3. 构建生产版本：

   ```bash
   npm run build:production
   ```
4. 清理缓存与构建结果：

   ```bash
   npm run clean
   ```

## 目录结构概览

```
.
├── archetypes/             # Hugo 内容模板
├── assets/                 # 样式、JavaScript 与设计令牌
│   ├── css/main.css        # 主样式表，集成 Tailwind v4.1
│   ├── css/chroma-*.css    # 语法高亮主题
│   └── js/theme-switcher.js# 主题切换脚本
├── content/                # Markdown 内容目录
├── layouts/                # Hugo 模板布局 (baseof、home、section、partials 等):contentReference[oaicite:12]{index=12}
├── scripts/                # 构建与部署脚本
├── static/                 # 静态资源 (图片、字体等)
├── hugo.toml               # Hugo 配置文件:contentReference[oaicite:13]{index=13}
├── wrangler.toml           # Cloudflare Workers 配置
└── ...
```

## 配置说明

### Hugo 设置

* `baseURL`：默认指向 staging，CI/CD 流程会在生产环境中使用 `PRODUCTION_URL` 参数覆盖。
* 缓存与资源目录可在 `hugo.toml` 中调整，支持高级 Markup 与模块挂载。

### Tailwind 与 PostCSS

* 主样式定义在 `assets/css/main.css`，可通过 `@theme` 和自定义 CSS 变量调整颜色、间距和字体。
* PostCSS 负责 autoprefixer 与现代 CSS 兼容处理。

### SEO & 社交媒体

页面模板 (`layouts/_partials/seo.html`) 自动生成 meta 标签、Open Graph 和 JSON‑LD 数据。可在每个内容文件前置元数据里覆盖 `title`、`description`、`image` 等。

### 部署到 Cloudflare Workers

1. 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

   ```bash
   npm install -g wrangler
   ```
2. 在仓库设置中配置以下变量/密钥：

   * `CLOUDFLARE_API_TOKEN`
   * `CLOUDFLARE_ACCOUNT_ID`
   * `STAGING_URL` & `PRODUCTION_URL`：分别为测试和生产域名
3. 构建并部署：

   ```bash
   npm run deploy:staging    # 部署到测试环境
   npm run deploy:production # 部署到生产环境
   ```

工作流中将生成构建产物并通过 `wrangler deploy` 发布到相应环境，推荐在 CI 中配合测试脚本验证安全头、SEO 元标签和 robots.txt 等。

## 个性化自定义

* **主题配色**：修改 `assets/css/main.css` 中的 CSS 变量即可调整亮/暗主题的色值，如背景色、文字色和链接颜色。
* **布局结构**：编辑 `layouts` 目录下的模板，例如 `home.html`（首页列表）、`single.html`（文章页面）等。
* **新增页面**：在 `content` 目录创建 Markdown 文件，设置前置参数（`title`、`date`、`draft`、`tags`、`categories` 等）即可自动生成页面。
* **导航菜单**：在 `hugo.toml` 的 `[menu]` 部分定义新的菜单条目。

## 常见问题

* **构建失败 : `tailwindcss` 找不到** — 确保 `tailwindcss` CLI 安装在 `dependencies` 中，而不是 `devDependencies`，生产环境不会安装 devDependencies。
* **安全头未生效** — 如果生产环境缺少 X‑Frame‑Options 等安全头，可能是尚未部署最新 Cloudflare Worker 代码。请重新运行部署命令。
* **手动执行工作流无效** — 更新可复用工作流条件，确保手动 dispatch 时优先执行部署逻辑。

## 贡献指南

欢迎贡献改进！可通过提交 Pull Request 修复错误、完善文档、添加主题或改进脚本。请确保遵循项目现有代码风格并通过所有验证脚本。此外，提交前请运行：

```bash
npm run test:system     # 验证系统兼容性
npm run validate        # 验证构建输出
npm run test:deployment # 部署验证
```

## 许可证

此项目采用 [MIT License](LICENSE)。