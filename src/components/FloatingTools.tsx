"use client";

import { ArrowUp, Moon, Sun, CloudSun } from "lucide-react";
import { useEffect, useState } from "react";
import { NEXT_THEME, THEME_LABEL } from "@/lib/theme";
import { useUi } from "./ui-prefs";

/** 右下角悬浮工具：回到顶部（滚动 >300px）+ 主题三态切换 */
export function FloatingTools() {
  const { theme, setTheme } = useUi();
  const [showUp, setShowUp] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowUp(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const Icon = theme === "dark" ? Moon : theme === "grey" ? CloudSun : Sun;

  return (
    <div className="float-tools">
      <button
        type="button"
        className="float-btn"
        data-hidden={!showUp || undefined}
        aria-label="回到顶部"
        title="回到顶部"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="float-btn"
        aria-label={THEME_LABEL[theme]}
        title={`${THEME_LABEL[theme]}（点击切换）`}
        onClick={() => setTheme(NEXT_THEME[theme])}
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
}
