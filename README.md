# AI 工具集（Ai集合站）

仿 ai-nav.net 结构搭建的一站式 AI 工具导航站：**Next.js 15（App Router）+ TypeScript + Tailwind CSS 4**，纯静态产物部署到 Vercel。

- 左侧分类锚点栏（可折叠 mini 模式）
- 顶部大搜索（站内实时过滤 + 百度/必应/Google/搜狗引擎切换）
- 热门工具 / 最新收录 / 编辑推荐 tab
- 分类卡片瀑布流（首页每类截断 24 条，全量走 `/c/[slug]`）
- 工具详情页 `/sites/[id]`（直达官网 + 同分类推荐 + SEO）
- 投稿页（mailto 提交 + 本地草稿，不落库）、关于/广告/免责/友链静态页
- 三态主题（日间 / 灰色 / 夜间）+ 首帧无闪烁 + 回顶悬浮按钮
- `sitemap.xml` / `robots.txt` / `manifest.webmanifest` / OG 分享图

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

> 注意：本机若 3000 端口被其它项目占用，用 `npm run start -- -p 3100` 等端口。

## 数据与脚本

| 命令 | 作用 |
|---|---|
| `npm run crawl` | 从公开导航站抓列表页到 `data/raw/`（不提交 git） |
| `npm run normalize` | 归一化为 `data/tools.json` + `data/categories.json` |
| `npm run icons` | 从各工具官网域名获取 favicon 存到 `public/icons/` |
| `npm run gen:index` | 生成 `public/search-index.json`（站内搜索用） |
| `npm run check:data` | 数据校验（CI 用） |
| `npm run check:links` | 外链抽样可用性检查（写 `data/link-report.json`） |
| `npm run gen:og` | 重新生成 `public/og.png` 分享图 |
| `npm run test:e2e` | Playwright 端到端测试 |

**数据模型**：`data/tools.json` 为条目数组（id / title / desc / url / domain / icon / category / subcategory / tags / hot / views / addedAt / updatedAt / intro）。`data/categories.json` 为两级分类树。`data/static-pages.json` 为静态页文案。

**简介合规说明**：`data/tools.json` 的 `desc` 来自 `data/desc-overrides.json`（人工撰写）或按分类生成的中性模板，**不复制任何来源站的文案**；`icon` 均为从各工具官网抓取的 favicon 或字母徽章降级，不引用第三方导航站素材。

## 品牌配置

所有品牌信息集中在 **`site.config.ts`**：站名 / 域名 / 简介 / 邮箱 / 备案号 / 导航 / 页脚链接。改品牌只改这一个文件。

## 部署到 Vercel

1. 把仓库推到 GitHub/GitLab（已配置 `vercel.json`，根目录构建，Node 22）；
2. 在 Vercel 导入仓库，Framework 自动识别 Next.js；
3. 设置环境变量 `NEXT_PUBLIC_SITE_URL` 为你的正式域名（如 `https://your-domain.com`）；
4. 在 `site.config.ts` 里把 `url` 改成正式域名，把 `email`/`icp` 改成你自己的；
5. 部署后把 Vercel 分配的域名换成你的域名，如需国内可访问请完成 ICP 备案（页脚预留了备案位）。

或使用 CLI：`npm i -g vercel && vercel deploy --prod`（首次需登录授权）。

## 目录结构

```
src/app/            # 路由页面（首页 / c/[slug] / sites/[id] / search / submit / 静态页 / sitemap / robots / manifest）
src/components/     # Sidebar / TopBar / SearchBox / ToolCard / CategorySection / HotTabs / Footer / FloatingTools …
src/lib/            # data / search / theme / types / badge / cn
data/               # categories.json / tools.json / static-pages.json / desc-overrides.json
scripts/            # crawl / normalize / fetch-icons / gen-* / check-*（Node + PowerShell 辅助）
public/icons/       # 本地化 favicon（域名+id 命名）
e2e/                # Playwright 测试
```
