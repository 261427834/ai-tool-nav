import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@site";
import { SearchBox } from "@/components/SearchBox";
import { HotTabs } from "@/components/HotTabs";
import { CategorySection, SubcategorySection } from "@/components/CategorySection";
import { StatsBar } from "@/components/StatsBar";
import { categories, hotTools, sortHotFirst, sortNewestFirst, tools, toolsOfCategory } from "@/lib/data";

export const metadata: Metadata = {
  title: `${siteConfig.fullName} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const HOT = sortHotFirst(hotTools).slice(0, siteConfig.homepageHotLimit);
const NEWEST = sortNewestFirst(tools).slice(0, siteConfig.homepageHotLimit);
const PREMIUM = categories
  .flatMap((c) => toolsOfCategory(c.slug).filter((t) => t.hot).slice(0, 2))
  .slice(0, siteConfig.homepageHotLimit);

export default function HomePage() {
  return (
    <>
      <div className="header-big px-3.5 pt-6 pb-2 md:px-4">
        <div className="mx-auto max-w-[1900px]">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
          <StatsBar className="mt-4 justify-center" />
        </div>
      </div>

      <div className="container-x py-4">
        <HotTabs hot={HOT} fresh={NEWEST} premium={PREMIUM} />

        {categories.map((c) => (
          <div key={c.slug}>
            <CategorySection category={c} />
            {c.children.map((child) => (
              <SubcategorySection key={child.slug} category={c} child={child} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
