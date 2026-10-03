# 互补数字人 - 开发环境准备指南

## 📋 开发环境清单

在开始编码前，你需要准备以下环境：

| 工具/服务 | 用途 | 优先级 | 预计时间 |
|----------|------|--------|---------|
| 微信小程序账号 | 发布小程序 | ⭐⭐⭐ 必须 | 1-3天 |
| 微信开发者工具 | 开发调试 | ⭐⭐⭐ 必须 | 即时 |
| Node.js + npm | 运行uni-app | ⭐⭐⭐ 必须 | 10分钟 |
| HBuilderX | uni-app IDE | ⭐⭐ 推荐 | 即时 |
| 文心一言API | AI对话 | ⭐⭐ 推荐 | 1-7天 |

---

## 1️⃣ 第一步：注册微信小程序账号

### 1.1 注册地址
访问微信公众平台：https://mp.weixin.qq.com/

### 1.2 注册流程

```
1. 点击"立即注册"
2. 选择"小程序"
3. 填写邮箱和密码
4. 邮箱激活
5. 信息登记（选择个人/企业）
6. 完成注册
```

### 1.3 重要提示

- **个人开发者也可以注册小程序**，不需要公司
- 注册时需要**实名认证**（微信支付绑定）
- 小程序名称可以后期修改
- **AppID** 会在注册后生成，这是你小程序的唯一标识

### 1.4 注册后获取的信息

```
AppID: wxxxxxxxxxxxxxxxxx  （18位数字字母组合）
AppSecret: xxxxxxxxxxxxxx  （重要！不要泄露）
```

### 1.5 需要设置的内容

- 设置小程序名称（建议：互补数字人）
- 设置小程序简介
- 设置服务类目（建议：工具 > 效率）
- 上传小程序图标（建议尺寸：108x108）

---

## 2️⃣ 第二步：安装微信开发者工具

### 2.1 下载地址
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 2.2 安装步骤

```
1. 下载对应系统的稳定版
2. 运行安装程序
3. 使用微信扫码登录
4. 完成安装
```

### 2.3 主要功能

- 实时预览效果
- 代码编辑和调试
- 项目管理
- 性能分析

---

## 3️⃣ 第三步：安装Node.js和npm

### 3.1 为什么需要Node.js？

uni-app基于Node.js环境运行，需要npm来管理项目依赖。

### 3.2 下载地址
https://nodejs.org/zh-cn/

选择 **LTS（长期支持版）**，推荐版本：**18.x 或 20.x**

### 3.3 安装验证

打开终端（Windows用PowerShell，Mac用Terminal），输入：

```bash
# 检查Node.js版本
node -v

# 检查npm版本
npm -v
```

如果显示版本号（如 v18.17.0），说明安装成功。

### 3.4 加速npm（可选但推荐）

由于npm服务器在国外，下载依赖较慢，可以设置淘宝镜像：

```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 恢复官方镜像
npm config set registry https://registry.npmjs.org
```

---

## 4️⃣ 第四步：安装HBuilderX（推荐IDE）

### 4.1 为什么推荐HBuilderX？

- DCloud官方出品的uni-app专用IDE
- 对Vue和uni-app语法有良好支持
- 内置模拟器和调试工具
- 比微信开发者工具更适合uni-app开发

### 4.2 下载地址
https://www.dcloud.io/hbuilderx.html

### 4.3 安装步骤

```
1. 下载App开发版（包含所有功能）
2. 解压到指定目录
3. 运行HBuilderX
4. 设置代码格式化工具
```

### 4.4 常用快捷键

| 功能 | Windows | Mac |
|------|---------|-----|
| 格式化代码 | Ctrl+Shift+F | Cmd+Shift+F |
| 保存文件 | Ctrl+S | Cmd+S |
| 搜索文件 | Ctrl+P | Cmd+P |
| 打开终端 | Ctrl+Shift+Y | Cmd+Shift+Y |

---

## 5️⃣ 第五步：申请文心一言API（可选但推荐）

### 5.1 为什么需要？

这是小程序AI对话的核心功能，让数字人能够智能回复。

### 5.2 申请地址
https://cloud.baidu.com/product/wenxinworkshop

### 5.3 申请步骤

```
1. 注册百度智能云账号
2. 实名认证
3. 开通文心一言服务
4. 创建应用获取API Key
5. 充值/购买资源包
```

### 5.4 价格说明

```
文心一言3.5: ¥0.012/千tokens（约1分钱100条对话）
文心一言4.0: ¥0.12/千tokens
首次注册有免费额度
```

### 5.5 获取的信息

```
API Key: xxxxxxxxxxxxxxxxxxxx
Secret Key: xxxxxxxxxxxxxxxxxxxx
```

### 5.6 备选方案

如果暂时不想付费，可以使用：
- **GPT-4**（需要API Key代理服务）
- **通义千问**（阿里云，免费额度）
- **本地模拟**（先用预设回答，后期接入AI）

---

## 6️⃣ 第六步：创建uni-app项目

### 6.1 方法一：使用HBuilderX（推荐）

```
1. 打开HBuilderX
2. 文件 → 新建 → 项目
3. 选择：uni-app → Vue 3版本
4. 填写项目名称：complement-digital-human
5. 选择模板：默认模板
6. 点击创建
```

### 6.2 方法二：使用命令行

```bash
# 创建项目
npx degit dcloudio/uni-preset-vue#vite-ts complement-digital-human

# 进入目录
cd complement-digital-human

# 安装依赖
npm install

# 运行项目
npm run dev:mp-weixin
```

### 6.3 目录结构说明

```
complement-digital-human/
├── src/
│   ├── pages/           # 页面文件
│   ├── static/         # 静态资源
│   ├── App.vue         # 应用入口
│   ├── main.ts         # 主入口
│   ├── manifest.json   # 应用配置
│   └── pages.json      # 页面路由
├── node_modules/       # 依赖
├── package.json        # 项目配置
└── vite.config.ts     # Vite配置
```

---

## 7️⃣ 第七步：在微信开发者工具中导入项目

### 7.1 操作步骤

```
1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择项目目录
4. 填写AppID
5. 选择开发模式：uni-app
6. 点击确认
```

### 7.2 首次运行配置

```
1. 编译模式：uni-app
2. 编译插件：已安装
3. 点击"编译"
4. 等待预览窗口打开
```

### 7.3 常见问题

| 问题 | 解决方案 |
|------|---------|
| 编译失败 | 检查Node.js版本，重装依赖 |
| 预览空白 | 检查pages.json配置 |
| 样式异常 | 确认使用了合适的单位 |

---

## 8️⃣ 第八步：项目初始化配置

### 8.1 修改manifest.json

```json
{
  "name": "互补数字人",
  "appid": "你的AppID",
  "description": "与使用者人格互补的AI数字人",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false
}
```

### 8.2 安装必要依赖

```bash
# 状态管理
npm install pinia

# UI组件库
npm install @dcloudio/uni-ui

# 工具库
npm install dayjs
```

### 8.3 配置pages.json

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "互补数字人"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "white",
    "navigationBarTitleText": "互补数字人",
    "navigationBarBackgroundColor": "#1E40AF",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1E40AF",
    "backgroundColor": "#FFFFFF",
    "list": [
      {
        "pagePath": "pages/persona/index",
        "text": "人格"
      },
      {
        "pagePath": "pages/chat/index",
        "text": "对话"
      },
      {
        "pagePath": "pages/settings/index",
        "text": "设置"
      }
    ]
  }
}
```

---

## 📅 预计时间安排

| 步骤 | 预计时间 | 备注 |
|------|---------|------|
| 注册微信账号 | 1-3天 | 包含实名认证 |
| 安装开发者工具 | 10分钟 | 即时完成 |
| 安装Node.js | 10分钟 | 即时完成 |
| 安装HBuilderX | 5分钟 | 即时完成 |
| 申请文心API | 1-7天 | 审核时间 |
| 创建项目 | 20分钟 | 即时完成 |

**总计预计时间**：1-7天（主要取决于微信账号审核）

---

## ⚠️ 重要提醒

1. **AppID和Secret不要泄露**，这是你小程序的身份凭证
2. **微信开发者工具需要保持登录**，建议使用常用微信账号
3. **定期保存代码**，避免意外丢失
4. **先完成基础功能**，AI功能可以后期再接入

---

## ✅ 环境检查清单

在开始编码前，确认以下项目：

```
□ 微信小程序账号已注册
□ 微信开发者工具已安装并登录
□ Node.js已安装（版本 ≥ 16）
□ npm已安装（版本 ≥ 8）
□ HBuilderX已安装（可选）
□ 文心一言API已申请（可选）
□ uni-app项目已创建
□ 项目可以在开发者工具中运行
```

---

**文档版本**：1.0
**创建日期**：2025年
**状态**：待执行
