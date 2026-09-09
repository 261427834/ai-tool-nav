import { readFile } from "node:fs/promises";

const base = "https://ai-tool-nav-410.pages.dev";
const res = await fetch(base + "/", { headers: { "user-agent": "Mozilla/5.0" } });
const html = await res.text();

// 收集站内链接（排除锚点/静态资源），等距抽样 30 个
const hrefs = new Set();
for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
  const h = m[1];
  if (/\.(png|svg|json|webmanifest|xml|txt|ico)$/.test(h)) continue;
  hrefs.add(h);
}
const list = [...hrefs];
const step = Math.max(1, Math.floor(list.length / 30));
const sample = list.filter((_, i) => i % step === 0).slice(0, 30);

let bad = 0;
for (const h of sample) {
  const r = await fetch(base + h, { method: "GET", headers: { "user-agent": "Mozilla/5.0" }, redirect: "follow" });
  if (r.status !== 200) { bad++; console.log(`  ${r.status}  ${h}`); }
}
console.log(`首页站内链接共 ${list.length} 个，抽样 ${sample.length} 个，异常 ${bad} 个`);

// 线上数据完整性
const idx = await (await fetch(base + "/search-index.json")).json();
const emptyTitle = idx.filter((t) => !t.title).length;
const emptyDesc = idx.filter((t) => !t.desc).length;
const badCat = idx.filter((t) => !t.category).length;
console.log(`search-index.json：${idx.length} 条（空标题 ${emptyTitle}，空简介 ${emptyDesc}，无分类 ${badCat}）`);

const sm = await (await fetch(base + "/sitemap.xml")).text();
console.log(`sitemap.xml：${(sm.match(/<loc>/g) || []).length} 条 URL`);
