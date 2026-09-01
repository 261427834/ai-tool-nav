import { badgeStyle, initialOf } from "@/lib/badge";
import type { Tool } from "@/lib/types";

/**
 * 服务端图标：字母徽章 + 本地图片双层输出（图片缺失/失败时露出字母徽章）。
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
      {/* eslint-disable-next-line @next/next/no-img-element -- 本地小图标无需优化 */}
      <img
        src={tool.icon}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full rounded-full bg-[var(--surface-2)] object-cover"
      />
    </span>
  );
}
