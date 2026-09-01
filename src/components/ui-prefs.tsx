"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useUiPrefs, type UiPrefs } from "./use-ui-prefs";

const UiPrefsContext = createContext<UiPrefs | null>(null);

export function UiPrefsProvider({ children }: { children: ReactNode }) {
  const prefs = useUiPrefs();
  return <UiPrefsContext.Provider value={prefs}>{children}</UiPrefsContext.Provider>;
}

export function useUi(): UiPrefs {
  const ctx = useContext(UiPrefsContext);
  if (!ctx) throw new Error("useUi 必须在 UiPrefsProvider 内使用");
  return ctx;
}
