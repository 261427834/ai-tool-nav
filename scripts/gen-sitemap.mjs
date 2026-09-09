/**
 * 构建期生成 public/sitemap.xml（静态导出无法使用 app/sitemap.ts）。
 * 域名从 site.config 读取（部署时改 site.config.ts + 环境变量即可）。
 * 用法：node scripts/gen-sitemap.mjs [baseUrl]
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ROOT, DATA_DIR } from "./lib.mjs";

const baseArg = process.argv[2];
const siteFile = await readFile(path.join(ROOT, "site.config.ts"), "utf8");
const urlMatch = /url:\s*"([^"]+)"/.exec(siteFile);
const defaultBase = urlMatch ? urlMatch[1] : "https://ai-tool-nav.pages.dev";
const base = (baseArg ?? defaultBase).replace(/\/$/, "");

const tools = JSON.parse(await readFile(path.join(DATA_DIR, "tools.json"), "utf8"));
const categories = JSON.parse(await readFile(path.join(DATA_DIR, "categories.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${base}/`, priority: 1, freq: "daily" },
  { loc: `${base}/tools-all`, priority: 0.6, freq: "weekly" },
  { loc: `${base}/submit`, priority: 0.5, freq: "monthly" },
  { loc: `${base}/about`, priority: 0.4, freq: "monthly" },
  { loc: `${base}/ads`, priority: 0.4, freq: "monthly" },
  { loc: `${base}/disclaimer`, priority: 0.4, freq: "monthly" },
  { loc: `${base}/flink`, priority: 0.4, freq: "monthly" },
];

for (const c of categories) {
  urls.push({ loc: `${base}/c/${c.slug}`, priority: 0.7, freq: "weekly" });
  for (const s of c.children) urls.push({ loc: `${base}/c/${c.slug}/${s.slug}`, priority: 0.6, freq: "weekly" });
}

for (const t of tools) urls.push({ loc: `${base}/sites/${t.id}`, priority: 0.4, freq: "monthly" });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await mkdir(path.join(ROOT, "public"), { recursive: true });
await writeFile(path.join(ROOT, "public", "sitemap.xml"), xml, "utf8");

// robots.txt 同步使用同一 base，避免静态文件里写死错误域名
const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`;
await writeFile(path.join(ROOT, "public", "robots.txt"), robots, "utf8");
console.log(`sitemap.xml：${urls.length} 条 URL → public/sitemap.xml`);
console.log(`robots.txt → public/robots.txt（Sitemap: ${base}/sitemap.xml）`);

