"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

/** 复制工具官网地址（详情页） */
export function CopyUrlButton({ tool }: { tool: { title: string; url: string } }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(tool.url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = tool.url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setState("copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" onClick={copy} className="btn-outline" aria-live="polite">
        {state === "copied" ? <Check className="h-4 w-4 text-[var(--brand)]" /> : <Copy className="h-4 w-4" />}
        {state === "copied" ? "已复制官网地址" : "复制官网地址"}
      </button>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <button
          type="button"
          className="btn-outline hidden sm:inline-flex"
          onClick={() => {
            navigator
              .share({ title: tool.title, url: tool.url })
              .catch(() => undefined);
          }}
        >
          <Share2 className="h-4 w-4" />
          分享
        </button>
      ) : null}
    </>
  );
}
