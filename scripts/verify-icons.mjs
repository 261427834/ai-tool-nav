/**
 * 检查上一轮抓图标时的“图片后缀与真实格式不一致”问题并修正：
 * - public/icons/*.ico 实际内容是 PNG 的情况（Sniff 错判）已在 convert 阶段处理；
 * - 这里只做一致性体检：tools.json 引用的路径必须真实存在，否则归零重下。
 */
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, ICONS_DIR } from "./lib.mjs";

const tools = JSON.parse(await readFile(path.join(DATA_DIR, "tools.json"), "utf8"));
const files = new Set((await readdir(ICONS_DIR)).filter((f) => !f.startsWith(".")));
const bad = [];
for (const t of tools) {
  const name = path.basename(t.icon);
  if (!files.has(name)) {
    const exists = await stat(path.join(ICONS_DIR, name)).catch(() => null);
    bad.push({ id: t.id, title: t.title, icon: t.icon, exists: Boolean(exists) });
  }
}
console.log(`tools 引用图标但文件缺失：${bad.length}`);
for (const b of bad.slice(0, 10)) console.log(`  ! #${b.id} ${b.title} ${b.icon}`);
if (bad.length) {
  await writeFile(path.join(DATA_DIR, "icons-missing.json"), JSON.stringify(bad, null, 2) + "\n", "utf8");
}

