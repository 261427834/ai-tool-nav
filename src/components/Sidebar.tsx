"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@site";
import { categories } from "@/lib/data";
import { CategoryIcon } from "@/lib/category-icons";
import { SiteMark } from "./SiteMark";
import { useUi } from "./ui-prefs";

/**
 * 左侧分类栏。
 * mode="anchor" —— 首页：点击滚动到对应区块（锚点），并用 IntersectionObserver 反向高亮；
 * mode="route"  —— 其它页面：点击跳到 /c/[slug] 分类页。
 */
/**
 * 侧栏模式由路由决定：
 * 首页（pathname === "/"）用锚点滚动 + 滚动高亮；其它页面跳分类页。
 */
function useSidebarMode(): "anchor" | "route" {
  const pathname = usePathname();
  return pathname === "/" ? "anchor" : "route";
}

export function Sidebar() {
  const mode = useSidebarMode();
  const { drawerOpen, closeDrawer } = useUi();
  const [active, setActive] = useState("");

  useEffect(() => {
    if (mode !== "anchor") return;
    const nodes = categories
      .map((c) => document.getElementById(c.anchor))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // 顶栏高 54px + 区块标题留白：把「可见带」压到视口上方一小段
      { rootMargin: "-88px 0px -68% 0px", threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [mode]);

  return (
    <aside
      id="sidebar"
      className="sidebar"
      aria-label="工具分类导航"
      onClick={(e) => {
        if (drawerOpen && (e.target as HTMLElement).closest("a")) closeDrawer();
      }}
    >
      <div className="sidebar-logo-box flex h-[62px] shrink-0 items-center gap-2 border-b border-[var(--line)] px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2" title="回到首页">
          <SiteMark />
          <span className="mini-hide overflow-clip-1 text-[15px] font-bold tracking-tight">{siteConfig.name}</span>
        </Link>
      </div>

      <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-2 no-scrollbar">
        <ul>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={mode === "anchor" ? `#${c.anchor}` : `/c/${c.slug}`}
                className="sidebar-link"
                data-active={mode === "anchor" && active === c.anchor ? true : undefined}
                title={c.name}
              >
                <CategoryIcon name={c.icon} className="h-[18px] w-[18px] shrink-0" />
                <span className="mini-hide min-w-0 flex-1 truncate">{c.name}</span>
                <span className="mini-hide text-[11px] text-[var(--text-muted)]">{c.count}</span>
              </Link>
              {c.children.length > 0 ? (
                <ul className="sidebar-sub">
                  {c.children.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={mode === "anchor" ? `#${s.anchor}` : `/c/${c.slug}/${s.slug}`}
                        className="sidebar-link"
                        data-active={mode === "anchor" && active === s.anchor ? true : undefined}
                        title={s.name}
                      >
                        <span className="mini-hide min-w-0 flex-1 truncate">{s.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

