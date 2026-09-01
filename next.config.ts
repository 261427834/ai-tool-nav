import type { NextConfig } from "next";

/**
 * Cloudflare Pages 静态部署配置：
 * - output: "export"：构建生成纯静态产物到 out/（无需 Node 服务器）
 * - images.unoptimized：所有图标均为本地小图，无需 CDN 图片优化
 * - 自定义响应头通过 public/_headers 配置（静态导出不支持 next.config headers）
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
