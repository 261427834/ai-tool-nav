"use client";

import { useCallback, useEffect, useState } from "react";
import { SIDEBAR_MINI_KEY, THEME_MODES, THEME_STORAGE_KEY, isThemeMode } from "@/lib/theme";
import type { ThemeMode } from "@/lib/theme";

/**
 * 提供主题与侧栏折叠状态；首帧由 layout 内联脚本写入，这里只负责接管后续切换，
 * 并把状态同步到 localStorage + <html> 属性（CSS 变量驱动视觉）。
 */
export function useUiPrefs() {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [mini, setMiniState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const attr = el.getAttribute("data-theme");
    if (isThemeMode(attr)) setThemeState(attr);
    setMiniState(el.getAttribute("data-sidebar-mini") === "1");
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* 隐私模式忽略 */
    }
    const el = document.documentElement;
    el.setAttribute("data-theme", next);
    el.style.colorScheme = next === "dark" ? "dark" : "light";
  }, []);

  const cycleTheme = useCallback(() => {
    const idx = THEME_MODES.indexOf(theme);
    setTheme(THEME_MODES[(idx + 1) % THEME_MODES.length]);
  }, [theme, setTheme]);

  const toggleMini = useCallback(() => {
    setMiniState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_MINI_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (next) document.documentElement.setAttribute("data-sidebar-mini", "1"); else document.documentElement.removeAttribute("data-sidebar-mini");
      return next;
    });
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  useEffect(() => {
    document.documentElement.toggleAttribute("data-drawer", false);
    if (drawerOpen) document.documentElement.setAttribute("data-drawer", "open");
    else document.documentElement.removeAttribute("data-drawer");
  }, [drawerOpen]);

  // Esc 关闭抽屉
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return { theme, setTheme, cycleTheme, mounted, mini, toggleMini, drawerOpen, openDrawer, closeDrawer };
}

export type UiPrefs = ReturnType<typeof useUiPrefs>;

