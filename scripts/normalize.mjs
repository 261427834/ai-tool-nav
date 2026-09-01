/**
 * 归一化：data/raw/*.json -> data/categories.json + data/tools.json
 *
 * 用法：
 *   npm run normalize            # 生成/覆盖 data/*.json 并打印报告
 *   npm run check:data           # 只校验（CI 用，非 0 退出即失败）
 *
 * 重要：来源站的工具简介属于他人撰写文案，本脚本**不搬运**这些文字，
 * 只保留事实性元数据（名称 / 官网 / 域名 / 分类 / 热门标记），简介由
 *  1) data/desc-overrides.json 中我们自行撰写的描述，或
 *  2) 按分类生成的中性描述
 * 得到。人工补充简介只需编辑 overrides 文件，重跑本脚本即可。
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, RAW_DIR, CATEGORIES, ANCHOR_MAP, CATEGORY_SLUGS } from "./lib.mjs";

const VALIDATE_ONLY = process.argv.includes("--validate");
const TODAY = new Date().toISOString().slice(0, 10);

/** 需要剥离的推广/来源参数 */
const TRACKING_PARAMS = [
  "utm_source","utm_medium","utm_term","utm_campaign","utm_content",
  "from","ly","src","ref","refer","source","spm","share","invitecode","channel","traceid",
  "channelcode","passagecode","utmsource","ssref","via","sid","rewardful","aff","affiliate","promo","campaign",
];

/**
 * 分类兜底：来源站首页「热门工具」区块的卡片不带 term-* 锚点，
 * 用名称里的关键词推断一级分类（数组顺序即优先级）。
 */
const KEYWORD_CATEGORY = [
  [/论文|paper|学术|开题|文献/i, "paper"],
  [/编程|代码|coder?|ide|copilot|cursor/i, "code"],
  [/绘画|图像|图片|生图|抠图|插画|photo|image|logo/i, "image"],
  [/视频|短视频|数字人|video/i, "video"],
  [/音频|配音|音乐|语音|播客|audio|music/i, "audio"],
  [/写作|文案|文章|改写|润色|续写|write/i, "write"],
  [/翻译|translate/i, "translate"],
  [/ppt|幻灯片|思维导图|表格|文档|会议|办公|excel/i, "office"],
  [/对话|聊天|助手|chat|bot/i, "chat"],
  [/智能体|agent/i, "agent"],
  [/检测|降重|查重/i, "detect"],
  [/提示|指令|prompt/i, "prompt"],
  [/模型|训练|大模型|llm/i, "model"],
  [/框架|sdk|langchain/i, "framework"],
  [/学习|课程|教程|学院|course/i, "learn"],
];

/** 中性简介模板：只用「方向」这类由分类本身保证的事实 */
const DESC_TPL = {
  write: (n) => `${n}：AI 写作方向的在线工具，可从本站直达官网使用。`,
  paper: (n) => `${n}：面向论文与学术写作的 AI 工具，点击前往官网。`,
  image: (n) => `${n}：AI 图像方向的在线工具，支持从本站直达官网。`,
  office: (n) => `${n}：AI 办公方向的在线工具，点击前往官网使用。`,
  code: (n) => `${n}：AI 编程与开发辅助工具，可从本站直达官网。`,
  design: (n) => `${n}：AI 设计方向的在线工具，点击前往官网。`,
  chat: (n) => `${n}：对话式 AI 助手类产品，可从本站直达官网。`,
  video: (n) => `${n}：AI 视频方向的在线工具，点击前往官网使用。`,
  audio: (n) => `${n}：AI 音频与语音方向的在线工具，可从本站直达官网。`,
  translate: (n) => `${n}：AI 翻译方向的在线工具，点击前往官网。`,
  learn: (n) => `${n}：AI 学习与课程类网站，可从本站直达官网。`,
  agent: (n) => `${n}：AI 智能体类产品，点击前往官网了解。`,
  detect: (n) => `${n}：内容检测与查重类 AI 工具，可从本站直达官网。`,
  prompt: (n) => `${n}：AI 提示词资源与写作辅助工具，点击前往官网。`,
  model: (n) => `${n}：AI 模型与训练相关平台，可从本站直达官网。`,
  framework: (n) => `${n}：AI 开发框架与工程化工具，点击前往官网。`,
};


function cleanTitle(t) {
  return (t ?? "").replace(/\s*\|\s*AI工具导航站\s*$/g, "").replace(/\s{2,}/g, " ").trim();
}

function guessCategory(item) {
  const hay = cleanTitle(item.title);
  for (const [re, slug] of KEYWORD_CATEGORY) if (re.test(hay)) return slug;
  return null;
}

function cleanUrl(raw) {
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  for (const p of [...u.searchParams.keys()]) {
    const key = p.toLowerCase().replace(/[-_]/g, "");
    if (TRACKING_PARAMS.includes(key) || key === "utmsource" || key.startsWith("utm")) u.searchParams.delete(p);
  }
  u.hash = "";
  return u.toString().replace(/\?$/, "").replace(/&$/, "");
}

/** 来源站自身域名（跳转页/投稿页等）不收录 */
const BLOCKED_DOMAINS = new Set(["ai-nav.net", "www.ai-nav.net"]);
function isBlockedDomain(url) {
  try {
    return BLOCKED_DOMAINS.has(new URL(url).hostname.replace(/^www\./, ""));
  } catch {
    return false;
  }
}
function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** 图标文件名：域名 + id，唯一且稳定 */
function iconKeyFor(id, domain) {
  const base = (domain || `site-${id}`).replace(/[^a-z0-9.-]/gi, "_");
  return `${base}__${id}`;
}

function slugify(title, id) {
  const ascii = cleanTitle(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii.length >= 3 ? ascii.slice(0, 48) : `site-${id}`;
}

/** 标签：只来自分类归属本身（不搬运来源站标签文案） */
function tagsFor(categorySlug, subcategorySlug) {
  const tags = new Set();
  const parent = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!parent) return [];
  tags.add(parent.name.replace(/^AI\s*/, "").replace(/工具$/, ""));
  if (subcategorySlug) tags.add(subcategorySlug.replace(/-/g, " "));
  return [...tags].slice(0, 3);
}

async function readRaw() {
  const keys = new Set(CATEGORIES.map((c) => c.slug).concat(["home"]));
  const all = [];
  const missing = [];
  for (const key of keys) {
    try {
      const json = JSON.parse(await readFile(path.join(RAW_DIR, `${key}.json`), "utf8"));
      // 只取结构化字段，显式丢弃来源站的 desc / tooltip 文本
      all.push(
        ...json.items.map((it) => ({
          source: key,
          id: it.id,
          title: it.title,
          dataUrl: it.dataUrl,
          cardHref: it.cardHref,
          termId: it.termId,
          iconSrc: it.iconSrc,
          isHot: it.isHot,
        })),
      );
    } catch {
      missing.push(key);
    }
  }
  return { all, missing };
}

async function main() {
  const { all: rawItems, missing } = await readRaw();
  if (!rawItems.length) {
    console.error("data/raw 为空，请先运行 npm run crawl");
    process.exit(1);
  }

  let overrides = {};
  try {
    overrides = JSON.parse(await readFile(path.join(DATA_DIR, "desc-overrides.json"), "utf8"));
  } catch {
    console.log("（无 data/desc-overrides.json，全部使用模板简介）");
  }

  // 按 id 去重；分类页数据优先于首页
  const byId = new Map();
  for (const it of rawItems) {
    const prev = byId.get(it.id);
    if (!prev || (prev.source === "home" && it.source !== "home")) byId.set(it.id, it);
  }

  const hotIds = new Set(rawItems.filter((i) => i.isHot).map((i) => i.id));
  const tools = [];
  const problems = [];

  for (const it of byId.values()) {
    const hit = ANCHOR_MAP.get(it.termId);
    const guessed = guessCategory(it);
    const categorySlug = hit?.category ?? (CATEGORY_SLUGS.has(it.source) ? it.source : guessed);
    const inferredByKeyword = !hit?.category && !CATEGORY_SLUGS.has(it.source) && Boolean(guessed);
    if (!categorySlug) {
      problems.push(`#${it.id} ${cleanTitle(it.title)}：无法判定分类`);
      continue;
    }
    const subcategorySlug = hit?.subcategory ?? null;
    const url = cleanUrl(it.dataUrl || it.cardHref);
    if (!url) {
      problems.push(`#${it.id} ${cleanTitle(it.title)}：缺少有效外链`);
      continue;
    }
    const domain = domainOf(url);
    const title = cleanTitle(it.title);
    if (isBlockedDomain(url)) {
      problems.push(`#${it.id} ${title || "(无名称)"}：指向来源站自身，不收录`);
      continue;
    }
    if (!domain || !title) {
      problems.push(`#${it.id}：名称或域名解析失败`);
      continue;
    }
    const parent = CATEGORIES.find((c) => c.slug === categorySlug);
    const subName = subcategorySlug
      ? parent?.children?.find((s) => s.slug === subcategorySlug)?.name
      : null;
    const custom = overrides[String(it.id)]?.trim();
    const desc =
      custom ||
      (subName
        ? `${title}：${subName}相关的 AI 工具，可从本站直达官网。`
        : DESC_TPL[categorySlug]?.(title) ?? `${title}：AI 方向在线工具，可从本站直达官网。`);

    tools.push({
      id: it.id,
      slug: slugify(title, it.id),
      title,
      desc: desc.slice(0, 120),
      descSource: custom ? "manual" : "template",
      url,
      domain,
      icon: `/icons/${iconKeyFor(it.id, domain)}.png`,
      category: categorySlug,
      subcategory: subcategorySlug,
      tags: tagsFor(categorySlug, subcategorySlug),
      hot: hotIds.has(it.id),
      views: 0,
      addedAt: TODAY,
      updatedAt: TODAY,
      intro: overrides[String(it.id)] ? null : null,
      screenshots: null,
      iconSource: it.iconSrc || "",
      _inferred: inferredByKeyword ? "keyword" : undefined,
    });
  }

  tools.sort((a, b) => {
    const ca = CATEGORIES.findIndex((c) => c.slug === a.category);
    const cb = CATEGORIES.findIndex((c) => c.slug === b.category);
    if (ca !== cb) return ca - cb;
    if (a.subcategory !== b.subcategory) return (a.subcategory ?? "").localeCompare(b.subcategory ?? "");
    return Number(b.hot) - Number(a.hot) || b.id - a.id;
  });

  const seen = new Map();
  for (const t of tools) {
    const n = seen.get(t.slug) ?? 0;
    seen.set(t.slug, n + 1);
    if (n > 0) t.slug = `${t.slug}-${t.id}`;
  }

  const counts = {};
  for (const t of tools) {
    counts[t.category] = (counts[t.category] ?? 0) + 1;
    if (t.subcategory) counts[`${t.category}/${t.subcategory}`] = (counts[`${t.category}/${t.subcategory}`] ?? 0) + 1;
  }
  const categories = CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    anchor: c.anchor,
    icon: c.icon,
    order: c.order,
    count: counts[c.slug] ?? 0,
    children: (c.children ?? []).map((s) => ({ ...s, count: counts[`${c.slug}/${s.slug}`] ?? 0 })),
  })).filter((c) => c.count > 0);

  const errs = validate(tools, categories);

  if (VALIDATE_ONLY) {
    report(tools, categories, problems, missing, errs, true);
    if (errs.length) process.exit(1);
    return;
  }

  // 注意：iconSource（第三方站点原始图标地址）只保留在 data/raw/，不进入发布产物
  const publicTools = tools.map(({ _inferred, iconSource: _iconSource, ...rest }) => rest);
  await writeFile(path.join(DATA_DIR, "tools.json"), JSON.stringify(publicTools, null, 2) + "\n", "utf8");
  await writeFile(path.join(DATA_DIR, "categories.json"), JSON.stringify(categories, null, 2) + "\n", "utf8");
  report(tools, categories, problems, missing, errs, false);
  console.log(
    `\n  简介：人工 ${tools.filter((t) => t.descSource === "manual").length} 条 / 模板 ${tools.filter((t) => t.descSource === "template").length} 条（编辑 data/desc-overrides.json 可补充）`,
  );
}

function validate(tools, categories) {
  const errs = [];
  const catSet = new Set(categories.map((c) => c.slug));
  const ids = new Set();
  const slugs = new Set();
  for (const t of tools) {
    if (!Number.isFinite(t.id)) errs.push("条目缺少合法 id");
    if (ids.has(t.id)) errs.push(`id 重复：${t.id}`);
    ids.add(t.id);
    if (slugs.has(t.slug)) errs.push(`slug 重复：${t.slug}`);
    slugs.add(t.slug);
    if (!t.title) errs.push(`#${t.id} 名称为空`);
    if (!t.desc) errs.push(`#${t.id} 简介为空`);
    if (!catSet.has(t.category)) errs.push(`#${t.id} 分类不存在：${t.category}`);
    const parent = categories.find((c) => c.slug === t.category);
    if (t.subcategory && !parent?.children?.some((s) => s.slug === t.subcategory)) {
      errs.push(`#${t.id} 子分类不存在：${t.category}/${t.subcategory}`);
    }
    try {
      const u = new URL(t.url);
      if (!/^https?:$/.test(u.protocol)) errs.push(`#${t.id} 协议异常：${u.protocol}`);
    } catch {
      errs.push(`#${t.id} URL 非法：${t.url}`);
    }
  }
  return errs;
}

function report(tools, categories, problems, missing, errs, readOnly) {
  console.log(readOnly ? "校验 data/*.json" : "生成 data/*.json");
  if (missing.length) console.log(`  ⚠ 缺少 raw 源：${missing.join(", ")}（这些分类将依赖首页分区数据）`);
  console.log(`  分类：${categories.length} 个（子分类 ${categories.reduce((n, c) => n + c.children.length, 0)} 个）`);
  const byCat = new Map();
  for (const t of tools) {
    const k = t.subcategory ? `${t.category}/${t.subcategory}` : t.category;
    byCat.set(k, (byCat.get(k) ?? 0) + 1);
  }
  console.log(
    `  条目：${tools.length} 条（热门 ${tools.filter((t) => t.hot).length}；关键词兜底分类 ${tools.filter((t) => t._inferred).length}）`,
  );
  for (const c of categories) {
    const subs = c.children.map((s) => `${s.slug}:${byCat.get(`${c.slug}/${s.slug}`) ?? 0}`).join("  ");
    console.log(`    ${c.slug.padEnd(11)} ${String(c.count).padStart(4)}${subs ? `   [${subs}]` : ""}`);
  }
  if (problems.length) {
    console.log(`\n  跳过 ${problems.length} 条：`);
    for (const p of problems.slice(0, 12)) console.log(`    - ${p}`);
    if (problems.length > 12) console.log(`    … 其余 ${problems.length - 12} 条`);
  }
  if (errs.length) {
    console.log(`\n  校验错误 ${errs.length} 条：`);
    for (const e of errs.slice(0, 20)) console.log(`    ! ${e}`);
    if (errs.length > 20) console.log(`    … 其余 ${errs.length - 20} 条`);
  } else {
    console.log("\n  校验通过 ✔");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});





