import { expect, test } from "@playwright/test";

test.describe("搜索", () => {
  test("站内实时过滤出建议并可进结果页", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("搜索 AI 工具");
    await input.click();
    await input.fill("编程");
    const items = page.locator(".search-panel li a");
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);

    await input.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.locator("h1")).toContainText("编程");
  });

  test("无结果时给出提示", async ({ page }) => {
    await page.goto("/search?q=zzzz不存在的工具名");
    await expect(page.getByText(/没有匹配/)).toBeVisible();
  });

  test("切换引擎后回车跳外部搜索", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "必应", exact: true }).click();
    const popupPromise = page.waitForEvent("popup");
    await page.getByLabel("搜索 AI 工具").fill("cursor");
    await page.getByLabel("搜索 AI 工具").press("Enter");
    const popup = await popupPromise;
    expect(popup.url()).toContain("bing.com/search");
    expect(await page.evaluate(() => localStorage.getItem("aiNav.searchEngine"))).toBe("bing");
  });
});

test.describe("详情页", () => {
  test("直达按钮指向官网且 rel 正确", async ({ page }) => {
    await page.goto("/sites/1336");
    const btn = page.locator("a[href]").filter({ hasText: "直达官网" }).first();
    await expect(btn).toHaveAttribute("target", "_blank");
    await expect(btn).toHaveAttribute("rel", /nofollow/);
    const href = (await btn.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https?:\/\//);
    expect(href).not.toContain("ai-nav.net");
  });

  test("同分类推荐不超过 8 条", async ({ page }) => {
    await page.goto("/sites/1336");
    const section = page.locator("section").filter({ hasText: "同分类推荐" });
    expect(await section.locator("a.tool-card").count()).toBeLessThanOrEqual(8);
  });

  test("分类页与子分类页可访问", async ({ page }) => {
    await page.goto("/c/code");
    await expect(page.locator("h1")).toContainText("AI编程工具");
    await page.goto("/c/image/bg-remove");
    await expect(page.locator("h1")).toContainText("AI图片背景移除");
  });
});

test.describe("投稿页", () => {
  test("必填校验 + mailto 正文含全部字段 + 草稿恢复", async ({ page }) => {
    await page.goto("/submit");
    await page.getByRole("button", { name: /提交投稿/ }).click();
    await expect(page.getByText("请填写工具名称")).toBeVisible();

    await page.getByPlaceholder("例如：某某 AI 写作").fill("测试工具");
    await page.getByRole("textbox", { name: /官网地址/ }).fill("https://example.com");
    await page.locator("textarea").first().fill("这是一个用于自动化测试的工具描述。");
    await page.locator("select").first().selectOption("code");
    await page.getByPlaceholder("邮箱（用于反馈收录结果）").fill("me@example.com");

    // 拦截 window.open，捕获 mailto URL（与真实行为一致：页面不跳走）
    await page.evaluate(() => {
      const win = window as unknown as { __capturedMailto: string; open: typeof window.open };
      win.__capturedMailto = "";
      const orig = win.open;
      win.open = ((url?: string | URL) => {
        if (typeof url === "string" && url.startsWith("mailto:")) win.__capturedMailto = url;
        return null;
      }) as typeof window.open;
      void orig;
    });

    await page.getByRole("button", { name: /提交投稿/ }).click();
    await page.waitForFunction(() => Boolean((window as unknown as { __capturedMailto?: string }).__capturedMailto), {
      timeout: 8000,
    });
    const captured = await page.evaluate(() => (window as unknown as { __capturedMailto: string }).__capturedMailto);
    expect(captured.startsWith("mailto:")).toBe(true);
    const decoded = decodeURIComponent(captured);
    for (const needle of ["测试工具", "https://example.com", "这是一个用于自动化测试的工具描述", "me@example.com"]) {
      expect(decoded).toContain(needle);
    }
    // 草稿恢复
    await page.goto("/submit");
    await expect(page.getByText(/已恢复上次未提交的草稿/)).toBeVisible();
    expect(await page.locator("input").first().inputValue()).toBe("测试工具");
  });
});






