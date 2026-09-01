import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@site";
import { categories, sortHotFirst, toolsOfSubcategory } from "@/lib/data";
import { CategoryIcon } from "@/lib/category-icons";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string; sub: string }>;
}

export function generateStaticParams() {
  return categories.flatMap((c) => c.children.map((s) => ({ slug: c.slug, sub: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, sub } = await params;
  const cat = categories.find((c) => c.slug === slug);
  const child = cat?.children.find((s) => s.slug === sub);
  if (!cat || !child) return { title: "分类不存在" };
  return {
    title: `${child.name}（${child.count} 个）`,
    description: `${siteConfig.name}的${child.name}子分类，收录 ${child.count} 个工具，隶属${cat.name}。`,
    alternates: { canonical: `/c/${cat.slug}/${child.slug}` },
    keywords: [child.name, cat.name, "AI工具"],
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { slug, sub } = await params;
  const cat = categories.find((c) => c.slug === slug);
  const child = cat?.children.find((s) => s.slug === sub);
  if (!cat || !child) notFound();

  const list = sortHotFirst(toolsOfSubcategory(cat.slug, child.slug));

  return (
    <div className="container-x py-5">
      <Breadcrumbs
        items={[
          { label: "首页", href: "/" },
          { label: cat.name, href: `/c/${cat.slug}` },
          { label: child.name },
        ]}
      />

      <div className="panel mb-5 px-5 py-5">
        <h1 className="flex items-center gap-2 text-[20px] font-bold">
          <CategoryIcon name={cat.icon} className="h-5 w-5 text-[var(--brand)]" />
          {child.name}
          <span className="chip">{list.length} 个工具</span>
        </h1>
        <p className="mt-2 text-[13px] text-[var(--text-muted)]">
          {child.name}属于{cat.name}下的子分类，共 {list.length} 个工具。
        </p>
        <nav aria-label="同级子分类" className="mt-4 flex flex-wrap gap-2">
          {cat.children.map((s) => (
            <Link
              key={s.slug}
              href={`/c/${cat.slug}/${s.slug}`}
              className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
                s.slug === child.slug
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              }`}
            >
              {s.name} <span className="opacity-70">{s.count}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="tool-grid">
        {list.map((t) => (
          <ToolCard key={t.id} tool={t} category={cat} />
        ))}
      </div>
    </div>
  );
}
