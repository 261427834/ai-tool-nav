import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@site";
import { categories, sortHotFirst, toolsOfCategory } from "@/lib/data";
import { CategoryIcon } from "@/lib/category-icons";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "分类不存在" };
  return {
    title: `${cat.name}大全（${cat.count} 个）`,
    description: `${siteConfig.name}的${cat.name}分类，收录 ${cat.count} 个工具，支持按热门与收录时间浏览。`,
    alternates: { canonical: `/c/${cat.slug}` },
    keywords: [cat.name, "AI 工具", siteConfig.name],
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const list = sortHotFirst(toolsOfCategory(cat.slug));
  const siblings = categories.filter((c) => c.slug !== cat.slug);

  return (
    <div className="container-x py-5">
      <Breadcrumbs
        items={[{ label: "首页", href: "/" }, { label: "全部工具", href: "/tools-all" }, { label: cat.name }]}
      />

      <div className="panel mb-5 px-5 py-5">
        <h1 className="flex flex-wrap items-center gap-2 text-[20px] font-bold">
          <CategoryIcon name={cat.icon} className="h-5 w-5 text-[var(--brand)]" />
          {cat.name}
          <span className="chip">{list.length} 个工具</span>
        </h1>
        <p className="mt-2 max-w-[900px] text-[13px] leading-relaxed text-[var(--text-muted)]">
          本分类汇总 {list.length} 个{cat.name}相关的 AI 工具，默认热门优先。点击卡片可查看简介与直达官网入口。
        </p>
        {cat.children.length > 0 ? (
          <nav aria-label="子分类" className="mt-4 flex flex-wrap gap-2">
            {cat.children.map((s) => (
              <Link
                key={s.slug}
                href={`/c/${cat.slug}/${s.slug}`}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-[12.5px] text-[var(--text-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {s.name} <span className="opacity-70">{s.count}</span>
              </Link>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="tool-grid">
        {list.map((t) => (
          <ToolCard key={t.id} tool={t} category={cat} />
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold text-[var(--text-muted)]">其它分类</h2>
        <div className="flex flex-wrap gap-2">
          {siblings.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5 text-[12.5px] text-[var(--text-muted)] shadow-[var(--shadow-card)] transition-colors hover:text-[var(--brand)]"
            >
              <CategoryIcon name={c.icon} className="h-[15px] w-[15px]" />
              {c.name}
              <span className="opacity-60">{c.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
