import { describe, expect, it } from "vitest";
import { getFamily, getProduct, productFamilies, products } from "./products";

describe("型号与规格目录", () => {
  it("保留足够的可售规格 SKU", () => {
    expect(products.length).toBeGreaterThanOrEqual(36);
  });

  it("主夹和背夹是并列的一级分类", () => {
    expect(productFamilies.some((item) => item.category === "主夹")).toBe(true);
    expect(productFamilies.some((item) => item.category === "背夹")).toBe(true);
  });

  it("同一型号下包含多个规格", () => {
    const family = getFamily("pclnr");
    expect(family.model).toBe("PCLNR");
    expect(family.variants.length).toBeGreaterThan(1);
  });

  it("SKU 包含 MOQ、库存和规格字段", () => {
    const product = getProduct("PCLNR2525M12");
    expect(product.model).toBe("PCLNR");
    expect(product.moq).toBeGreaterThan(0);
    expect(product.stock).toBeGreaterThanOrEqual(0);
    expect(product.size).toContain("25×25");
  });
});
