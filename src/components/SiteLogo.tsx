import { siteConfig } from "@site";
import { SiteMark } from "./SiteMark";

/** 图形 + 文字组合 logo（文字取 site.config.ts，改品牌不动组件） */
export function SiteLogo({ height = 28 }: { height?: number }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <SiteMark size={height} />
      <span className="overflow-clip-1 font-bold tracking-tight" style={{ fontSize: height * 0.53 }}>
        {siteConfig.name}
      </span>
    </span>
  );
}
