"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";
import { engineUrlMap } from "@site";
import { SEARCH_ENGINE_KEY } from "@/lib/theme";
import { highlight, scoreTool } from "@/lib/search";
import { categories } from "@/lib/data";
import { ClientToolIcon as ToolIcon } from "./ClientToolIcon";
import type { Tool } from "@/lib/types";

const ENGINES = [
  { key: "site", label: "站内" },
  { key: "baidu", label: "百度" },
  { key: "bing", label: "必应" },
  { key: "google", label: "Google" },
  { key: "sogou", label: "搜狗" },
];

const HOT_WORDS = ["AI 写作", "AI 编程", "文生图", "PPT", "数字人", "翻译", "智能体"];

/** 按需加载的瘦索引类型（public/search-index.json，构建期由脚本生成） */
type IndexItem = Pick<Tool, "id" | "title" | "desc" | "domain" | "icon" | "tags" | "hot"> & {
  category: string;
  subcategory: string | null;
};

let indexPromise: Promise<IndexItem[]> | null = null;

/** 全局只拉一次；失败时返回空数组（下拉降级为无建议，不影响回车跳搜索结果页） */
function loadIndex(): Promise<IndexItem[]> {
  if (!indexPromise) {
    indexPromise = fetch("/search-index.json")
      .then((r) => (r.ok ? (r.json() as Promise<IndexItem[]>) : []))
      .catch(() => []);
  }
  return indexPromise;
}

const CATEGORY_NAME: Record<string, string> = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

/**
 * 大搜索：站内实时过滤下拉（最多 12 条）+ 回车进 /search；
 * 切换引擎后回车 = 新窗口跳外部搜索引擎。引擎选择记忆在 localStorage。
 */
export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [engine, setEngine] = useState("site");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 引擎记忆
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_ENGINE_KEY);
      if (saved && ENGINES.some((e) => e.key === saved)) setEngine(saved);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_ENGINE_KEY, engine);
    } catch {
      /* ignore */
    }
  }, [engine]);

  // 索引在首次聚焦时才拉
  useEffect(() => {
    if (!open || index.length) return;
    let alive = true;
    loadIndex().then((data) => {
      if (alive) setIndex(data);
    });
    return () => {
      alive = false;
    };
  }, [open, index.length]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hits = useMemo(() => {
    const q = query.trim();
    if (engine !== "site" || !q || !index.length) return [];
    return index
      .map((item) => ({ item, score: scoreTool(item, q) }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score || Number(b.item.hot) - Number(a.item.hot) || b.item.id - a.item.id)
      .slice(0, 12);
  }, [engine, query, index]);

  const showPanel = open && engine === "site" && query.trim().length > 0;

  const submit = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return;
      if (engine !== "site") {
        const build = engineUrlMap[engine as keyof typeof engineUrlMap];
        if (build) window.open(build(value), "_blank", "noopener,noreferrer");
        return;
      }
      startTransition(() => router.push(`/search?q=${encodeURIComponent(value)}`));
    },
    [engine, router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && hits.length) {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % hits.length);
      return;
    }
    if (e.key === "ArrowUp" && hits.length) {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? hits.length - 1 : i - 1));
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (showPanel && activeIdx >= 0 && hits[activeIdx]) {
        router.push(`/sites/${hits[activeIdx].item.id}`);
        setOpen(false);
      } else {
        submit(query);
      }
    }
  };

  return (
    <div ref={wrapRef} className="search-wrap" role="search">
      <div className="mb-2 flex flex-wrap items-center justify-center gap-1">
        {ENGINES.map((e) => (
          <button
            key={e.key}
            type="button"
            className="engine-tab"
            data-active={engine === e.key || undefined}
            aria-pressed={engine === e.key}
            onClick={() => {
              setEngine(e.key);
              inputRef.current?.focus();
              setOpen(true);
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
          setOpen(false);
        }}
      >
        <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          placeholder={
            engine === "site"
              ? "搜索已收录的 AI 工具（名称 / 用途 / 标签）"
              : `在${ENGINES.find((e) => e.key === engine)?.label}中搜索`
          }
          aria-label="搜索 AI 工具"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="icon-btn h-8 w-8"
            aria-label="清空搜索"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button type="submit" className="search-btn ml-1" aria-label="搜索" disabled={isPending}>
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </form>

      {showPanel ? (
        <div className="search-panel" aria-label="站内搜索建议">
          {hits.length ? (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {hits.map(({ item }, i) => (
                <li key={item.id}>
                  <Link
                    href={`/sites/${item.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface-2)] ${
                      i === activeIdx ? "bg-[var(--surface-2)]" : ""
                    }`}
                  >
                    <ToolIcon tool={item} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="overflow-clip-1 block text-[13.5px] font-semibold">
                        {highlight(item.title, query).map((seg, k) =>
                          seg.hit ? <mark key={k}>{seg.text}</mark> : <span key={k}>{seg.text}</span>,
                        )}
                      </span>
                      <span className="overflow-clip-1 block text-xs text-[var(--text-muted)]">
                        {highlight(item.desc, query).map((seg, k) =>
                          seg.hit ? <mark key={k}>{seg.text}</mark> : <span key={k}>{seg.text}</span>,
                        )}
                      </span>
                    </span>
                    <span className="chip hidden shrink-0 sm:inline-flex">{CATEGORY_NAME[item.category] ?? item.domain}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-[var(--line)] px-4 py-2 text-xs text-[var(--text-muted)]">
                实时匹配 {hits.length} 条 · 回车查看全部结果
              </li>
            </ul>
          ) : index.length ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">
              没有匹配「{query.trim()}」的工具，换个说法或试试其它引擎
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">正在载入索引…</div>
          )}
        </div>
      ) : null}

      {!query ? (
        <div className="mt-3 hidden flex-wrap items-center justify-center gap-2 text-xs text-[var(--text-muted)] sm:flex">
          <span>热搜：</span>
          {HOT_WORDS.map((w) => (
            <button
              key={w}
              type="button"
              className="rounded-full px-2 py-0.5 transition-colors hover:text-[var(--brand)]"
              onClick={() => {
                setEngine("site");
                setQuery(w);
                startTransition(() => router.push(`/search?q=${encodeURIComponent(w)}`));
              }}
            >
              {w}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}



