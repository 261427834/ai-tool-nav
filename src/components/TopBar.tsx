"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Info, Megaphone, Menu, Send, Sparkles } from "lucide-react";
import { SiteLogo } from "./SiteLogo";
import { useUi } from "./ui-prefs";

const NAV = [
  { label: "提交 AI 工具", href: "/submit", Icon: Send },
  { label: "全部工具", href: "/tools-all", Icon: Sparkles },
  { label: "广告合作", href: "/ads", Icon: Megaphone },
  { label: "关于我们", href: "/about", Icon: Info },
];

/** 顶栏：移动端汉堡 + logo + 侧栏 mini 三线折叠按钮 + 站内菜单 */
export function TopBar() {
  const { openDrawer, mini, toggleMini } = useUi();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="top-bar">
      <div className="container-x flex h-[54px] items-center gap-2">
        <button type="button" onClick={openDrawer} className="icon-btn md:hidden" aria-label="打开分类导航">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="md:hidden" title="回到首页">
          <SiteLogo height={26} />
        </Link>

        <button
          type="button"
          onClick={toggleMini}
          className="mini-btn hidden md:inline-flex"
          aria-label={mini ? "展开侧栏" : "收起侧栏"}
          title={mini ? "展开侧栏" : "收起侧栏"}
          aria-pressed={mini}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path className="line-1" d="M0 40h62c18 0 18-20-17 5L31 55" />
            <path className="line-2" d="M0 50h80" />
            <path className="line-1" d="M0 60h62c18 0 18 20-17-5L31 45" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <nav aria-label="站内页面" className="hidden items-center gap-1 sm:flex">
            {NAV.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-[var(--text-muted)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="icon-btn sm:hidden"
            aria-label="更多菜单"
            aria-expanded={openMenu}
            onClick={() => setOpenMenu((v) => !v)}
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${openMenu ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {openMenu ? (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] sm:hidden">
          <div className="container-x grid grid-cols-2 gap-2 py-3">
            {NAV.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[13px]"
              >
                <Icon className="h-4 w-4 text-[var(--brand)]" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
