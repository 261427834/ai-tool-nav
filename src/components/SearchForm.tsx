"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/** 搜索结果页顶部的再次检索输入框（站内） */
export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  return (
    <form
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入关键词，回车检索已收录工具"
        aria-label="站内搜索关键词"
      />
      <button type="submit" className="search-btn ml-1" aria-label="检索">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
