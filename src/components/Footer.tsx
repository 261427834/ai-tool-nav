import Link from "next/link";
import { Mail } from "lucide-react";
import { siteConfig } from "@site";
import { SiteLogo } from "./SiteLogo";

/** 三栏页脚：简介 / 站内页 + 友链 + 邮箱 / 空白；下排版权 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 px-3.5 pb-6 md:px-4">
      <div className="panel mx-auto max-w-[1900px] px-5 py-6 md:px-7">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" title="回到首页">
              <SiteLogo height={30} />
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">{siteConfig.description}</p>
          </div>

          <div className="md:col-span-4">
            <p className="text-[13px] text-[var(--text-muted)]">
              按下 <kbd className="rounded bg-[var(--code-bg)] px-1.5 py-0.5 text-xs">Ctrl</kbd>+
              <kbd className="rounded bg-[var(--code-bg)] px-1.5 py-0.5 text-xs">D</kbd> 或{" "}
              <kbd className="rounded bg-[var(--code-bg)] px-1.5 py-0.5 text-xs">⌘</kbd>+
              <kbd className="rounded bg-[var(--code-bg)] px-1.5 py-0.5 text-xs">D</kbd> 感谢收藏
            </p>
            <nav aria-label="站内页面" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              {siteConfig.footerLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-[var(--text-muted)] hover:text-[var(--brand)]">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              {siteConfig.friendLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[var(--text-muted)] hover:text-[var(--brand)]"
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "nofollow noopener noreferrer" as const }
                    : {})}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mt-4">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] transition-colors hover:bg-[var(--brand)] hover:text-white"
                title={siteConfig.email}
                aria-label={`发送邮件到 ${siteConfig.email}`}
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="hidden md:col-span-3 md:block" />
        </div>

        <div className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--text-muted)]">
          Copyright © {year}{" "}
          <Link href="/" className="hover:text-[var(--brand)]">
            {siteConfig.name}
          </Link>
          {siteConfig.icp ? (
            <>
              {" · "}
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-[var(--brand)]"
              >
                {siteConfig.icp}
              </a>
            </>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
