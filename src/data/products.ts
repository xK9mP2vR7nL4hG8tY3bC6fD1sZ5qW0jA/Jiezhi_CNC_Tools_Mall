/**
 * 演示目录的数据边界：以“型号”为商品家族，以“规格”为可售 SKU。
 * 上线前应由商品主数据/ERP 替换本文件中的价格、库存、图片与技术参数。
 */
export type ToolCategory =
  | "主夹"
  | "背夹"
  | "车削刀具"
  | "铣削刀具"
  | "孔加工"
  | "螺纹刀具"
  | "可转位刀片"
  | "刀柄与附件";

export type ProductVariant = {
  id: string;
  sku: string;
  label: string;
  size: string;
  price: number;
  stock: number;
  moq: number;
  material: string;
  coating: string;
  packaging: string;
  orientation?: string;
  specifications: Record<string, string>;
};

export type ProductFamily = {
  id: string;
  name: string;
  en: string;
  model: string;
  category: ToolCategory;
  subcategory: string;
  brand: string;
  application: string;
  description: string;
  materialHint: string;
  color: string;
  tag?: string;
  variants: ProductVariant[];
};

type VariantSeed = Omit<ProductVariant, "id">;
type FamilySeed = Omit<ProductFamily, "variants"> & { variants: VariantSeed[] };

const family = (seed: FamilySeed): ProductFamily => ({
  ...seed,
  variants: seed.variants.map((variant, index) => ({
    ...variant,
    id: `${seed.id}-v${index + 1}`,
  })),
});

const spec = (pairs: Array<[string, string]>) => Object.fromEntries(pairs);

export const productFamilies: ProductFamily[] = [
  family({
    id: "pclnr",
    name: "外圆车削主夹",
    en: "External Turning Main Clamp",
    model: "PCLNR",
    category: "主夹",
    subcategory: "外圆车削 / 负前角",
    brand: "杰帜数控",
    application: "适配 CNMG、TNMG 可转位刀片的外圆、端面车削。",
    description: "同一 PCLNR 型号按刀杆截面、刀片尺寸和左右向提供规格选择。",
    materialHint: "42CrMo 调质刀体",
    color: "#356982",
    tag: "主夹热销",
    variants: [
      { sku: "PCLNR2020K09", label: "20×20 / CNMG09", size: "20×20×125 mm", price: 168, stock: 46, moq: 1, material: "42CrMo", coating: "发黑", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆截面", "20×20 mm"], ["适配刀片", "CNMG / TNMG 09"], ["刀尖角", "95°"], ["方向", "右向"]]) },
      { sku: "PCLNR2525M12", label: "25×25 / CNMG12", size: "25×25×150 mm", price: 218, stock: 32, moq: 1, material: "42CrMo", coating: "发黑", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆截面", "25×25 mm"], ["适配刀片", "CNMG / TNMG 12"], ["刀尖角", "95°"], ["方向", "右向"]]) },
      { sku: "PCLNR3232P12", label: "32×32 / CNMG12", size: "32×32×170 mm", price: 298, stock: 18, moq: 1, material: "42CrMo", coating: "发黑", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆截面", "32×32 mm"], ["适配刀片", "CNMG / TNMG 12"], ["刀尖角", "95°"], ["方向", "右向"]]) },
    ],
  }),
  family({
    id: "mclnr",
    name: "通用车削主夹",
    en: "Universal Turning Main Clamp",
    model: "MCLNR",
    category: "主夹",
    subcategory: "外圆车削 / 通用",
    brand: "杰帜数控",
    application: "适配 CNMG 系列刀片的普通外圆与台阶加工。",
    description: "MCLNR 主夹以型号统一管理，不同截面和刀片规格在同一页面选择。",
    materialHint: "42CrMo 调质刀体",
    color: "#4c7f94",
    variants: [
      { sku: "MCLNR2020K09", label: "20×20 / CNMG09", size: "20×20×125 mm", price: 158, stock: 58, moq: 1, material: "42CrMo", coating: "发黑", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆截面", "20×20 mm"], ["适配刀片", "CNMG09"], ["主偏角", "95°"], ["方向", "右向"]]) },
      { sku: "MCLNR2525M12", label: "25×25 / CNMG12", size: "25×25×150 mm", price: 208, stock: 35, moq: 1, material: "42CrMo", coating: "发黑", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆截面", "25×25 mm"], ["适配刀片", "CNMG12"], ["主偏角", "95°"], ["方向", "右向"]]) },
      { sku: "MCLNR3232P12", label: "32×32 / CNMG12", size: "32×32×170 mm", price: 286, stock: 21, moq: 1, material: "42CrMo", coating: "发黑", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆截面", "32×32 mm"], ["适配刀片", "CNMG12"], ["主偏角", "95°"], ["方向", "右向"]]) },
    ],
  }),
  family({
    id: "sclcr",
    name: "内孔精车背夹",
    en: "Internal Turning Back Clamp",
    model: "SCLCR",
    category: "背夹",
    subcategory: "内孔加工 / 精车",
    brand: "杰帜数控",
    application: "用于内孔、端面和台阶精车，适配 CCMT 系列刀片。",
    description: "同一 SCLCR 型号按最小加工孔径、杆径和刀片尺寸选择。",
    materialHint: "整体合金钢刀杆",
    color: "#9a804b",
    tag: "背夹热销",
    variants: [
      { sku: "SCLCR06-E08K", label: "Ø8 / CCMT06", size: "Ø8×125 mm", price: 198, stock: 26, moq: 1, material: "合金钢", coating: "镀镍", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆直径", "Ø8 mm"], ["最小镗孔", "Ø10 mm"], ["适配刀片", "CCMT06"], ["方向", "右向"]]) },
      { sku: "SCLCR06-E12Q", label: "Ø12 / CCMT06", size: "Ø12×150 mm", price: 268, stock: 31, moq: 1, material: "合金钢", coating: "镀镍", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆直径", "Ø12 mm"], ["最小镗孔", "Ø15 mm"], ["适配刀片", "CCMT06"], ["方向", "右向"]]) },
      { sku: "SCLCR09-E16Q", label: "Ø16 / CCMT09", size: "Ø16×180 mm", price: 348, stock: 16, moq: 1, material: "合金钢", coating: "镀镍", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆直径", "Ø16 mm"], ["最小镗孔", "Ø20 mm"], ["适配刀片", "CCMT09"], ["方向", "右向"]]) },
    ],
  }),
  family({
    id: "sdjcr",
    name: "仿形车削背夹",
    en: "Profiling Turning Back Clamp",
    model: "SDJCR",
    category: "背夹",
    subcategory: "内孔加工 / 仿形",
    brand: "杰帜数控",
    application: "适用于内孔仿形与小孔径加工，适配 DCMT 系列刀片。",
    description: "SDJCR 背夹在同型号内区分杆径、有效长度与刀片规格。",
    materialHint: "整体合金钢刀杆",
    color: "#b08a4c",
    variants: [
      { sku: "SDJCR07-E08K", label: "Ø8 / DCMT07", size: "Ø8×125 mm", price: 208, stock: 19, moq: 1, material: "合金钢", coating: "镀镍", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆直径", "Ø8 mm"], ["最小镗孔", "Ø10 mm"], ["适配刀片", "DCMT07"], ["方向", "右向"]]) },
      { sku: "SDJCR07-E12Q", label: "Ø12 / DCMT07", size: "Ø12×150 mm", price: 278, stock: 24, moq: 1, material: "合金钢", coating: "镀镍", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆直径", "Ø12 mm"], ["最小镗孔", "Ø15 mm"], ["适配刀片", "DCMT07"], ["方向", "右向"]]) },
      { sku: "SDJCR11-E16Q", label: "Ø16 / DCMT11", size: "Ø16×180 mm", price: 368, stock: 12, moq: 1, material: "合金钢", coating: "镀镍", packaging: "1 把/盒", orientation: "右向", specifications: spec([["刀杆直径", "Ø16 mm"], ["最小镗孔", "Ø20 mm"], ["适配刀片", "DCMT11"], ["方向", "右向"]]) },
    ],
  }),
  family({
    id: "cnmg120408",
    name: "负前角车削刀片",
    en: "Negative Turning Insert",
    model: "CNMG120408",
    category: "可转位刀片",
    subcategory: "车削刀片 / CNMG",
    brand: "杰帜数控",
    application: "适用于钢件、不锈钢、铸铁的粗加工与半精加工。",
    description: "型号 CNMG120408 下通过牌号与断屑槽选择具体可售规格。",
    materialHint: "硬质合金",
    color: "#526d81",
    tag: "常购型号",
    variants: [
      { sku: "CNMG120408-PM4325", label: "PM / 钢件通用", size: "12.9×12.9×4.76 mm", price: 32, stock: 880, moq: 10, material: "硬质合金", coating: "TiAlN", packaging: "10 片/盒", specifications: spec([["适用材料", "ISO P 钢件"], ["断屑槽", "PM"], ["圆角半径", "0.8 mm"], ["包装", "10 片"]]) },
      { sku: "CNMG120408-MM4315", label: "MM / 不锈钢", size: "12.9×12.9×4.76 mm", price: 38, stock: 520, moq: 10, material: "硬质合金", coating: "PVD", packaging: "10 片/盒", specifications: spec([["适用材料", "ISO M 不锈钢"], ["断屑槽", "MM"], ["圆角半径", "0.8 mm"], ["包装", "10 片"]]) },
      { sku: "CNMG120408-KR4125", label: "KR / 铸铁", size: "12.9×12.9×4.76 mm", price: 35, stock: 360, moq: 10, material: "硬质合金", coating: "CVD", packaging: "10 片/盒", specifications: spec([["适用材料", "ISO K 铸铁"], ["断屑槽", "KR"], ["圆角半径", "0.8 mm"], ["包装", "10 片"]]) },
    ],
  }),
  family({
    id: "em4f",
    name: "整体硬质合金四刃立铣刀",
    en: "4-Flute Carbide End Mill",
    model: "EM-4F",
    category: "铣削刀具",
    subcategory: "整体铣刀 / 四刃",
    brand: "杰帜数控",
    application: "适用于钢件、模具钢的侧铣、槽铣和精加工。",
    description: "EM-4F 型号以刃径、刃长、全长为规格变体，避免将尺寸拆散成不同型号。",
    materialHint: "超细颗粒硬质合金",
    color: "#5d7590",
    tag: "铣削新品",
    variants: [
      { sku: "EM-4F-D06-50", label: "D6 / 50L", size: "D6×15×50 mm", price: 68, stock: 142, moq: 10, material: "硬质合金", coating: "TiSiN", packaging: "10 支/盒", specifications: spec([["刃径", "6 mm"], ["刃长", "15 mm"], ["全长", "50 mm"], ["刃数", "4"]]) },
      { sku: "EM-4F-D08-60", label: "D8 / 60L", size: "D8×20×60 mm", price: 86, stock: 118, moq: 10, material: "硬质合金", coating: "TiSiN", packaging: "10 支/盒", specifications: spec([["刃径", "8 mm"], ["刃长", "20 mm"], ["全长", "60 mm"], ["刃数", "4"]]) },
      { sku: "EM-4F-D10-75", label: "D10 / 75L", size: "D10×25×75 mm", price: 118, stock: 96, moq: 10, material: "硬质合金", coating: "TiSiN", packaging: "10 支/盒", specifications: spec([["刃径", "10 mm"], ["刃长", "25 mm"], ["全长", "75 mm"], ["刃数", "4"]]) },
    ],
  }),
  family({
    id: "dr5d",
    name: "内冷整体硬质合金钻头",
    en: "5D Coolant Carbide Drill",
    model: "DR-5D",
    category: "孔加工",
    subcategory: "整体钻头 / 内冷",
    brand: "杰帜数控",
    application: "适用于钢件和不锈钢稳定钻孔，支持内冷加工。",
    description: "DR-5D 型号以内径为主规格，配套固定 5D 长度关系。",
    materialHint: "微粒硬质合金",
    color: "#476d82",
    variants: [
      { sku: "DR-5D-D06", label: "D6 / 5D", size: "D6×30×82 mm", price: 138, stock: 74, moq: 5, material: "硬质合金", coating: "TiAlN", packaging: "5 支/盒", specifications: spec([["钻径", "6 mm"], ["钻深", "5D"], ["冷却", "内冷"], ["钻尖角", "140°"]]) },
      { sku: "DR-5D-D08", label: "D8 / 5D", size: "D8×40×98 mm", price: 186, stock: 64, moq: 5, material: "硬质合金", coating: "TiAlN", packaging: "5 支/盒", specifications: spec([["钻径", "8 mm"], ["钻深", "5D"], ["冷却", "内冷"], ["钻尖角", "140°"]]) },
      { sku: "DR-5D-D10", label: "D10 / 5D", size: "D10×50×110 mm", price: 238, stock: 43, moq: 5, material: "硬质合金", coating: "TiAlN", packaging: "5 支/盒", specifications: spec([["钻径", "10 mm"], ["钻深", "5D"], ["冷却", "内冷"], ["钻尖角", "140°"]]) },
    ],
  }),
  family({
    id: "thm",
    name: "螺旋槽机用丝锥",
    en: "Spiral Flute Machine Tap",
    model: "TH-M",
    category: "螺纹刀具",
    subcategory: "丝锥 / 螺旋槽",
    brand: "杰帜数控",
    application: "适用于盲孔螺纹加工，按螺纹规格选择。",
    description: "TH-M 将 M6、M8、M10 作为同型号下的规格变体。",
    materialHint: "含钴高速钢",
    color: "#758090",
    variants: [
      { sku: "TH-M-M06", label: "M6×1.0", size: "M6×1.0×62 mm", price: 45, stock: 220, moq: 5, material: "HSS-Co", coating: "TiCN", packaging: "5 支/盒", specifications: spec([["螺纹", "M6×1.0"], ["总长", "62 mm"], ["槽型", "螺旋槽"], ["适用", "盲孔"]]) },
      { sku: "TH-M-M08", label: "M8×1.25", size: "M8×1.25×70 mm", price: 58, stock: 178, moq: 5, material: "HSS-Co", coating: "TiCN", packaging: "5 支/盒", specifications: spec([["螺纹", "M8×1.25"], ["总长", "70 mm"], ["槽型", "螺旋槽"], ["适用", "盲孔"]]) },
      { sku: "TH-M-M10", label: "M10×1.5", size: "M10×1.5×75 mm", price: 74, stock: 132, moq: 5, material: "HSS-Co", coating: "TiCN", packaging: "5 支/盒", specifications: spec([["螺纹", "M10×1.5"], ["总长", "75 mm"], ["槽型", "螺旋槽"], ["适用", "盲孔"]]) },
    ],
  }),
  family({
    id: "hsk-a63",
    name: "HSK 高精度液压刀柄",
    en: "HSK Hydraulic Chuck",
    model: "HSK-A63",
    category: "刀柄与附件",
    subcategory: "液压刀柄 / HSK",
    brand: "杰帜数控",
    application: "用于高速精密夹持，按夹持直径选择。",
    description: "HSK-A63 型号按夹持直径统一展示，支持精密铣削。",
    materialHint: "合金钢精磨",
    color: "#354f60",
    variants: [
      { sku: "HSK-A63-HC12", label: "夹持 Ø12", size: "HSK-A63 / Ø12", price: 1680, stock: 12, moq: 1, material: "合金钢", coating: "防锈", packaging: "1 把/盒", specifications: spec([["接口", "HSK-A63"], ["夹持直径", "12 mm"], ["跳动", "≤3 μm"], ["冷却", "内冷"]]) },
      { sku: "HSK-A63-HC16", label: "夹持 Ø16", size: "HSK-A63 / Ø16", price: 1780, stock: 9, moq: 1, material: "合金钢", coating: "防锈", packaging: "1 把/盒", specifications: spec([["接口", "HSK-A63"], ["夹持直径", "16 mm"], ["跳动", "≤3 μm"], ["冷却", "内冷"]]) },
      { sku: "HSK-A63-HC20", label: "夹持 Ø20", size: "HSK-A63 / Ø20", price: 1880, stock: 8, moq: 1, material: "合金钢", coating: "防锈", packaging: "1 把/盒", specifications: spec([["接口", "HSK-A63"], ["夹持直径", "20 mm"], ["跳动", "≤3 μm"], ["冷却", "内冷"]]) },
    ],
  }),
  family({
    id: "er32",
    name: "ER32 高精度弹簧夹头套装",
    en: "ER32 Precision Collet Set",
    model: "ER32",
    category: "刀柄与附件",
    subcategory: "夹头 / ER 系列",
    brand: "杰帜数控",
    application: "适用于 ER32 系统的精密夹持与常用规格备货。",
    description: "ER32 以套装数量、规格覆盖范围形成不同可售规格。",
    materialHint: "弹簧钢",
    color: "#788994",
    variants: [
      { sku: "ER32-15PCS", label: "3–20 / 15件套", size: "3–20 mm / 15 件", price: 498, stock: 58, moq: 1, material: "弹簧钢", coating: "防锈", packaging: "1 套/盒", specifications: spec([["系列", "ER32"], ["范围", "3–20 mm"], ["件数", "15 件"], ["精度", "≤0.015 mm"]]) },
      { sku: "ER32-18PCS", label: "3–20 / 18件套", size: "3–20 mm / 18 件", price: 598, stock: 42, moq: 1, material: "弹簧钢", coating: "防锈", packaging: "1 套/盒", specifications: spec([["系列", "ER32"], ["范围", "3–20 mm"], ["件数", "18 件"], ["精度", "≤0.015 mm"]]) },
      { sku: "ER32-21PCS", label: "2–20 / 21件套", size: "2–20 mm / 21 件", price: 698, stock: 24, moq: 1, material: "弹簧钢", coating: "防锈", packaging: "1 套/盒", specifications: spec([["系列", "ER32"], ["范围", "2–20 mm"], ["件数", "21 件"], ["精度", "≤0.015 mm"]]) },
    ],
  }),
  family({
    id: "apkt1604",
    name: "平面铣削刀片",
    en: "Face Milling Insert",
    model: "APKT1604",
    category: "可转位刀片",
    subcategory: "铣削刀片 / APMT",
    brand: "杰帜数控",
    application: "适用于平面铣削、台阶铣削与通用加工。",
    description: "APKT1604 以断屑槽和牌号做规格区分，满足不同加工对象。",
    materialHint: "硬质合金",
    color: "#a18c57",
    variants: [
      { sku: "APKT1604-PM4325", label: "PM / 钢件", size: "16×9.5×4.76 mm", price: 25, stock: 640, moq: 10, material: "硬质合金", coating: "TiAlN", packaging: "10 片/盒", specifications: spec([["适用材料", "ISO P"], ["断屑槽", "PM"], ["圆角", "0.8 mm"], ["包装", "10 片"]]) },
      { sku: "APKT1604-MM4315", label: "MM / 不锈钢", size: "16×9.5×4.76 mm", price: 29, stock: 380, moq: 10, material: "硬质合金", coating: "PVD", packaging: "10 片/盒", specifications: spec([["适用材料", "ISO M"], ["断屑槽", "MM"], ["圆角", "0.8 mm"], ["包装", "10 片"]]) },
      { sku: "APKT1604-AL2105", label: "AL / 铝合金", size: "16×9.5×4.76 mm", price: 27, stock: 284, moq: 10, material: "硬质合金", coating: "抛光", packaging: "10 片/盒", specifications: spec([["适用材料", "ISO N"], ["断屑槽", "AL"], ["圆角", "0.8 mm"], ["包装", "10 片"]]) },
    ],
  }),
  family({
    id: "mgmn",
    name: "切断切槽刀片",
    en: "Parting and Grooving Insert",
    model: "MGMN",
    category: "车削刀具",
    subcategory: "切断 / 切槽",
    brand: "杰帜数控",
    application: "适用于钢件、不锈钢常规切断与切槽加工。",
    description: "MGMN 型号按槽宽与牌号管理，用户在同一型号下选择准确规格。",
    materialHint: "硬质合金",
    color: "#5d6f79",
    variants: [
      { sku: "MGMN200-GM4125", label: "2.0 mm / 钢件", size: "槽宽 2.0 mm", price: 18, stock: 560, moq: 10, material: "硬质合金", coating: "CVD", packaging: "10 片/盒", specifications: spec([["槽宽", "2.0 mm"], ["适用材料", "ISO P"], ["断屑槽", "GM"], ["包装", "10 片"]]) },
      { sku: "MGMN300-GM4125", label: "3.0 mm / 钢件", size: "槽宽 3.0 mm", price: 22, stock: 430, moq: 10, material: "硬质合金", coating: "CVD", packaging: "10 片/盒", specifications: spec([["槽宽", "3.0 mm"], ["适用材料", "ISO P"], ["断屑槽", "GM"], ["包装", "10 片"]]) },
      { sku: "MGMN400-GM4125", label: "4.0 mm / 钢件", size: "槽宽 4.0 mm", price: 27, stock: 318, moq: 10, material: "硬质合金", coating: "CVD", packaging: "10 片/盒", specifications: spec([["槽宽", "4.0 mm"], ["适用材料", "ISO P"], ["断屑槽", "GM"], ["包装", "10 片"]]) },
    ],
  }),
];

export const categories: Array<[ToolCategory, string]> = [
  ["主夹", "外圆、端面与台阶车削主夹"],
  ["背夹", "内孔、仿形与精车背夹"],
  ["车削刀具", "车削系统与通用组件"],
  ["铣削刀具", "整体铣刀与平面铣削"],
  ["孔加工", "钻孔、扩孔与孔加工"],
  ["螺纹刀具", "丝锥与螺纹加工"],
  ["可转位刀片", "车削、铣削可转位刀片"],
  ["刀柄与附件", "刀柄、夹头与连接附件"],
];

export type Product = ProductVariant & {
  familyId: string;
  familyName: string;
  en: string;
  model: string;
  category: ToolCategory;
  subcategory: string;
  brand: string;
  application: string;
  description: string;
  color: string;
  tag?: string;
};

export const products: Product[] = productFamilies.flatMap((item) =>
  item.variants.map((variant) => ({
    ...variant,
    familyId: item.id,
    familyName: item.name,
    en: item.en,
    model: item.model,
    category: item.category,
    subcategory: item.subcategory,
    brand: item.brand,
    application: item.application,
    description: item.description,
    color: item.color,
    tag: item.tag,
  })),
);

export const getProduct = (id?: string) =>
  products.find((product) => product.id === id || product.sku === id) || products[0];

export const getFamily = (id?: string) =>
  productFamilies.find((item) => item.id === id || item.model === id) || productFamilies[0];

export const getVariant = (familyId: string, variantId?: string) => {
  const item = getFamily(familyId);
  return item.variants.find((variant) => variant.id === variantId || variant.sku === variantId) || item.variants[0];
};

export const findFamilies = (query: string, category?: string) => {
  const normalized = query.trim().toLowerCase();
  return productFamilies.filter((item) => {
    const inCategory = !category || category === "全部" || item.category === category;
    const corpus = [item.name, item.model, item.category, item.subcategory, item.brand, ...item.variants.flatMap((variant) => [variant.sku, variant.label, variant.size])].join(" ").toLowerCase();
    return inCategory && (!normalized || corpus.includes(normalized));
  });
};

export const familyMinPrice = (item: ProductFamily) =>
  Math.min(...item.variants.map((variant) => variant.price));
