/**
 * 外链抽样可用性检查（默认抽样 60 条，可 --sample N 调整）。
 * 结果写 data/link-report.json；不阻塞（退出码始终 0，除非参数错误）。
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "./lib.mjs";

const sampleArg = process.argv.indexOf("--sample");
const SAMPLE = sampleArg >= 0 ? Number(process.argv[sampleArg + 1]) : 60;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const tools = JSON.parse(await readFile(path.join(DATA_DIR, "tools.json"), "utf8"));

// 固定步长抽样，保证覆盖各分类
const step = Math.max(1, Math.floor(tools.length / SAMPLE));
const picked = [];
for (let i = 0; i < tools.length && picked.length < SAMPLE; i += step) picked.push(tools[i]);

const results = [];
let ok = 0;
for (const t of picked) {
  const entry = { id: t.id, title: t.title, url: t.url, status: null, note: "" };
  try {
    const res = await fetch(t.url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*", "accept-language": "zh-CN,zh;q=0.9" },
      signal: AbortSignal.timeout(12_000),
    });
    entry.status = res.status;
    entry.note = res.ok ? "ok" : "http-" + res.status;
    if (res.ok) ok += 1;
  } catch (err) {
    entry.note = "error:" + (err?.cause?.code ?? err?.name ?? "fail");
  }
  results.push(entry);
  process.stdout.write(`  ${String(entry.status ?? "-").padStart(4)} ${entry.note.padEnd(14)} ${t.title.slice(0, 24)}\n`);
}

await writeFile(path.join(DATA_DIR, "link-report.json"), JSON.stringify(results, null, 2) + "\n", "utf8");
console.log(`\n抽样 ${results.length} 条：可用 ${ok}，异常 ${results.length - ok}`);
console.log("详细结果：data/link-report.json（失效条目建议在 data/desc-overrides.json 旁人工下架或改分类）");
