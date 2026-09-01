"use client";

import { useEffect, useRef, useState } from "react";
import type { Tool } from "@/lib/types";
import { badgeStyle, initialOf } from "@/lib/badge";

/**
 * 客户端图标组件：服务端先输出字母徽章 + 图片双层（避免水合不一致），
 * 图片加载失败（onError）时隐藏 img 露出徽章。用在需要客户端交互的组件。
 * 本地 favicon 为小尺寸 PNG，无需 next/image 的 CDN 优化，故使用原生 <img>。
 */
export function ClientToolIcon({ tool, size = 40 }: { tool: Pick<Tool, "icon" | "title" | "domain">; size?: number }) {
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMounted(true);
    if (ref.current && ref.current.complete && ref.current.naturalWidth === 0) setFailed(true);
  }, []);

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
      {!failed && mounted ? (
        /* eslint-disable-next-line @next/next/no-img-element -- 本地小图标无需优化 */
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
