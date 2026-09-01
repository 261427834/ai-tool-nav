import Link from "next/link";
import { ToolIcon } from "./ToolIcon";
import type { Tool } from "@/lib/types";
import type { Category } from "@/lib/types";

interface ToolCardProps {
  tool: Tool;
  /** 详情页链接模式：默认 /sites/[id] */
  detailHref?: string;
  category?: Category;
}

/**
 * 站点卡片：整卡指向工具详情页（站内可索引），详情页内再提供直达官网按钮。
 * title 属性承担原站 tooltip 的语义。
 */
export function ToolCard({ tool, detailHref, category }: ToolCardProps) {
  const href = detailHref ?? `/sites/${tool.id}`;
  return (
    <div className="mb-2 px-1">
      <Link
        href={href}
        className="tool-card"
        title={tool.desc || tool.title}
        aria-label={`${tool.title}${tool.desc ? ` - ${tool.desc}` : ""}`}
      >
        <ToolIcon tool={tool} />
        <span className="min-w-0 flex-1">
          <span className="tool-title overflow-clip-1 block">{tool.title}</span>
          <span className="overflow-clip-1 mt-0.5 block text-xs text-[var(--text-muted)]">{tool.desc}</span>
        </span>
        {category ? <span className="sr-only">分类：{category.name}</span> : null}
      </Link>
    </div>
  );
}

/** 直达外链卡片（用于分类页“外部访问”场景与搜索结果里的快捷入口） */
export function ToolLinkCard({ tool }: { tool: Tool }) {
  return (
    <div className="mb-2 px-1">
      <a href={tool.url} target="_blank" rel="nofollow noopener noreferrer" className="tool-card" title={tool.desc}>
        <ToolIcon tool={tool} />
        <span className="min-w-0 flex-1">
          <span className="tool-title overflow-clip-1 block">{tool.title}</span>
          <span className="overflow-clip-1 mt-0.5 block text-xs text-[var(--text-muted)]">{tool.desc}</span>
        </span>
      </a>
    </div>
  );
}
