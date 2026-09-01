"use client";

import Link from "next/link";
import { useState } from "react";
import { Flame, History, Star } from "lucide-react";
import { ToolCard } from "./ToolCard";
import type { Tool } from "@/lib/types";

type TabKey = "hot" | "new" | "premium";

const TABS: { key: TabKey; label: string; Icon: typeof Flame }[] = [
  { key: "hot", label: "热门工具", Icon: Flame },
  { key: "new", label: "最新收录", Icon: History },
  { key: "premium", label: "编辑推荐", Icon: Star },
];

/** 首页顶部「热门工具 / 最新收录 / 编辑推荐」切换（客户端切换，无刷新） */
export function HotTabs({
  hot,
  fresh,
  premium,
}: {
  hot: Tool[];
  fresh: Tool[];
  premium: Tool[];
}) {
  const [tab, setTab] = useState<TabKey>("hot");
  const data = tab === "hot" ? hot : tab === "new" ? fresh : premium;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            data-active={tab === key || undefined}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-all"
            style={
              tab === key
                ? {
                    color: "#fff",
                    background: "linear-gradient(135deg, var(--brand), #7c3aed)",
                    boxShadow: "0 8px 20px -12px rgba(79,70,229,.9)",
                  }
                : { color: "var(--text-muted)", background: "var(--surface)" }
            }
            aria-pressed={tab === key}
          >
            <Icon className="h-[15px] w-[15px]" />
            {label}
          </button>
        ))}
        <span className="flex-1" />
        <Link href="/tools-all" className="shrink-0 whitespace-nowrap text-xs text-[var(--text-muted)] hover:text-[var(--brand)]">
          &gt;&gt;浏览全部工具
        </Link>
      </div>

      <div className="tool-grid" aria-live="polite">
        {data.map((t) => (
          <ToolCard key={`${tab}-${t.id}`} tool={t} />
        ))}
      </div>
    </div>
  );
}
