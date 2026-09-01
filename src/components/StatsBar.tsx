import { siteConfig } from "@site";
import { categories, tools, totalToolCount } from "@/lib/data";
import { cn } from "@/lib/cn";

function latestDate(): string {
  return tools.reduce((max, t) => (t.addedAt > max ? t.addedAt : max), "");
}

/** 统计条：站点名 / 收录工具数 / 分类数 / 最近更新日期 */
export function StatsBar({ className }: { className?: string }) {
  const items = [
    { label: "收录工具", value: `${totalToolCount()}+` },
    { label: "分类", value: `${categories.length}` },
    { label: "最近更新", value: latestDate() || "-" },
  ];
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--text-muted)]", className)}>
      <span className="text-[15px] font-bold text-[var(--text)]">{siteConfig.name}</span>
      {items.map((i) => (
        <span key={i.label}>
          {i.label} <b className="font-semibold text-[var(--text)]">{i.value}</b>
        </span>
      ))}
    </div>
  );
}
