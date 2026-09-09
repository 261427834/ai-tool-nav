import { chromium } from "@playwright/test";

const base = "https://ai-tool-nav-410.pages.dev";
const pages = ["/", "/c/code", "/c/image/generate", "/sites/5211", "/search?q=视频", "/submit", "/tools-all", "/about", "/flink", "/not-exist-404"];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

let issues = 0;
for (const p of pages) {
  const errors = [];
  const failed = [];
  const onConsole = (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); };
  const onResp = (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 110)}`); };
  page.on("console", onConsole);
  page.on("response", onResp);
  await page.goto(base + p, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => errors.push("goto: " + e.message.slice(0, 120)));
  await page.waitForTimeout(400);
  page.off("console", onConsole);
  page.off("response", onResp);
  const status = errors.length || failed.length ? "X" : "ok";
  if (errors.length || failed.length) issues++;
  console.log(`[${status}] ${p}`);
  for (const e of errors) console.log("    console.error:", e);
  for (const f of failed) console.log("    failed req:", f);
}
await browser.close();
console.log(issues ? `\n发现 ${issues} 个页面有问题` : "\n所有页面无控制台错误、无失败请求 ✔");
