/**
 * 图标本地化：从每个工具自己的官网域名获取图标，统一转为 PNG 存到 public/icons/。
 *
 * 用法：
 *   npm run icons                      # 只补缺失
 *   node scripts/fetch-icons.mjs --force
 *   node scripts/fetch-icons.mjs --only 12   # 联调：只处理 id=12
 *
 * 解析顺序（全部来自工具官网，不使用任何第三方导航站的素材）：
 *   1) https://{domain}/favicon.ico
 *   2) 首页 HTML 里的 <link rel="icon|shortcut icon|apple-touch-icon"> 指向的地址
 *   3) https://{domain}/apple-touch-icon.png
 * 拿不到就跳过，前端降级为按域名派生色相的字母徽章（见 src/components/ToolIcon.tsx）。
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { ROOT, DATA_DIR, ICONS_DIR } from "./lib.mjs";

const execFileAsync = promisify(execFile);
const argv = process.argv;
const FORCE = argv.includes("--force");
const onlyArg = argv.indexOf("--only");
const ONLY = onlyArg >= 0 ? Number(argv[onlyArg + 1]) : null;
const CONCURRENCY = 12;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const TMP_DIR = path.join(DATA_DIR, "raw", "icon-tmp");
const MIN_BYTES = 64;

async function existsBig(p) {
  try {
    return (await stat(p)).size >= MIN_BYTES;
  } catch {
    return false;
  }
}

async function grab(url, timeoutMs = 9000) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "image/*,text/html;q=0.8,*/*;q=0.5", "accept-language": "zh-CN,zh;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < MIN_BYTES) return null;
  return { buf, type: res.headers.get("content-type") ?? "" };
}

/** 按魔数判断真实类型（很多站 favicon.ico 实际是 PNG） */
function sniff(buf) {
  if (buf.length > 12 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length > 4 && buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x03 && buf[3] === 0x00) return "ico";
  if (buf.length > 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
  if (buf.length > 12 && buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "webp";
  if (buf.length > 6 && buf.slice(0, 6).toString().includes("<svg")) return "svg";
  if (buf.slice(0, 200).toString("utf8").trimStart().startsWith("<svg")) return "svg";
  return "ico";
}

/** 从首页 HTML 中抽取 favicon 候选地址 */
function faviconCandidates(html, baseUrl) {
  const out = [];
  const re = /<link\b[^>]*rel=["'](?:[^"']*\b(?:icon|shortcut)\b[^"']*)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = /href=["']([^"']+)["']/i.exec(m[0])?.[1];
    if (!href) continue;
    const apple = /apple-touch-icon/i.test(m[0]);
    out.push({ url: safeJoin(href, baseUrl), apple });
  }
  // manifest 里的 icon 不做（成本高）
  return out.filter((c) => c.url).sort((a, b) => Number(a.apple) - Number(b.apple));
}

function safeJoin(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

async function resolveIcon(tool) {
  // 1) 常见 favicon.ico
  const direct = await grab(`https://${tool.domain}/favicon.ico`);
  if (direct) return direct;

  // 2) 首页声明的图标
  const home = await grab(`https://${tool.domain}/`, 10_000);
  if (home && /text\/html|\bhtml\b/i.test(home.type || "text/html")) {
    const html = home.buf.toString("utf8").slice(0, 200_000);
    for (const c of faviconCandidates(html, `https://${tool.domain}/`).slice(0, 3)) {
      const img = await grab(c.url);
      if (img) return img;
    }
  }

  // 3) apple-touch-icon 兜底
  return await grab(`https://${tool.domain}/apple-touch-icon.png`);
}

async function writeIcon(key, buf, kind) {
  const pngPath = path.join(ICONS_DIR, `${key}.png`);
  if (kind === "png") {
    await writeFile(pngPath, buf);
    return pngPath;
  }
  if (kind === "svg") {
    // SVG 无法用 GDI+ 栅格化：保留原格式，工具函数按实际扩展名返回路径
    const svgPath = path.join(ICONS_DIR, `${key}.svg`);
    await writeFile(svgPath, buf);
    return svgPath;
  }
  // ico/gif/webp → 交给 GDI+ 批量转 PNG
  await writeFile(path.join(TMP_DIR, `${key}.${kind}`), buf);
  return pngPath;
}

async function main() {
  const toolsPath = path.join(DATA_DIR, "tools.json");
  const tools = JSON.parse(await readFile(toolsPath, "utf8"));
  await mkdir(ICONS_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const targets = ONLY ? tools.filter((t) => t.id === ONLY) : tools;
  const queue = [];
  let ready = 0;
  for (const t of targets) {
    const key = path.basename(t.icon).replace(/\.(png|svg)$/i, "");
    const pngPath = path.join(ICONS_DIR, `${key}.png`);
    const svgPath = path.join(ICONS_DIR, `${key}.svg`);
    if (!FORCE && ((await existsBig(pngPath)) || (await existsBig(svgPath)))) {
      ready += 1;
      continue;
    }
    queue.push({ tool: t, key });
  }
  console.log(`待获取 ${queue.length} 个图标（已有 ${ready}；来源=各工具官网）`);

  let done = 0;
  const results = new Map(); // id -> 站点可用相对路径
  const failures = [];

  const worker = async () => {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      const { tool, key } = job;
      try {
        const img = await resolveIcon(tool);
        if (!img) {
          failures.push({ id: tool.id, title: tool.title, domain: tool.domain, error: "no-icon-found" });
        } else {
          const kind = sniff(img.buf);
          const file = await writeIcon(key, img.buf, kind);
          const rel = `/icons/${path.basename(file)}`;
          if (kind === "svg") results.set(tool.id, rel);
        }
      } catch (err) {
        failures.push({ id: tool.id, title: tool.title, domain: tool.domain, error: String(err?.message ?? err).slice(0, 120) });
      }
      done += 1;
      if (done % 50 === 0) console.log(`  ... ${done} 已处理`);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // 批量把 ico/gif/webp 转成 PNG
  const pending = (await readdir(TMP_DIR)).filter((f) => !f.endsWith(".png"));
  if (pending.length) {
    console.log(`转换 ${pending.length} 个非 PNG 图标…`);
    const script = path.join(ROOT, "scripts", "convert-icons.ps1");
    const { stdout } = await execFileAsync(
      "pwsh.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", script, "-Src", TMP_DIR, "-Dst", ICONS_DIR],
      { maxBuffer: 32 * 1024 * 1024, windowsHide: true, timeout: 20 * 60 * 1000 },
    );
    if (stdout?.trim()) console.log(stdout.trim());
  }
  await rm(TMP_DIR, { recursive: true, force: true });

  // 统一 icon 字段：SVG 的成功项写回实际路径，其余保持 .png
  let changed = 0;
  for (const t of tools) {
    const rel = results.get(t.id);
    if (rel && t.icon !== rel) {
      t.icon = rel;
      changed += 1;
    }
  }
  if (changed) await writeFile(toolsPath, JSON.stringify(tools, null, 2) + "\n", "utf8");

  const missing = [];
  for (const t of tools) {
    const p = path.join(ICONS_DIR, path.basename(t.icon));
    if (!(await existsBig(p))) missing.push({ id: t.id, title: t.title, domain: t.domain, icon: t.icon });
  }
  await writeFile(path.join(DATA_DIR, "icons-missing.json"), JSON.stringify(missing, null, 2) + "\n", "utf8");

  console.log(`\n本次处理 ${done} 个：抓取成功 ${done - failures.length}，仍缺失 ${missing.length}（前端字母徽章降级）`);
  console.log(`仍缺失 ${missing.length} 个 → 前端字母徽章降级；清单：data/icons-missing.json`);
  if (changed) console.log(`写回 ${changed} 个 svg 图标路径到 data/tools.json`);
  for (const f of failures.slice(0, 8)) console.log(`  ! #${f.id} ${f.domain} → ${f.error}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


