"use client";

import { useEffect, useRef, useState } from "react";
import type { Tool } from "@/lib/types";
import { badgeStyle, initialOf } from "@/lib/badge";

/**
 * 客户端图标组件（搜索下拉等交互场景用）：
 * 字母徽章兜底 + 本地图标；icon 为空或加载失败时只显示徽章。
 */
export function ClientToolIcon({ tool, size = 40 }: { tool: Pick<Tool, "icon" | "title" | "domain">; size?: number }) {
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMounted(true);
    if (ref.current && ref.current.complete && ref.current.naturalWidth === 0) setFailed(true);
  }, []);

  const showImg = Boolean(tool.icon) && mounted && !failed;

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
        {initialOf(tool.title)}
      </span>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- 本地小图标无需优化
        <img
          ref={ref}
          src={tool.icon}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-full bg-[var(--surface-2)] object-cover"
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
}
