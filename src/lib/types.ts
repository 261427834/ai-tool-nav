/** 全站数据契约：与 data/*.json 一一对应 */

export interface CategoryChild {
  slug: string;
  name: string;
  anchor: string;
  order: number;
  count: number;
}

export interface Category {
  slug: string;
  name: string;
  anchor: string;
  /** lucide 图标名，见 src/lib/category-icons.tsx */
  icon: string;
  order: number;
  count: number;
  children: CategoryChild[];
}

export interface Tool {
  id: number;
  /** URL 友好标识，详情页仍走 /sites/[id] */
  slug: string;
  title: string;
  desc: string;
  /** 清洗过推广参数的真实外链 */
  url: string;
  domain: string;
  /** public/icons 下的本地图标路径 */
  icon: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  hot: boolean;
  views: number;
  addedAt: string;
  updatedAt: string;
  intro: string | null;
  screenshots: string[] | null;
}

export interface StaticPage {
  slug: string;
  title: string;
  heading: string;
  description: string;
  /** 简易 markdown 子集：## 标题 / - 列表 / 普通段落 */
  body: string;
}

