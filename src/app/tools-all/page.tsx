import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@site";
import { categories, sortNewestFirst, tools } from "@/lib/data";
import { CategoryIcon } from "@/lib/category-icons";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `全部 AI 工具（${tools.length} 个）`,
  description: `${siteConfig.name}已收录 ${tools.length} 个 AI 工具，覆盖 ${categories.length} 个分类，可浏览全部条目或按分类筛选。`,
  alternates: { canonical: "/tools-all" },
};

export default function ToolsAllPage() {
  const list = sortNewestFirst(tools);
  return (
    <div className="container-x py-5">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "全部工具" }]} />
      <div className="panel mb-5 px-5 py-5">
        <h1 className="text-[20px] font-bold">全部 AI 工具</h1>
        <p className="mt-2 text-[13px] text-[var(--text-muted)]">
          当前共 {list.length} 个工具，按收录时间倒序展示；使用顶部搜索可快速定位。
        </p>
        <nav aria-label="分类导航" className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1 text-[12.5px] text-[var(--text-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              <CategoryIcon name={c.icon} className="h-[14px] w-[14px]" />
              {c.name}
              <span className="opacity-70">{c.count}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="tool-grid">
        {list.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </div>
  );
}
