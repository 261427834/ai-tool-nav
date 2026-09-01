import Link from "next/link";
import { CategoryIcon } from "@/lib/category-icons";
import { sortHotFirst, toolsOfCategory } from "@/lib/data";
import { siteConfig } from "@site";
import { ToolCard } from "./ToolCard";
import type { Category } from "@/lib/types";

/** 首页分类区块：标题（锚点）+ 更多入口 + 截断卡片网格 */
export function CategorySection({
  category,
  limit = siteConfig.homepageCategoryLimit,
}: {
  category: Category;
  limit?: number;
}) {
  const list = sortHotFirst(toolsOfCategory(category.slug)).slice(0, limit);
  if (!list.length) return null;

  return (
    <section aria-labelledby={`${category.anchor}-title`} className="mb-2">
      <div className="section-anchor mb-3 flex items-end gap-3" id={category.anchor}>
        <h2 className="section-title m-0" id={`${category.anchor}-title`}>
          <CategoryIcon name={category.icon} className="h-[19px] w-[19px] text-[var(--brand)]" />
          {category.name}
        </h2>
        <span className="pb-0.5 text-xs text-[var(--text-muted)]">{category.count}</span>
        <span className="flex-1" />
        <Link
          href={`/c/${category.slug}`}
          className="pb-0.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--brand)]"
        >
          &gt;&gt;更多{category.name}
        </Link>
      </div>
      <div className="tool-grid">
        {list.map((t) => (
          <ToolCard key={t.id} tool={t} category={category} />
        ))}
      </div>
    </section>
  );
}

/** 二级子分类区块（首页在图像/办公大类下内联展示） */
export function SubcategorySection({ category, child }: { category: Category; child: Category["children"][number] }) {
  const list = sortHotFirst(toolsOfCategory(category.slug).filter((t) => t.subcategory === child.slug)).slice(
    0,
    siteConfig.homepageCategoryLimit,
  );
  if (!list.length) return null;
  return (
    <section aria-labelledby={`${child.anchor}-title`} className="mb-2">
      <div className="section-anchor mb-3 flex items-end gap-3" id={child.anchor}>
        <h3 className="section-title m-0 text-[15px]">
          <span className="h-[15px] w-[3px] rounded-full bg-[var(--brand)]" aria-hidden />
          {child.name}
        </h3>
        <span className="pb-0.5 text-xs text-[var(--text-muted)]">{child.count}</span>
        <span className="flex-1" />
        <Link
          href={`/c/${category.slug}/${child.slug}`}
          className="pb-0.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--brand)]"
        >
          &gt;&gt;更多
        </Link>
      </div>
      <div className="tool-grid">
        {list.map((t) => (
          <ToolCard key={t.id} tool={t} category={category} />
        ))}
      </div>
    </section>
  );
}
