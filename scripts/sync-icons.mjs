/**
 * 图标引用与实际文件同步：
 * data/tools.json 里 icon 指向 public/icons/ 下不存在的文件时，清空该字段，
 * 前端（ToolIcon/ClientToolIcon）会因此只渲染字母徽章，避免线上破图。
 *
 * 用法：node scripts/sync-icons.mjs   （npm run icons:sync）
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, ICONS_DIR } from "./lib.mjs";

const tools = JSON.parse(await readFile(path.join(DATA_DIR, "tools.json"), "utf8"));
let cleared = 0;
let kept = 0;
const stillMissing = [];

for (const t of tools) {
  const file = path.join(ICONS_DIR, path.basename(t.icon || "x"));
  const ok = await stat(file).then(
    (s) => s.isFile() && s.size >= 64,
    () => false,
  );
  if (t.icon && ok) {
    kept += 1;
  } else {
    if (t.icon) stillMissing.push({ id: t.id, title: t.title, domain: t.domain, icon: t.icon });
    t.icon = "";
    cleared += 1;
  }
}

await writeFile(path.join(DATA_DIR, "tools.json"), JSON.stringify(tools, null, 2) + "\n", "utf8");
console.log(`图标有效 ${kept} 个，清空引用 ${cleared} 个（线上显示字母徽章）`);
if (cleared) {
  await writeFile(path.join(DATA_DIR, "icons-missing.json"), JSON.stringify(stillMissing, null, 2) + "\n", "utf8");
  console.log(`缺失清单已更新：data/icons-missing.json（后续补抓到图标后重跑本脚本即可恢复）`);
}
