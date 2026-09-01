"use client";

import { useUi } from "./ui-prefs";

/** 移动端抽屉遮罩：点击关闭侧栏 */
export function DrawerBackdrop() {
  const { drawerOpen, closeDrawer } = useUi();
  if (!drawerOpen) return null;
  return <div className="sidebar-backdrop" aria-hidden onClick={closeDrawer} />;
}
