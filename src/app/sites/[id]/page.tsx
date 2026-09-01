import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, Hash, Tag, TrendingUp } from "lucide-react";
import { siteConfig } from "@site";
import { categoryBySlug, relatedTools, toolById, tools } from "@/lib/data";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopyUrlButton } from "@/components/CopyUrlButton";
import { CategoryIcon } from "@/lib/category-icons";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return tools.map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tool = toolById.get(Number(id));
  if (!tool) return { title: "工具不存在" };
  const cat = categoryBySlug.get(tool.category);
  const title = `${tool.title} - ${tool.desc.slice(0, 40)}`;
  const description = `${tool.desc} 收录于${cat?.name ?? "AI 工具"}分类，共 ${tool.tags.length} 个标签。通过 ${siteConfig.name} 查看简介并直达官网。`;
  return {
    title,
    description,
    keywords: [tool.title, ...(cat ? [cat.name] : []), ...tool.tags],
    alternates: { canonical: `/sites/${tool.id}` },
    openGraph: { title, description, type: "article" },
  };
}

export default async function SiteDetailPage({ params }: Props) {
  const { id } = await params;
  const tool = toolById.get(Number(id));
  if (!tool) notFound();

  const cat = categoryBySlug.get(tool.category);
  const child = cat?.children.find((s) => s.slug === tool.subcategory);
  const related = relatedTools(tool, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.desc,
    url: `${siteConfig.url}/sites/${tool.id}`,
    applicationCategory: cat?.name ?? "AI 工具",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: cat?.name ?? "分类", item: `${siteConfig.url}/c/${cat?.slug}` },
      ...(child ? [{ "@type": "ListItem", position: 3, name: child.name, item: `${siteConfig.url}/c/${cat?.slug}/${child.slug}` }] : []),
      { "@type": "ListItem", position: child ? 4 : 3, name: tool.title, item: `${siteConfig.url}/sites/${tool.id}` },
    ],
  };

  return (
    <div className="container-x py-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Breadcrumbs
        items={[
          { label: "首页", href: "/" },
          { label: cat?.name ?? "分类", href: `/c/${cat?.slug}` },
          ...(child ? [{ label: child.name, href: `/c/${cat!.slug}/${child.slug}` }] : []),
          { label: tool.title },
        ]}
      />

      <article className="panel px-5 py-6 md:px-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ToolIcon tool={tool} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-bold leading-snug">{tool.title}</h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{tool.desc}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {cat ? (
                <Link
                  href={`/c/${cat.slug}`}
                  className="flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[var(--brand)]"
                >
                  <CategoryIcon name={cat.icon} className="h-[14px] w-[14px]" />
                  {cat.name}
                </Link>
              ) : null}
              {child ? (
                <Link
                  href={`/c/${cat!.slug}/${child.slug}`}
                  className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[var(--text-muted)] hover:text-[var(--brand)]"
                >
                  {child.name}
                </Link>
              ) : null}
              {tool.tags.map((t) => (
                <span key={t} className="chip flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {t}
                </span>
              ))}
              {tool.hot ? (
                <span
                  className="chip flex items-center gap-1"
                  style={{ color: "var(--brand)", background: "var(--brand-soft)" }}
                >
                  <TrendingUp className="h-3 w-3" />
                  热门
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={tool.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="btn-brand"
            aria-label={`前往 ${tool.title} 官网`}
          >
            <ExternalLink className="h-4 w-4" />
            直达官网
          </a>
          <CopyUrlButton tool={tool} />
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-[var(--line)] pt-5 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
          <Meta label="官方域名" value={tool.domain} href={tool.url} />
          <Meta label="所属分类" value={cat ? `${cat.name}${child ? ` / ${child.name}` : ""}` : "-"} />
          <Meta label="标签" value={tool.tags.length ? tool.tags.join("、") : "暂无"} icon={<Hash className="h-3.5 w-3.5" />} />
          <Meta label="收录时间" value={tool.addedAt} icon={<CalendarDays className="h-3.5 w-3.5" />} />
          <Meta label="最近更新" value={tool.updatedAt} icon={<CalendarDays className="h-3.5 w-3.5" />} />
          <Meta label="浏览量" value={tool.views > 0 ? String(tool.views) : "暂无统计"} />
        </dl>

        {tool.intro ? (
          <section className="mt-6 border-t border-[var(--line)] pt-5">
            <h2 className="mb-2 text-[15px] font-semibold">工具介绍</h2>
            <p className="text-[13.5px] leading-relaxed text-[var(--text-muted)]">{tool.intro}</p>
          </section>
        ) : null}

        <p className="mt-6 text-xs leading-relaxed text-[var(--text-muted)]">
          提示：本站仅做信息聚合与检索，工具的服务与收费由提供方负责。链接失效或信息有误可{" "}
          <Link href="/submit" className="text-[var(--brand)]">
            提交反馈
          </Link>
          。
        </p>
      </article>

      {related.length ? (
        <section className="mt-7">
          <h2 className="section-title mb-3 text-[16px]">
            <CategoryIcon name={cat?.icon ?? "images"} className="h-4 w-4 text-[var(--brand)]" />
            同分类推荐
          </h2>
          <div className="tool-grid">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Meta({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd className="overflow-clip-1 font-medium">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="text-[var(--brand)] hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="flex items-center gap-1.5">
            {icon}
            {value}
          </span>
        )}
      </dd>
    </div>
  );
}

