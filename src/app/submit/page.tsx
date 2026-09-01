import type { Metadata } from "next";
import { siteConfig } from "@site";
import { categories, totalToolCount } from "@/lib/data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "提交 AI 工具",
  description: `向我们推荐尚未收录的 AI 工具：填写名称、官网与所属分类，通过邮件提交，我们会在核实后上线。当前已收录 ${totalToolCount()} 个工具。`,
  alternates: { canonical: "/submit" },
};

const RULES = [
  "只收录可正常访问、且有明确 AI 能力的产品；",
  "不收录镜像代理站、纯课程售卖页与无法核验资质的产品；",
  "同一个工具只归入一个主分类，我们会按实际功能调整归属；",
  "描述与功能需要一致，我们会改写夸大或不准确的表述；",
  "提交只代表希望被收录，不表示任何商务合作或付费排名。",
];

export default function SubmitPage() {
  return (
    <div className="container-x py-5">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "提交 AI 工具" }]} />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="panel px-5 py-6 md:px-7">
            <h1 className="text-[22px] font-bold">提交 AI 工具</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
              欢迎推荐本站尚未收录的 AI 工具。填写下方表单后点击提交，会自动打开你的邮件客户端并把内容带进去，
              收件人为 <a href={`mailto:${siteConfig.email}`} className="text-[var(--brand)]">{siteConfig.email}</a>。
              商务合作与前排收录请同时查看
              <a href="/ads" className="mx-1 text-[var(--brand)]">广告合作</a>。
            </p>
            <SubmitForm
              categories={categories.map((c) => ({
                slug: c.slug,
                label: `${c.name}（${c.count}）`,
                children: c.children.map((s) => ({ slug: s.slug, label: `　${s.name}（${s.count}）` })),
              }))}
              email={siteConfig.email}
            />
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="panel px-5 py-5">
            <h2 className="text-[15px] font-semibold">收录标准</h2>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
              {RULES.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel mt-4 px-5 py-5">
            <h2 className="text-[15px] font-semibold">处理时效</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
              收到邮件后通常 1～3 个工作日内核验并回复结果；未通过不会特别说明原因，可换分类再次推荐。
            </p>
            <a href="/flink" className="mt-4 inline-block text-[13px] text-[var(--brand)] hover:underline">
              想互换友情链接 →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
