import { NextResponse } from "next/server";

/**
 * 投稿接口占位实现。
 *
 * 当前阶段：投稿走「mailto + 本地草稿」，不落库，因此这里固定返回 501。
 * 未来接真实存储时的替换点（保持请求/响应契约不变，前端只需把 mailto 分支换成 fetch）：
 *   1) Upstash Redis：
 *        import { Redis } from "@upstash/redis";
 *        const redis = Redis.fromEnv();
 *        await redis.lpush("submissions", JSON.stringify(payload));
 *   2) Supabase：
 *        import { createClient } from "@supabase/supabase-js";
 *        await createClient(url, key).from("submissions").insert(payload);
 *   3) 自建数据库同理。
 * 建议同时启用：蜜罐字段校验、IP 频控（Upstash Ratelimit）、Turnstile 校验。
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: "submission_disabled",
      message: "当前投稿通过邮件提交，请使用表单生成邮件，或直接联系站点邮箱。",
      received: payload ? Object.keys(payload as object).length : 0,
    },
    { status: 501 },
  );
}
