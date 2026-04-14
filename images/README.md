# AI小店长 · 图片与动画资源说明

本文档梳理小程序内**需要本地资源或建议替换网络占位图**的位置，并与**代码文件**一一对应，便于你批量制图与接入。

> **微信后台**：凡使用本地或自有 CDN 图片，请在「小程序后台 → 开发管理 → 开发设置 → 服务器域名」中配置 **downloadFile 合法域名**（若仅使用包内 `/images/` 路径则无需配置域名）。

---

## 〇、极简模式业务流程（与页面对齐）

| 步数 | 内容 |
|------|------|
| 第一步 | 选择平台：朋友圈/私域、小红薯、dou音、电商主图 |
| 第二步 | 填写基本信息：产品名称、产品原图 |
| 第三步 | **全渠道**：按品类选择参考风格（美食 / 鞋服 / 生活用品）或上传参考图 |
| 第四步 | **朋友圈 / 小红薯 / dou音**：补充信息 + 文案风格；**电商主图**：电商平台 + 标题风格 |
| 第五步 | 等待出图（后台制作、微信通知）→ 展示生成图与文案结果 |

---

## 一、推荐目录结构

```
images/
├── minimal-flow/     # 【极简】第一步「发布渠道」四个入口图标（PNG）
├── lottie/           # 【极简】第五步生成等待动画（JSON，Lottie）
├── reference-styles/ # 【极简】第三步参考图：美食 / 鞋服 / 生活用品 子目录，文件名与风格名一致
├── banners/          # 【首页】教程 / 活动横幅
├── inspiration/      # 【首页】灵感橱窗卡片图（建议与 home.js 中 id 对应）
├── styles/           # 【专业】风格选择四张示例图（当前专业模式为占位，可后续替换）
├── tabbar/           # 原生 TabBar 图标（本项目使用自定义 TabBar + Vant 图标时可不放置）
├── icons/            # 其他通用小图标（可选，优先 Vant 图标）
└── login/            # 【登录】品牌插画或背景（可选）
```

以下子目录若不存在，可自建；仓库中可能仅有 `.gitkeep` 占位。

---

## 二、按页面与功能对照（核心）

### 1. 极简制作 `pages/simple-create/`

| 资源位置 | 文件（建议命名） | 用途 | 代码位置（修改 `imageUrl` / `iconPath`） |
|----------|------------------|------|------------------------------------------|
| `minimal-flow/` | `channel-wechat.png` | 朋友圈/私域（绿） | `simple-create.js` → `publishChannels[0].iconPath` 设为 `/images/minimal-flow/channel-wechat.png` |
| `minimal-flow/` | `channel-xhs.png` | 小红薯（红） | 同上，`[1].iconPath` |
| `minimal-flow/` | `channel-douyin.png` | dou音（黑） | 同上，`[2].iconPath` |
| `minimal-flow/` | `channel-ecom.png` | 电商主图（橙） | 同上，`[3].iconPath` |
| `reference-styles/美食/` … | `极简留白.png`、`美食特写.png`、`带手入镜.png` 等共 5 张 | 第三步 · 美食品类参考缩略图 | `simple-create.js` → `imageUrl` 已为 `/images/reference-styles/美食/<风格名>.png` |
| `reference-styles/鞋服/` … | 共 12 张 | 第三步 · 鞋服 | 同上 |
| `reference-styles/生活用品/` … | 共 6 张 | 第三步 · 生活用品 | 同上 |
| `reference-styles/_extras/` | 临时素材 | 未接入第三步网格的备用图，可自行清理 | — |
| `reference-styles/_stock/` | `jimeng-*.png` | 根目录临时样张，**未接入代码** | — |
| `lottie/` | `generating.json`（示例名） | 第五步「正在生成」过渡动画 | 在 `simple-create.wxml` 中 `#lottie-generating-slot` 内接入 Lottie 后读取；**JSON 放此目录** |

**说明：**

- 第一步渠道图标：代码中已配置 `iconPath` 指向 `/images/minimal-flow/*.png`，请将对应 PNG 放入该目录。
- 第三步参考风格：当前已使用包内 **`/images/reference-styles/<品类>/<风格名>.png`**（与 `simple-create.js` 中名称一致）。若从「图片」临时目录批量迁入，可复用仓库内 `scripts/move_reference_images.py`（会处理 `俯视平铺`→`服饰平铺`、`光影塑性`→`光影塑形` 等重命名）。
- 第五步结果图由**接口返回 URL**，一般不放入 `images/`。

---

### 2. 首页 `pages/home/`

| 资源位置 | 文件（建议命名） | 用途 | 代码位置 |
|----------|------------------|------|----------|
| `banners/` | `tutorial.jpg` | 「1 分钟玩转小店长教程」横幅 | `home.wxml` 中 `banner-image` 的 `src`，建议改为 `/images/banners/tutorial.jpg`；对应修改 `home.wxml` |
| `inspiration/` | `inspiration-1.jpg` … `inspiration-4.jpg` | 灵感橱窗瀑布流卡片 | `home.js` → `inspirationListLeft` / `inspirationListRight` 各条目的 `imageUrl` |

**说明：**

- 横幅当前为 Unsplash 外链，建议改为本地 **约 750×340（约 2.2:1）** JPG。
- 头像：无头像时使用占位；若需默认头像，可改为 `/images/icons/default-avatar.png` 并在 `home.wxml` 中替换默认 `src`。

---

### 3. 登录页 `pages/login/`

| 资源位置 | 文件（建议命名） | 用途 | 代码位置 |
|----------|------------------|------|----------|
| `login/` | `hero.jpg` 或 `brand.png` | 顶部大图 / 品牌区 | `login.wxml` 顶部 `<image>` 的 `src`（当前为 placeholder 外链） |

---

### 4. 我的 `pages/profile/`

| 资源位置 | 文件（建议命名） | 用途 | 代码位置 |
|----------|------------------|------|----------|
| — | — | 默认头像（未登录微信头像时） | `profile.wxml` 中 `user-avatar` 默认图为 Unsplash，可改为 `/images/icons/default-avatar.png` |

---

### 5. 专业制作 `pages/pro-create/`（当前为占位，专业流程未完整开放）

- 页面内已无「视觉风格 / 画面滤镜」配图列表；若后续恢复风格预设，可再将 `images/styles/` 下素材与代码字段对齐。

---

### 6. 独立结果页 `pages/create-result/`（从其它入口带参进入时）

- 主图地址来自缓存/接口中的 `imageUrl`，**不强制**固定文件名；若需默认占位，可与极简第五步结果图策略一致，使用接口 URL。

---

## 三、图片放置步骤（推荐顺序）

按依赖关系从「极简主流程」到「其它页面」依次完成即可。

1. **第一步 · 发布渠道（4 张 PNG）**  
   - 目录：`images/minimal-flow/`  
   - 文件名：`channel-wechat.png`、`channel-xhs.png`、`channel-douyin.png`、`channel-ecom.png`  
   - 与 `simple-create.js` 中 `publishChannels` 的 `iconPath` 一致（已写死为上述路径）。

2. **第三步 · 参考风格（可选本地化，共 23 张）**  
   - 目录建议：`images/reference-styles/`（可按品类分子目录）  
   - 将 `simple-create.js` 中 `referenceStyleCategories` → 各 `styles[].imageUrl` 改为包内路径；当前默认 Unsplash，需配置合法域名或改为本地。

3. **第五步 · 等待动画（可选）**  
   - 目录：`images/lottie/`  
   - 放入 Lottie 导出的 JSON，在 `simple-create.wxml` 的 `#lottie-generating-slot` 内接入组件或 canvas。

4. **首页 · 横幅（1 张）**  
   - 目录：`images/banners/` → 如 `tutorial.jpg`  
   - 修改 `home.wxml` 横幅 `src`。

5. **首页 · 灵感橱窗（4 张）**  
   - 目录：`images/inspiration/`  
   - 修改 `home.js` 中各条 `imageUrl`。

6. **登录 / 默认头像 / 专业模式风格图**  
   - 见下文「按页面与功能对照」第二节至第五节；可放在 `login/`、`icons/`、`styles/`。

---

## 四、与「极简流程」强相关的清单（便于你一次性准备）

1. **minimal-flow** ×4：渠道图标 PNG。  
2. **reference-styles**（可选）×23：第三步各品类参考风格缩略图 JPG。  
3. **lottie** ×1（或多套）：等待动画 JSON。  
4. **banners** ×1：首页教程横幅。  
5. **inspiration** ×4：灵感卡片。

---

## 五、命名与格式建议

```
[模块]-[用途]-[可选状态].扩展名

示例：channel-wechat.png、layout-minimal.jpg、banner-tutorial.jpg
```

| 类型 | 推荐格式 | 尺寸参考 | 单张体积（建议） |
|------|----------|----------|------------------|
| 渠道小图标 | PNG（可透明） | 128～256 px 边长 | 建议小于 30KB |
| 构图 / 风格缩略图 | JPG | 300×400 或同比例 | 建议小于 100KB |
| 首页横幅 | JPG | 750×340 左右 | 建议小于 150KB |
| Lottie | JSON | 由设计导出 | 按项目控制 |
| TabBar（若使用） | PNG | 81×81 @2x | 建议小于 20KB |

---

## 六、代码中引用本地图片示例

```wxml
<image src="/images/banners/tutorial.jpg" mode="aspectFill" />
<image src="/images/minimal-flow/channel-wechat.png" mode="aspectFit" />
```

```javascript
// simple-create.js — 示例：某条参考风格改为本地图
// referenceStyleCategories[0].styles[0].imageUrl = '/images/reference-styles/food/cheese.jpg'
publishChannels: [
  { id: 1, name: '朋友圈/私域', iconPath: '/images/minimal-flow/channel-wechat.png' },
  // ...
]
```

---

## 七、当前仍使用网络占位、建议逐步替换为上的位置汇总

| 当前来源（类型） | 建议替换为 |
|------------------|------------|
| `home.wxml` 横幅 Unsplash | `/images/banners/tutorial.jpg` |
| `home.js` 灵感卡片 placeholder | `/images/inspiration/inspiration-*.jpg` |
| `home.wxml` / `login.js` 默认头像 placeholder | `/images/icons/default-avatar.png` |
| `simple-create.js` `referenceStyleCategories` 外链 | `/images/reference-styles/` 本地 JPG |
| `simple-create.js` 模拟生成 `imageUrl`（上线后一般由接口返回） | 接口 CDN，开发期可用 `/images/misc/result-demo.jpg` 等 |
| `pro-create.js` 风格图 Unsplash | `/images/styles/*.jpg` |
| `profile.wxml` 默认头像 Unsplash | `/images/icons/default-avatar.png` |

---

## 八、压缩与源文件

- 压缩：TinyPNG、Squoosh、图压等。  
- 建议保留 PSD / Figma 源文件，便于改尺寸与换文案。

---

**文档版本**：与当前工程极简五步（第三步为全渠道参考图、第四步按渠道分支）、首页、登录、我的、专业占位逻辑对齐；若你后续改页面字段名，请同步更新本表中的「代码位置」列。
