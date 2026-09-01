/** 站点图形标记：渐变圆角方块 + 文字（品牌文案见 site.config.ts） */
export function SiteMark({ size = 28, label }: { size?: number; label?: string }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[9px] font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: "linear-gradient(135deg, var(--brand), #7c3aed)",
        boxShadow: "0 6px 16px -8px rgba(79,70,229,.9)",
      }}
      aria-hidden
    >
      {label ?? "AI"}
    </span>
  );
}
