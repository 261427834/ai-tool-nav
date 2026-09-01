import type { MetadataRoute } from "next";
import { siteConfig } from "@site";
import { categories, tools } from "@/lib/data";

/** 首页 + 全部分类页 + 全部工具详情页 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const today = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: base,
    lastModified: today,
    changeFrequency: "daily",
    priority: 1,
  };
  const cats: MetadataRoute.Sitemap = categories.flatMap((c) => [
    {
      url: `${base}/c/${c.slug}`,
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...c.children.map((s) => ({
      url: `${base}/c/${c.slug}/${s.slug}`,
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);
  const details: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${base}/sites/${t.id}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));
  const statics: MetadataRoute.Sitemap = [
    "/submit",
    "/about",
    "/ads",
    "/disclaimer",
    "/flink",
    "/tools-all",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [home, ...statics, ...cats, ...details];
}
