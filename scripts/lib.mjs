import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_DIR = path.join(ROOT, "data");
export const RAW_DIR = path.join(DATA_DIR, "raw");
export const ICONS_DIR = path.join(ROOT, "public", "icons");

/** 种子数据来源（公开 AI 导航站），仅用于生成本地 data/*.json */
const BASE = "https://ai-nav.net";

export const SOURCE_SITES = [
  { key: "home", type: "home", url: BASE },
  { key: "write", type: "favorites", url: `${BASE}/favorites/write` },
  { key: "code", type: "favorites", url: `${BASE}/favorites/code` },
  { key: "design", type: "favorites", url: `${BASE}/favorites/design` },
  { key: "chat", type: "favorites", url: `${BASE}/favorites/chat` },
  { key: "video", type: "favorites", url: `${BASE}/favorites/video` },
  { key: "audio", type: "favorites", url: `${BASE}/favorites/audio` },
  { key: "image", type: "favorites", url: `${BASE}/favorites/image` },
  { key: "office", type: "favorites", url: `${BASE}/favorites/office` },
  { key: "learn", type: "favorites", url: `${BASE}/favorites/learn` },
  { key: "prompt", type: "favorites", url: `${BASE}/favorites/prompt` },
];

/**
 * 分类树。order 决定首页与侧栏渲染顺序；anchor 保持与原站一致（term-*）便于逐条比对。
 * lucide 图标名见 src/lib/category-icons.ts。
 */
export const CATEGORIES = [
  { slug: "write", name: "AI写作工具", anchor: "term-17", icon: "feather", order: 1, children: [] },
  { slug: "paper", name: "AI论文工具", anchor: "term-42", icon: "file-text", order: 2, children: [] },
  {
    slug: "image",
    name: "AI图像工具",
    anchor: "term-16",
    icon: "images",
    order: 3,
    children: [
      { slug: "hot", name: "热门AI图像工具", anchor: "term-18", order: 1 },
      { slug: "generate", name: "AI图片生成工具", anchor: "term-19", order: 2 },
      { slug: "upscale", name: "AI图片无损放大", anchor: "term-20", order: 3 },
      { slug: "restore", name: "AI图片优化修复", anchor: "term-21", order: 4 },
      { slug: "bg-remove", name: "AI图片背景移除", anchor: "term-22", order: 5 },
      { slug: "erase", name: "AI图片物体抹除", anchor: "term-23", order: 6 },
    ],
  },
  {
    slug: "office",
    name: "AI办公工具",
    anchor: "term-10",
    icon: "briefcase",
    order: 4,
    children: [
      { slug: "ppt", name: "AI PPT生成", anchor: "term-24", order: 1 },
      { slug: "sheet", name: "AI表格处理", anchor: "term-25", order: 2 },
      { slug: "doc", name: "AI文档工具", anchor: "term-26", order: 3 },
      { slug: "mindmap", name: "AI思维导图", anchor: "term-27", order: 4 },
      { slug: "meeting", name: "AI会议工具", anchor: "term-28", order: 5 },
      { slug: "productivity", name: "AI效率提升", anchor: "term-29", order: 6 },
    ],
  },
  { slug: "code", name: "AI编程工具", anchor: "term-12", icon: "code", order: 5, children: [] },
  { slug: "design", name: "AI设计工具", anchor: "term-13", icon: "palette", order: 6, children: [] },
  { slug: "chat", name: "AI对话聊天", anchor: "term-11", icon: "message-circle", order: 7, children: [] },
  { slug: "video", name: "AI视频工具", anchor: "term-14", icon: "video", order: 8, children: [] },
  { slug: "audio", name: "AI音频工具", anchor: "term-15", icon: "music", order: 9, children: [] },
  { slug: "translate", name: "AI语言翻译", anchor: "term-9", icon: "languages", order: 10, children: [] },
  { slug: "learn", name: "AI学习网站", anchor: "term-5", icon: "graduation-cap", order: 11, children: [] },
  { slug: "agent", name: "AI智能体", anchor: "term-194", icon: "brain", order: 12, children: [] },
  { slug: "detect", name: "AI内容检测", anchor: "term-8", icon: "shield-check", order: 13, children: [] },
  { slug: "prompt", name: "AI提示指令", anchor: "term-7", icon: "lightbulb", order: 14, children: [] },
  { slug: "model", name: "AI训练模型", anchor: "term-6", icon: "cpu", order: 15, children: [] },
  { slug: "framework", name: "AI开发框架", anchor: "term-4", icon: "blocks", order: 16, children: [] },
];

/** anchor(term-*) -> { categorySlug, subcategorySlug } */
export const ANCHOR_MAP = (() => {
  const map = new Map();
  for (const c of CATEGORIES) {
    map.set(c.anchor, { category: c.slug, subcategory: null });
    for (const s of c.children ?? []) {
      map.set(s.anchor, { category: c.slug, subcategory: s.slug });
    }
  }
  return map;
})();

export const CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));
