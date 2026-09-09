import { expect, test } from "@playwright/test";

/** 主题三态：切换 → 落 localStorage → 刷新保持 → 首帧无闪烁 */
test.describe("主题与侧栏", () => {
  test("切换主题并刷新后保持", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const initial = (await html.getAttribute("data-theme")) ?? "light";

    const btn = page.getByRole("button", { name: /模式/ }).last();
    await btn.click();
    const next = (await html.getAttribute("data-theme")) ?? initial;
    expect(next).not.toBe(initial);

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", next);
    expect(await page.evaluate(() => localStorage.getItem("aiNav.themeMode"))).toBe(next);
  });

  test("首帧主题由内联脚本写入（无闪白）", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("aiNav.themeMode", "dark"));
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe("dark");
  });

  test("侧栏 mini 折叠持久化", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /收起侧栏|展开侧栏/ }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-sidebar-mini", "1");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-sidebar-mini", "1");
  });

  test("移动端抽屉开合", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/");
    await page.getByRole("button", { name: "打开分类导航" }).click();
    await expect(page.locator("#sidebar")).toBeVisible();
    // 抽屉打开后点击任意链接应关闭抽屉
    await page.locator("#sidebar a").first().click();
    await expect(page.locator("html")).not.toHaveAttribute("data-drawer", "open");
  });
});

test.describe("首页锚点导航", () => {
  test("点击侧栏锚点滚动到对应区块并高亮", async ({ page }) => {
    await page.goto("/");
    const link = page.locator(`#sidebar a[href="#term-12"]`);
    await link.click();
    await expect(page).toHaveURL(/#term-12/);
    const box = await page.locator("#term-12").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(40); // 不被 54px 粘性头遮挡
    await expect(page.locator("#sidebar a[href='#term-12']")).toHaveAttribute("data-active", "true");
  });

  test("每分类截断 16 条并有更多入口", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#term-12").locator("xpath=ancestor::section[1]");
    const more = section.getByRole("link", { name: /更多/ }).first();
    await expect(more).toHaveAttribute("href", "/c/code");
    const count = await section.locator("a.tool-card").count();
    expect(count).toBeLessThanOrEqual(16);
  });
});


