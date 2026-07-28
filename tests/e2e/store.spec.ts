import { expect, test } from "@playwright/test";

const dismissAnnouncement = async (page: import("@playwright/test").Page) => {
  const close = page.getByRole("button", { name: "关闭公告" });
  if (await close.isVisible().catch(() => false)) await close.click();
};

test("关键页面视觉快照", async ({ page }, testInfo) => {
  await page.goto("/");
  await dismissAnnouncement(page);
  await expect(page.getByRole("heading", { name: /按型号选对刀具/ })).toBeVisible();
  await page.screenshot({ path: "reference/screenshots/home-" + testInfo.project.name + ".png" });
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "按型号集中管理商品规格" })).toBeVisible();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.screenshot({ path: "reference/screenshots/catalog-" + testInfo.project.name + ".png" });
});

test("型号规格加入采购车", async ({ page }) => {
  await page.goto("/");
  await dismissAnnouncement(page);
  await expect(page.getByRole("heading", { name: /按型号选对刀具/ })).toBeVisible();
  await page.goto("/product/pclnr");
  await expect(page.getByText("PCLNR2525M12").first()).toBeVisible();
  await page.getByRole("button", { name: "加入采购车" }).click();
  await page.goto("/cart");
  await expect(page.getByText("外圆车削主夹").first()).toBeVisible();
});

test("提交订单后自动生成固定送货单", async ({ page }, testInfo) => {
  await page.goto("/product/pclnr");
  await dismissAnnouncement(page);
  await page.getByRole("button", { name: "加入采购车" }).click();
  await expect(page.getByRole("link", { name: /采购车/ }).first()).toContainText("1");
  await page.getByRole("link", { name: /采购车/ }).first().click();
  await page.getByRole("link", { name: "去结算" }).click();
  await page.getByLabel("企业名称 *").fill("杰帜演示制造有限公司");
  await page.getByLabel("联系人 *").fill("王工");
  await page.getByLabel("联系电话 *").fill("13902607662");
  await page.getByLabel("收货地址 *").fill("广东省东莞市长安镇演示路 88 号");
  await page.getByRole("button", { name: /提交订单并生成送货单/ }).click();
  await expect(page.getByRole("heading", { name: /订单已提交，送货单已自动生成/ })).toBeVisible();
  await page.getByRole("link", { name: "查看送货单" }).click();
  await expect(page.getByText("东莞市杰帜数控刀具有限公司")).toBeVisible();
  await expect(page.getByText(/单号：XS/)).toBeVisible();
  await page.screenshot({ path: "reference/screenshots/delivery-" + testInfo.project.name + ".png" });
});

test("型号搜索定位型号家族", async ({ page }) => {
  await page.goto("/");
  await dismissAnnouncement(page);
  await page.getByLabel("搜索型号、规格或品牌").fill("HSK-A63");
  await page.getByTestId("global-search").click();
  await expect(page.getByText("HSK 高精度液压刀柄").first()).toBeVisible();
});
