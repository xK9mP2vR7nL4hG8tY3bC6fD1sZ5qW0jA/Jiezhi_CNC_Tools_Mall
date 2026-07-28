# 资料来源与使用边界

更新时间：2026-07-29。

| 来源 | 用途 | 结论/使用边界 |
|---|---|---|
| `C:\Users\96259\Desktop\彭毅刀具生意\交谈记录\07-27_系统功能与报价规划_完整详细总结.pdf` | 业务流程、报价边界、送货单、卖家后台优先级 | 已全文审阅；作为国内订单/送货单流程依据，不把其未确认的税率、支付、月结规则写死。 |
| `C:\Users\96259\Desktop\彭毅刀具生意\网站设计\小程序设计界面.zip` | 28 个买卖家 UI 页面及交互覆盖 | 包内无可本地复用的图片；不热链原始远程图片，按桌面/移动响应式重构。 |
| [zhike.xyz](https://zhike.xyz/) | 当前线上设计基线 | 2026-07-29 核查为 SPA 演示商城；页面视觉延续工业 B2B 风格，业务改为型号优先、直接下单。 |
| [Sandvik CoroPlus ToolGuide](https://videos.sandvik.coromant.com/tool-and-cutting-data) | 辅助选型的信息架构参考 | 用于“加工条件到刀具”的选型思路；不复制页面、文案、参数或图片。 |
| [Sandvik online shop](https://www.sandvik.coromant.com/ko-kr/campaigns/buy-sandvik-coromant-tools-online) | 订货号、订单跟踪、采购清单参考 | 用于采购流程的行业参考；不复制素材。 |
| [Kennametal Resources & Knowledge](https://www.kennametal.com/tw/en/resources.html) | 型号/料号/标准号搜索参考 | 用于搜索字段规划；不复制素材。 |
| [Sandvik / ISO 13399](https://www.sandvik.coromant.com/en-us/inside-manufacturing/how-to-create-the-perfect-digital-twin) | 商品字段标准化参考 | 用于型号、规格、兼容关系的标准化方向。 |
| [Google Merchant listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=en) | SEO/商品结构化数据边界 | 真实价格库存接入前不输出商品 Offer/availability。 |
| [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering) | 商品页可抓取性方案 | 生产建议 SSR/预渲染/hydration；不长期依赖动态渲染。 |

图片素材的作者、许可证、原图页、本地路径和替换规则另见 [`asset-manifest.csv`](./asset-manifest.csv)。
