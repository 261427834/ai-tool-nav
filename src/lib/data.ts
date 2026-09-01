import rawCategories from "@data/categories.json";
import rawTools from "@data/tools.json";
import rawPages from "@data/static-pages.json";
import type { Category, StaticPage, Tool } from "./types";

export const categories = rawCategories as unknown as Category[];
export const tools = rawTools as unknown as Tool[];
export const staticPages = rawPages as unknown as StaticPage[];

/** 一级分类 slug -> 分类 */
export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
/** 工具 id -> 工具 */
export const toolById = new Map(tools.map((t) => [t.id, t]));
/** 锚点 id（term-*）-> 分类，用于首页侧栏高亮 */
export const categoryByAnchor = new Map<string, { category: Category; child?: Category["children"][number] }>();
for (const c of categories) {
  categoryByAnchor.set(c.anchor, { category: c });
  for (const child of c.children) categoryByAnchor.set(child.anchor, { category: c, child });
}

const byCategory = new Map<string, Tool[]>();
for (const t of tools) {
  const list = byCategory.get(t.category);
  if (list) list.push(t);
  else byCategory.set(t.category, [t]);
}

/** 取某分类全部工具（已按 热门 → 原站顺序 排好） */
export function toolsOfCategory(slug: string): Tool[] {
  return byCategory.get(slug) ?? [];
}

export function toolsOfSubcategory(slug: string, sub: string): Tool[] {
  return toolsOfCategory(slug).filter((t) => t.subcategory === sub);
}

/** 首页顺序：热门优先，其次按 id 倒序（新收录靠前） */
export function sortHotFirst(list: Tool[]): Tool[] {
  return [...list].sort((a, b) => Number(b.hot) - Number(a.hot) || b.id - a.id);
}

export function sortNewestFirst(list: Tool[]): Tool[] {
  return [...list].sort((a, b) => b.id - a.id);
}

export const hotTools: Tool[] = tools.filter((t) => t.hot);

/** 详情页同分类推荐 */
export function relatedTools(tool: Tool, limit = 8): Tool[] {
  const pool = toolsOfCategory(tool.category).filter((t) => t.id !== tool.id);
  const sameSub = tool.subcategory ? pool.filter((t) => t.subcategory === tool.subcategory) : [];
  const merged = [...sameSub, ...pool.filter((t) => !sameSub.includes(t))];
  return merged.slice(0, limit);
}

export function totalToolCount(): number {
  return tools.length;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}
