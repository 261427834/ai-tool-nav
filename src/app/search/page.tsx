import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@site";
import { searchTools } from "@/lib/search";
import { categories, categoryBySlug, tools } from "@/lib/data";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SearchForm } from "@/components/SearchForm";

interface SearchProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export const metadata: Metadata = {
  title: "站内搜索",
  description: `在 ${siteConfig.name} 中按名称、简介与标签检索已收录的 AI 工具。`,
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: SearchProps) {
  const { q = "", cat } = await searchParams;
  const query = q.trim();
  const scoped = cat ? tools.filter((t) => t.category === cat) : tools;
  const hits = query ? searchTools(scoped, query, 500) : [];

  const catCounts = new Map<string, number>();
  for (const h of hits) catCounts.set(h.tool.category, (catCounts.get(h.tool.category) ?? 0) + 1);

  return (
    <div className="container-x py-5">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "站内搜索" }]} />

      <div className="panel px-5 py-5">
        <h1 className="text-[20px] font-bold">
          {query ? (
            <>
              搜索「<span className="text-[var(--brand)]">{query}</span>」
            </>
          ) : (
            "站内搜索"
          )}
          {query ? <span className="ml-2 text-[13px] font-normal text-[var(--text-muted)]">约 {hits.length} 个结果</span> : null}
        </h1>
        <div className="mt-4 max-w-[760px]">
          <SearchForm initialQuery={query} />
        </div>
        {!query ? (
          <p className="mt-3 text-[13px] text-[var(--text-muted)]">
            输入关键词后按名称、简介、标签匹配；也可以从左侧分类栏直接浏览某个分类下的全部工具。
          </p>
        ) : null}
      </div>

      {query && hits.length === 0 ? (
        <div className="panel mt-5 px-5 py-10 text-center">
          <p className="text-[15px]">
            没有匹配「{query}」的工具
          </p>
          <p className="mt-2 text-[13px] text-[var(--text-muted)]">
            换个关键词，或
            <Link href="/submit" className="mx-1 text-[var(--brand)]">
              提交收录
            </Link>
            让我们补上它。
          </p>
        </div>
      ) : null}

      {hits.length > 0 ? (
        <>
          {catCounts.size > 1 ? (
            <nav aria-label="按分类筛选" className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className={`rounded-full border px-3 py-1 text-[12.5px] ${!cat ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--text-muted)]"}`}
              >
                全部 {hits.length}
              </Link>
              {[...catCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([slug, n]) => {
                  const c = categoryBySlug.get(slug);
                  if (!c) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/search?q=${encodeURIComponent(query)}&cat=${slug}`}
                      className={`rounded-full border px-3 py-1 text-[12.5px] ${cat === slug ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--text-muted)]"}`}
                    >
                      {c.name} {n}
                    </Link>
                  );
                })}
            </nav>
          ) : null}

          <div className="tool-grid mt-4">
            {hits.map(({ tool }) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </>
      ) : null}

      {!query ? (
        <section className="mt-6">
          <h2 className="mb-3 text-[15px] font-semibold text-[var(--text-muted)]">按分类浏览</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-[12.5px] text-[var(--text-muted)] shadow-[var(--shadow-card)] hover:text-[var(--brand)]"
              >
                {c.name} {c.count}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
