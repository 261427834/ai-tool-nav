import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-[52px] font-bold leading-none text-[var(--brand)]">404</p>
      <h1 className="mt-3 text-[18px] font-semibold">这个页面走丢了</h1>
      <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-[var(--text-muted)]">
        链接可能已经变更，或该工具尚未收录。可以回到首页使用站内搜索，或提交给我们补充。
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-brand">
          回到首页
        </Link>
        <Link href="/submit" className="btn-outline">
          提交工具
        </Link>
      </div>
    </div>
  );
}
