# AI小店长 - 微信小程序

基于大模型的双轨制电商营销助理微信小程序。

## 项目结构

```
ai_store_manager/
├── app.js                 # 小程序入口逻辑
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── sitemap.json           # 站点地图
├── README.md              # 项目说明
│
├── pages/                 # 页面目录
│   ├── login/             # 登录页
│   │   ├── login.wxml
│   │   ├── login.wxss
│   │   ├── login.js
│   │   └── login.json
│   │
│   ├── home/              # 首页
│   │   ├── home.wxml
│   │   ├── home.wxss
│   │   ├── home.js
│   │   └── home.json
│   │
│   ├── simple-create/     # 极简制作页
│   │   ├── simple-create.wxml
│   │   ├── simple-create.wxss
│   │   ├── simple-create.js
│   │   └── simple-create.json
│   │
│   ├── pro-create/        # 专业制作页
│   │   ├── pro-create.wxml
│   │   ├── pro-create.wxss
│   │   ├── pro-create.js
│   │   └── pro-create.json
│   │
│   └── profile/           # 个人主页
│       ├── profile.wxml
│       ├── profile.wxss
│       ├── profile.js
│       └── profile.json
│
├── utils/                 # 工具函数
│   ├── util.js            # 通用工具
│   └── api.js             # API封装
│
└── images/                # 图片资源
    └── tabbar/            # TabBar图标
```

## 功能模块

### 1. 登录页 (pages/login)
- 微信一键授权登录
- 用户协议和隐私政策
- 首次登录赠送制作额度

### 2. 首页 (pages/home)
- 用户信息和模式切换（极简/专业）
- 活动横幅（教程入口）
- 快速开始制作按钮
- 灵感橱窗（瀑布流展示模板）

### 3. 极简制作 (pages/simple-create)
- 4步向导式制作流程
- Step 1: 输入产品/上传图片
- Step 2: 选择画面结构
- Step 3: 选择氛围风格
- Step 4: 选择发布平台和文案语气

### 4. 专业制作 (pages/pro-create)
- 高清原图上传
- 分发平台选择
- 视觉风格选择（带缩略图）
- 高级参数调节（自定义提示词、重绘幅度、风格强度）
- 实时参数滑块

### 5. 个人中心 (pages/profile)
- 用户信息展示
- VIP 状态
- 剩余生成次数
- 快捷入口（我的作品、我的草稿）
- 设置列表（充值中心、帮助教程、客服、关于）
- 切换账号

## 技术特点

### 视觉风格
- **设计风格**: Material Design 3 + 极简主义
- **主色调**: `#006c49` (翡翠绿) + `#10b981`
- **圆角规范**: 标准圆角 32rpx, 胶囊/按钮 9999rpx
- **阴影规范**: 层次分明，营造深度感

### 尺寸单位
- 使用 `rpx` 作为响应式单位
- 基准宽度 750rpx
- 安全区适配使用 `env(safe-area-inset-bottom)`

### 组件规范
- 使用小程序原生组件 (view, text, image, scroll-view, slider 等)
- 图片使用 `mode="aspectFill"` 防止变形
- 可滚动区域使用 `scroll-view`
- 自定义导航栏使用 `navigationStyle: "custom"`

### 状态管理
- 使用本地存储 `wx.setStorageSync` 管理登录状态
- 全局数据存储在 `app.js` 的 `globalData` 中

## 快速开始

1. 使用微信开发者工具打开项目
2. 在 `utils/api.js` 中配置后端 API 地址
3. 替换 `images/tabbar/` 中的 TabBar 图标
4. 上传代码到微信小程序后台

## 页面路由

| 路径 | 说明 |
|------|------|
| /pages/login/login | 登录页 |
| /pages/home/home | 首页（TabBar） |
| /pages/simple-create/simple-create | 极简制作 |
| /pages/pro-create/pro-create | 专业制作 |
| /pages/profile/profile | 个人中心（TabBar） |

## TabBar 配置

```json
{
  "list": [
    { "pagePath": "pages/home/home", "text": "首页" },
    { "pagePath": "pages/profile/profile", "text": "我的" }
  ]
}
```

## 注意事项

1. 图片资源需要替换为实际的 TabBar 图标（81x81px PNG）
2. 生产环境需要配置合法域名
3. 后端 API 需要实现 JWT 认证
4. 模板图片数据建议从后端动态获取

## 开发规范

### 命名规范
- 组件/页面: kebab-case (如 `simple-create`)
- JavaScript: camelCase
- CSS 类名: kebab-case

### 文件组织
- 每个页面独立目录，包含 4 个文件（wxml/wxss/js/json）
- 公共工具放在 `utils/` 目录
- 图片资源放在 `images/` 目录

### 代码风格
- 使用 ES6+ 语法
- 异步使用 Promise 或 async/await
- 错误处理使用 try-catch
