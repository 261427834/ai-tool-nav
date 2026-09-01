import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@site";
import { staticPages } from "@/lib/data";
import { Breadcrumbs } from "./Breadcrumbs";
import { MarkdownLite } from "./MarkdownLite";

/** 静态内容页（关于/广告/免责/友链）的统一渲染：文案来自 data/static-pages.json */
export function StaticPageView({ slug }: { slug: string }) {
  const page = staticPages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <div className="container-x py-5">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: page.heading }]} />
      <article className="panel px-5 py-6 md:px-8 md:py-8">
        <h1 className="text-[22px] font-bold">{page.heading}</h1>
        <p className="mt-2 text-[13px] text-[var(--text-muted)]">{page.description}</p>
        <MarkdownLite body={page.body} className="mt-5 max-w-[860px] text-[13.5px]" />
        <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5 text-[13px]">
          {staticPages
            .filter((p) => p.slug !== slug)
            .map((p) => (
              <a
                key={p.slug}
                href={`/${p.slug}`}
                className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[var(--text-muted)] transition-colors hover:text-[var(--brand)]"
              >
                {p.heading}
              </a>
            ))}
          <a
            href={`mailto:${siteConfig.email}`}
            className="rounded-full px-3 py-1 font-medium text-[var(--brand)]"
          >
            {siteConfig.email}
          </a>
        </div>
      </article>
    </div>
  );
}

export function staticMetadata(slug: string, path: string): Metadata {
  const page = staticPages.find((p) => p.slug === slug);
  return {
    title: page?.title ?? "页面",
    description: page?.description ?? siteConfig.description,
    alternates: { canonical: `/${path}` },
  };
}
