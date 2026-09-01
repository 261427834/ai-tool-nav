import type { Tool } from "./types";

/** 构建期生成的轻量索引（public/_search.json 的镜像），避免运行时再拉网络 */
export interface SearchIndexItem {
  id: number;
  title: string;
  desc: string;
  category: string;
  subcategory: string | null;
  url: string;
  domain: string;
  icon: string;
  slug: string;
  tags: string[];
  hot: boolean;
}

function normalize(s: string): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * 打分：标题前缀 > 标题包含 > 标签包含 > 简介包含。
 * 660+ 条规模线性扫描足够快（<2ms），不引入外部搜索服务。
 */
export function scoreTool(tool: { title: string; desc: string; tags?: string[] }, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const title = normalize(tool.title);
  const desc = normalize(tool.desc);
  const tags = (tool.tags ?? []).map(normalize);

  let score = 0;
  if (title === q) score += 1000;
  if (title.startsWith(q)) score += 300;
  if (title.includes(q)) score += 150;
  if (tags.some((t) => t.includes(q))) score += 80;
  if (desc.includes(q)) score += 40;
  // 逐字兜底（如 “生图” 命中 “AI 生图工具”）
  if (score === 0) {
    const chars = [...new Set([...q].filter((c) => c.trim()))];
    const hits = chars.filter((c) => title.includes(c)).length;
    if (hits >= Math.max(2, Math.ceil(chars.length * 0.7))) score += 30;
  }
  return score;
}

export interface SearchHit {
  tool: Tool;
  score: number;
}

export function searchTools(list: Tool[], query: string, limit = 200): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const tool of list) {
    const score = scoreTool(tool, q);
    if (score > 0) hits.push({ tool, score });
  }
  hits.sort((a, b) => b.score - a.score || Number(b.tool.hot) - Number(a.tool.hot) || b.tool.id - a.tool.id);
  return hits.slice(0, limit);
}

/** 关键词高亮：返回可安全渲染的分段（不依赖 dangerouslySetInnerHTML） */
export interface Segment {
  text: string;
  hit: boolean;
}

export function highlight(text: string, query: string): Segment[] {
  const q = normalize(query);
  if (!q) return [{ text, hit: false }];
  const lower = normalize(text);
  const out: Segment[] = [];
  let i = 0;
  while (i < text.length) {
    const at = lower.indexOf(q, i);
    if (at === -1) {
      out.push({ text: text.slice(i), hit: false });
      break;
    }
    if (at > i) out.push({ text: text.slice(i, at), hit: false });
    out.push({ text: text.slice(at, at + q.length), hit: true });
    i = at + q.length;
  }
  return out;
}
