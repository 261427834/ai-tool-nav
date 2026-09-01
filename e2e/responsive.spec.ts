import { expect, test } from "playwright/test";

/** 响应式：三档宽度下无横向滚动，且网格列数符合预期 */
const VIEWPORTS = [
  { width: 375, height: 720, cols: 2 },
  { width: 768, height: 900, cols: 2 },
  { width: 1440, height: 900, cols: 5 },
  { width: 1920, height: 1080, cols: 6 },
];

for (const vp of VIEWPORTS) {
  test(`${vp.width}px 布局正常`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    const grid = page.locator(".tool-grid").first();
    const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(vp.cols);
  });
}
