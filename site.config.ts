/**
 * 全站唯一品牌配置。
 * 改站名 / 域名 / 简介 / logo / 邮箱 / 备案号 / 友链，只需编辑本文件，
 * 不需要改动任何组件或页面代码。
 */

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: "upload" | "newspaper" | "wrench" | "megaphone" | "info";
  children?: NavItem[];
}

export interface FriendLink {
  label: string;
  href: string;
}

export const siteConfig = {
  /** 站点名称（顶栏 / SEO / 页脚） */
  name: "AI 工具集",
  /** 站点全称，用于 title 后缀与 SEO */
  fullName: "AI 工具集 · AI 工具导航站",
  /** 线上域名：部署到 Vercel 后改成自己的域名（同时改 .env 的 NEXT_PUBLIC_SITE_URL） */
  url: "https://ai-tool-nav-410.pages.dev",
  /** 一句话定位（首页大标题下方） */
  tagline: "一站式 AI 工具导航，收录写作、编程、绘画、视频、办公等全场景 AI 工具",
  /** SEO 描述 */
  description:
    "AI 工具集是一站式 AI 工具导航平台，覆盖 AI 写作、AI 编程、AI 绘画、AI 视频、AI 办公、AI 对话等分类，支持站内搜索与夜间模式，帮助你更快找到合适的 AI 工具。",
  /** SEO 关键词 */
  keywords: [
    "AI工具",
    "AI导航",
    "AI工具集",
    "人工智能",
    "AIGC",
    "AI写作",
    "AI编程",
    "AI绘画",
    "AI视频",
    "AI办公",
    "AI对话",
    "AI智能体",
  ],
  /** 联系邮箱（投稿、友链、广告、免责声明共用） */
  email: "hello@example.com",
  /** 备案号；留空字符串则页脚不渲染该行 */
  icp: "",
  /** 首页每个分类最多渲染多少条（其余走 /c/[slug]） */
  homepageCategoryLimit: 16,
  /** 顶部“热门工具”区渲染条数 */
  homepageHotLimit: 24,
  /** 顶栏导航（对应原站投稿 / 资讯 / 工具 / 广告 / 关于） */
  topNav: [
    { label: "提交 AI 工具", href: "/submit", icon: "upload" },
    {
      label: "发现",
      href: "/c/image",
      icon: "newspaper",
      children: [
        { label: "全部 AI 工具", href: "/tools-all" },
        { label: "AI 图像工具", href: "/c/image" },
        { label: "AI 办公工具", href: "/c/office" },
      ],
    },
    { label: "广告合作", href: "/ads", icon: "megaphone" },
    { label: "关于我们", href: "/about", icon: "info" },
  ] satisfies NavItem[],
  /** 页脚站内链接 */
  footerLinks: [
    { label: "友链申请", href: "/flink" },
    { label: "免责声明", href: "/disclaimer" },
    { label: "广告合作", href: "/ads" },
    { label: "关于我们", href: "/about" },
    { label: "提交 AI 工具", href: "/submit" },
  ] satisfies { label: string; href: string }[],
  /** 页脚友情链接（自建，不放原始站点链接） */
  friendLinks: [
    { label: "AI 工具集", href: "/" },
  ] satisfies FriendLink[],
  /** 搜索引擎聚合（切换 tab 后回车 = 新窗口跳转外部搜索） */
  searchEngines: [
    { key: "site", label: "站内", icon: "search" },
    { key: "baidu", label: "百度", icon: "b" },
    { key: "bing", label: "必应", icon: "bing" },
    { key: "google", label: "Google", icon: "g" },
    { key: "sogou", label: "搜狗", icon: "sogou" },
  ] satisfies { key: string; label: string; icon?: string }[],
} as const;

export type SiteConfig = typeof siteConfig;

export const engineUrlMap: Record<string, (q: string) => string> = {
  baidu: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  sogou: (q) => `https://www.sogou.com/web?query=${encodeURIComponent(q)}`,
};

export default siteConfig;


