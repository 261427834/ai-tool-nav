import type { MetadataRoute } from "next";
import { siteConfig } from "@site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/search?"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
