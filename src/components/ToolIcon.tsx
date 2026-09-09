import { badgeStyle, initialOf } from "@/lib/badge";
import type { Tool } from "@/lib/types";

/**
 * 服务端图标：字母徽章兜底 + 本地图标（icon 为空 = 无图标文件，只渲染徽章）。
 * 本地 favicon 为小尺寸 PNG，无需 next/image 的 CDN 优化，故使用原生 <img>。
 */
export function ToolIcon({ tool, size = 40 }: { tool: Pick<Tool, "icon" | "title" | "domain">; size?: number }) {
  const letter = initialOf(tool.title);
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-full font-bold text-white uppercase"
        style={{ ...badgeStyle(tool.domain), fontSize: Math.round(size * 0.42) }}
      >
        {letter}
      </span>
      {tool.icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- 本地小图标无需优化
        <img
          src={tool.icon}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-full bg-[var(--surface-2)] object-cover"
        />
      ) : null}
    </span>
  );
}
