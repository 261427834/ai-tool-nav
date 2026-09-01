/** 主题与 UI 偏好的 localStorage key；集中定义，防止各组件拼写漂移 */
export const THEME_STORAGE_KEY = "aiNav.themeMode";
export const SIDEBAR_MINI_KEY = "aiNav.sidebarMini";
export const SEARCH_ENGINE_KEY = "aiNav.searchEngine";

export const THEME_MODES = ["light", "grey", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_LABEL: Record<ThemeMode, string> = {
  light: "日间模式",
  grey: "灰色模式",
  dark: "夜间模式",
};

export const NEXT_THEME: Record<ThemeMode, ThemeMode> = {
  light: "grey",
  grey: "dark",
  dark: "light",
};

export function isThemeMode(v: unknown): v is ThemeMode {
  return typeof v === "string" && (THEME_MODES as readonly string[]).includes(v);
}

/**
 * 内联到 <head> 的首帧脚本：先于渲染写入 html[data-theme]，避免闪白。
 * 尊重系统 prefers-color-scheme（仅当本地无显式选择时）。
 */
export const themeInitScript = `
(function(){
  try{
    var KEY="${THEME_STORAGE_KEY}";
    var stored=localStorage.getItem(KEY);
    var mode=(stored==="light"||stored==="grey"||stored==="dark")?stored:null;
    if(!mode){
      mode=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
    }
    var el=document.documentElement;
    el.setAttribute("data-theme",mode);
    el.style.colorScheme=mode==="dark"?"dark":"light";
    var mini=localStorage.getItem("${SIDEBAR_MINI_KEY}");
    if(mini==="1")el.setAttribute("data-sidebar-mini","1");
  }catch(e){document.documentElement.setAttribute("data-theme","light")}
})();
`;
