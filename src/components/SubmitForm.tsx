"use client";

import { useEffect, useState } from "react";
import { Check, Mail } from "lucide-react";

interface CategoryOption {
  slug: string;
  label: string;
  children: { slug: string; label: string }[];
}

interface FieldState {
  title: string;
  url: string;
  icon: string;
  desc: string;
  category: string;
  tags: string;
  nickname: string;
  contact: string;
}

const EMPTY: FieldState = {
  title: "",
  url: "",
  icon: "",
  desc: "",
  category: "",
  tags: "",
  nickname: "",
  contact: "",
};

const DRAFT_KEY = "aiNav.submitDraft";

/**
 * 投稿表单。本阶段不做后端落库：
 * 校验通过后生成 mailto: 预填正文（打开访客邮件客户端），并把草稿存 localStorage。
 * 接真实存储时只需替换 onSubmit 里的mailto逻辑为 fetch("/api/submit")。
 */
export function SubmitForm({ categories, email }: { categories: CategoryOption[]; email: string }) {
  const [value, setValue] = useState<FieldState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FieldState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [restored, setRestored] = useState(false);
  const [mailtoFallback, setMailtoFallback] = useState<string | null>(null);

  // 首次挂载：恢复未提交的草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FieldState>;
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length) {
        setValue((v) => ({ ...v, ...parsed }));
        setRestored(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const set = (k: keyof FieldState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValue((v) => ({ ...v, [k]: e.target.value }));
    setStatus("idle");
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FieldState, string>> = {};
    if (!value.title.trim()) next.title = "请填写工具名称";
    if (!value.url.trim()) next.url = "请填写官网地址";
    else if (!/^https?:\/\/\S+\.\S+/i.test(value.url.trim())) next.url = "地址需要以 http(s):// 开头";
    if (!value.desc.trim()) next.desc = "请简单说明这个工具能做什么";
    else if (value.desc.trim().length < 8) next.desc = "描述太短，至少 8 个字";
    if (!value.category) next.category = "请选择分类";
    if (!value.contact.trim()) next.contact = "请填写联系方式（邮箱为主）";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildBody = () => {
    const lines = [
      `工具名称：${value.title.trim()}`,
      `官网地址：${value.url.trim()}`,
      value.icon.trim() ? `图标地址：${value.icon.trim()}` : null,
      `工具用途：${value.desc.trim()}`,
      `希望分类：${categoryLabel(value.category)}`,
      value.tags.trim() ? `标签：${value.tags.trim()}` : null,
      `昵称：${value.nickname.trim() || "匿名"}`,
      `联系方式：${value.contact.trim()}`,
      "",
      "—— 来自站点投稿表单",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 蜜罐：被填写则静默通过（不做任何提交）
    const form = e.currentTarget as HTMLFormElement;
    const honeypot = form.querySelector<HTMLInputElement>("[name=company]");
    if (honeypot?.value) return;
    if (!validate()) return;

    const subject = `【工具投稿】${value.title.trim()}`;
    const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody())}`;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    // 用 window.open 打开邮件客户端：当前页面不跳走，用户仍留在表单页
    // （headless 测试中可被拦截验证；真实浏览器会唤起默认邮件应用）
    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (!opened) {
      // 弹窗被拦截时给出可点击链接兜底
      setMailtoFallback(href);
    }
    setStatus("sent");
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
      {restored ? (
        <p className="rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-[12.5px] text-[var(--brand)]">
          已恢复上次未提交的草稿。
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              setValue(EMPTY);
              setRestored(false);
              try {
                localStorage.removeItem(DRAFT_KEY);
              } catch {
                /* ignore */
              }
            }}
          >
            清空
          </button>
        </p>
      ) : null}

      <Field label="工具名称" required error={errors.title} hint="使用官方名称，不要加宣传语">
        <input className="field" value={value.title} onChange={set("title")} placeholder="例如：某某 AI 写作" />
      </Field>

      <Field label="官网地址" required error={errors.url} hint="可公开访问的产品主页">
        <input className="field" value={value.url} onChange={set("url")} placeholder="https://" inputMode="url" />
      </Field>

      <Field label="图标地址" error={errors.icon} hint="选填。留空我们会按域名自动获取">
        <input className="field" value={value.icon} onChange={set("icon")} placeholder="https://…/favicon.png" inputMode="url" />
      </Field>

      <Field label="工具用途" required error={errors.desc} hint="用一句话说明它解决什么问题（我们会按站内风格改写）">
        <textarea className="field min-h-[88px] resize-y" value={value.desc} onChange={set("desc")} rows={3} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="希望分类" required error={errors.category}>
          <select className="field" value={value.category} onChange={set("category")}>
            <option value="">选择分类</option>
            {categories.map((c) => (
              <optgroup key={c.slug} label={c.label}>
                <option value={c.slug}>{c.label}</option>
                {c.children.map((s) => (
                  <option key={s.slug} value={`${c.slug}/${s.slug}`}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        <Field label="标签" hint="选填，用逗号分隔">
          <input className="field" value={value.tags} onChange={set("tags")} placeholder="免费, 中文, API" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="昵称">
          <input className="field" value={value.nickname} onChange={set("nickname")} placeholder="怎么称呼你" />
        </Field>
        <Field label="联系方式" required error={errors.contact}>
          <input className="field" value={value.contact} onChange={set("contact")} placeholder="邮箱（用于反馈收录结果）" />
        </Field>
      </div>

      {/* 蜜罐：人类不可见，机器人填写即静默丢弃 */}
      <div className="hidden" aria-hidden>
        <label>
          company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" className="btn-brand">
          <Mail className="h-4 w-4" />
          提交投稿（打开邮件）
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setValue(EMPTY);
            setErrors({});
            setStatus("idle");
            setMailtoFallback(null);
            try {
              localStorage.removeItem(DRAFT_KEY);
            } catch {
              /* ignore */
            }
          }}
        >
          重置
        </button>
        {status === "sent" ? (
          <span className="flex flex-wrap items-center gap-1.5 text-[13px] text-[var(--brand)]">
            <Check className="h-4 w-4" />
            已尝试打开邮件客户端
            {mailtoFallback ? (
              <a href={mailtoFallback} className="underline">
                点击这里手动发送
              </a>
            ) : (
              <span>，若未弹出请直接发到 {email}</span>
            )}
          </span>
        ) : (
          <span className="text-[12.5px] text-[var(--text-muted)]">
            本表单不落库，内容通过邮件提交
          </span>
        )}
      </div>
    </form>
  );

  function categoryLabel(v: string) {
    if (!v) return "";
    const [top, sub] = v.split("/");
    const c = categories.find((x) => x.slug === top);
    if (!c) return v;
    const s = sub ? c.children.find((x) => x.slug === sub) : null;
    return s ? `${c.label} / ${s.label.trim()}` : c.label;
  }
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">
        {label}
        {required ? <span className="ml-0.5 text-[var(--badge)]">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[12px] text-[var(--badge)]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-[var(--text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}




