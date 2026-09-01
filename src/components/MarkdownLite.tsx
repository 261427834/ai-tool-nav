import { cn } from "@/lib/cn";

/** 简易 markdown 子集渲染：## h2 / ### h3 / - 列表 / 空行分段（不支持嵌套与行内标记） */
export function MarkdownLite({ body, className }: { body: string; className?: string }) {
  const blocks: Array<{ type: "h2" | "h3" | "p" | "ul"; text?: string; items?: string[] }> = [];
  let currentList: string[] | null = null;

  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith("- ")) {
      if (!currentList) {
        currentList = [];
        blocks.push({ type: "ul", items: currentList });
      }
      currentList.push(t.slice(2));
      continue;
    }
    currentList = null;
    if (!t) continue;
    if (t.startsWith("### ")) blocks.push({ type: "h3", text: t.slice(4) });
    else if (t.startsWith("## ")) blocks.push({ type: "h2", text: t.slice(3) });
    else blocks.push({ type: "p", text: t });
  }

  return (
    <div className={cn("prose-site", className)}>
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
        if (b.type === "ul")
          return (
            <ul key={i}>
              {b.items?.map((it, k) => (
                <li key={k}>{inline(it)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{inline(b.text ?? "")}</p>;
      })}
    </div>
  );
}

/** 行内 **bold** 支持 */
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}
