/** 图标降级：按 domain 派生稳定色相的字母徽章，零网络请求 */
export function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.codePointAt(i)!) % 360;
  return h;
}

export function initialOf(title: string): string {
  const t = (title ?? "").trim();
  if (!t) return "?";
  // 中文取首字，英文取首字母大写
  return /^[a-z]/i.test(t) ? t[0].toUpperCase() : t[0];
}

export function badgeStyle(seed: string): React.CSSProperties {
  const h = hueFromString(seed || "?");
  return {
    background: `linear-gradient(140deg, hsl(${h} 68% 56%), hsl(${(h + 40) % 360} 70% 46%))`,
  };
}
