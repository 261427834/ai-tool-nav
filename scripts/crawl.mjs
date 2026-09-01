/**
 * 抓取公开 AI 导航站的列表页，产出 data/raw/*.json（仅作为本地种子数据）。
 *
 * 用法：
 *   npm run crawl                        # 抓首页 + 全部分类页（默认传输通道 auto）
 *   node scripts/crawl.mjs --only home   # 只抓某个源
 *   node scripts/crawl.mjs --method node # 强制某个通道：node | curl | pwsh
 *
 * 解析目标结构：OneNav 主题的 .url-card（data-id / data-url / title / strong /
 * .text-xs / img[data-src]），并把卡片归属到它所在的分类区块（h4 + id="term-*"）。
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { ROOT, RAW_DIR, SOURCE_SITES } from "./lib.mjs";

const execFileAsync = promisify(execFile);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const DELAY_MS = 300;
const methodArg = process.argv.includes("--method")
  ? process.argv[process.argv.indexOf("--method") + 1]
  : "auto";

/**
 * 传输通道（部分站点 WAF 按 TLS/HTTP 客户端指纹拦截 curl 与 node fetch）：
 *   node — 原生 fetch；curl — 本机 curl.exe；pwsh — PowerShell .NET HttpClient
 *   auto — pwsh -> node -> curl 依次回退
 */
const ORDER = methodArg === "auto" ? ["pwsh", "node", "curl"] : [methodArg];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BROWSER_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-ch-ua": '"Chromium";v="128", "Not(A:Brand";v="24", "Google Chrome";v="128"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
};

async function fetchViaNode(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, ...BROWSER_HEADERS },
    signal: AbortSignal.timeout(40_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function fetchViaCurl(url) {
  const args = ["-sSL", "--compressed", "--max-time", "40", "-A", UA];
  for (const [k, v] of Object.entries(BROWSER_HEADERS)) args.push("-H", `${k}: ${v}`);
  args.push(url);
  const { stdout } = await execFileAsync("curl.exe", args, {
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
  if (!stdout || stdout.length < 2000) throw new Error("curl empty response");
  return stdout;
}

async function fetchViaPwsh(url, outFile) {
  const ps = `Invoke-WebRequest -Uri '${url}' -OutFile '${outFile}' -UseBasicParsing -TimeoutSec 40`;
  await execFileAsync("pwsh.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
  const html = await readFile(outFile, "utf8");
  await writeFile(outFile + ".done", "", "utf8").catch(() => {});
  if (!html || html.length < 2000) throw new Error("pwsh empty response");
  return html;
}

async function pickTransport(url, tmpFile) {
  let lastErr;
  for (const t of ORDER) {
    try {
      const html =
        t === "pwsh"
          ? await fetchViaPwsh(url, tmpFile)
          : t === "curl"
            ? await fetchViaCurl(url)
            : await fetchViaNode(url);
      if (!html.includes("url-card")) throw new Error(`no url-card via ${t} (${html.length}B)`);
      return html;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`all transports failed for ${url}: ${lastErr?.message ?? lastErr}`);
}

function decode(s) {
  return (s ?? "")
    .replace(/&#0?38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 按出现顺序解析「分类区块 -> 卡片」 */
function parseCards(html, source) {
  const out = [];
  const sectionRe = /<h4[^>]*>[\s\S]{0,240}?id="(term-[0-9-]+)"[\s\S]{0,240}?<\/h4>/g;
  const sections = [];
  let m;
  while ((m = sectionRe.exec(html)) !== null) {
    const name = m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    sections.push({ index: m.index, termId: m[1], name });
  }
  const sectionAt = (pos) => {
    let cur = null;
    for (const s of sections) if (s.index < pos) cur = s;
    return cur;
  };

  const cardRe = /<div class="url-card[\s\S]*?<a\s+href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g;
  while ((m = cardRe.exec(html)) !== null) {
    const [, href, attrs, body] = m;
    const attr = (name) => {
      const r = new RegExp(`\\s${name}="([^"]*)"`).exec(attrs);
      return r ? r[1] : "";
    };
    const pick = (re) => {
      const r = re.exec(body);
      return r ? r[1].trim() : "";
    };
    const id = Number(
      attr("data-id") || pick(/site-(\d+)/) || /\/sites\/(\d+)\.html/.exec(href)?.[1] || 0,
    );
    const sec = sectionAt(m.index);
    const title = decode(pick(/<strong>([\s\S]*?)<\/strong>/)) || decode(attr("title"));
    const item = {
      source,
      id,
      cardHref: decode(href),
      dataUrl: decode(attr("data-url")),
      termId: sec?.termId ?? "",
      sectionName: sec?.name ?? "",
      title,
      desc: decode(pick(/<p class="overflowClip_1[^"]*">([\s\S]*?)<\/p>/)),
      tooltip: decode(attr("title")),
      iconSrc: decode(pick(/data-src="([^"]*)"/)),
      isHot: /is-views/.test(attrs),
    };
    if (item.id && item.title) out.push(item);
  }
  return out;
}

async function main() {
  const onlyArg = process.argv.indexOf("--only");
  const only = onlyArg >= 0 ? process.argv[onlyArg + 1].split(",") : null;
  await mkdir(RAW_DIR, { recursive: true });

  const targets = SOURCE_SITES.filter((t) => !only || only.includes(t.key));
  const summary = [];
  for (const t of targets) {
    process.stdout.write(`· ${t.key.padEnd(10)} ${t.url}\n`);
    try {
      const html = await pickTransport(t.url, path.join(RAW_DIR, `_tmp_${t.key}.html`));
      const items = parseCards(html, t.key);
      await writeFile(
        path.join(RAW_DIR, `${t.key}.json`),
        JSON.stringify({
          key: t.key,
          url: t.url,
          fetchedAt: new Date().toISOString(),
          count: items.length,
          items,
        }),
        "utf8",
      );
      summary.push({ key: t.key, count: items.length });
    } catch (err) {
      console.error(`  ! ${t.key} 失败：${err.message}`);
      summary.push({ key: t.key, count: -1 });
    }
    await sleep(DELAY_MS);
  }

  console.log("\n抓取结果：");
  for (const s of summary) {
    console.log(`  ${s.key.padEnd(12)} ${s.count < 0 ? "FAILED" : String(s.count).padStart(4) + " 条"}`);
  }
  console.log(`\n输出目录：${path.relative(ROOT, RAW_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

