/**
 * 生成 public/search-index.json：给站内搜索下拉建议用的瘦索引。
 * 在 predev / prebuild 阶段执行，客户端首次聚焦搜索框时按需 fetch。
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ROOT, DATA_DIR } from "./lib.mjs";

const tools = JSON.parse(await readFile(path.join(DATA_DIR, "tools.json"), "utf8"));

const index = tools.map((t) => ({
  id: t.id,
  slug: t.slug,
  title: t.title,
  desc: t.desc.length > 46 ? t.desc.slice(0, 46) + "…" : t.desc,
  category: t.category,
  subcategory: t.subcategory,
  domain: t.domain,
  icon: t.icon,
  tags: t.tags,
  hot: t.hot,
}));

await mkdir(path.join(ROOT, "public"), { recursive: true });
await writeFile(path.join(ROOT, "public", "search-index.json"), JSON.stringify(index), "utf8");
console.log(`search-index.json：${index.length} 条 / ${(JSON.stringify(index).length / 1024).toFixed(1)} KB`);


