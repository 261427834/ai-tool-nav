import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // 图标全部本地化到 public/icons，不热链外部站点
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:all*(ico|png|jpg|jpeg|svg|webp|json)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
