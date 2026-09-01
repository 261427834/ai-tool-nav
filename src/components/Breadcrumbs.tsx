import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** 面包屑（详情页/分类页/静态页共用），同时输出结构化数据由页面自行处理 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="面包屑" className="mb-4 flex flex-wrap items-center gap-1 text-[13px] text-[var(--text-muted)]">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${it.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden /> : null}
            {it.href && !last ? (
              <Link href={it.href} className="transition-colors hover:text-[var(--brand)]">
                {it.label}
              </Link>
            ) : (
              <span className={last ? "text-[var(--text)]" : undefined}>{it.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
