<div align="center">

<img src="cover.png" alt="BiteDex Cover" width="100%" />

<br />

# 🍽️ BiteDex 一口图鉴

**Turn every bite into a card.**

把每一口食物，变成一张可以收藏的卡。

<br />

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5-Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-v4--flash-5B6EF4?style=for-the-badge)](https://platform.deepseek.com/)

<br />

[🚀 快速开始](#-快速开始) · [✨ 核心功能](#-核心功能) · [📱 页面预览](#-页面结构) · [🔧 环境配置](#-环境变量)

</div>

---

## ✨ 核心功能

<table>
<tr>
<td width="50%">

### 📸 拍照识别
上传食物照片，Gemini AI 识别营养成分，自动生成 **Cream Card** 风格的收藏型食物卡片。

### 📖 食物图鉴
低信息密度、大图优先的两列图鉴网格。每张卡带图鉴编号、稀有度、热量和宠物影响值。

### 🐾 宠物状态
根据今日饮食自动切换宠物形态 —— Normal / Energized / Chubby / Tired / Sugar Rush / Overloaded。

</td>
<td width="50%">

### 💬 AI 宠物对话
DeepSeek 驱动的宠物聊天。宠物了解你今天吃了什么，用个性化语气回复。

### 🎨 宠物仓库
从图鉴选 3 个食物 → AI 生成原创 **Food Pet** 收藏生物。12 种视觉风格 × 24 种生物骨架随机组合。

### 📊 7 日分析
近一周饮食趋势、宠物状态分布、高糖/高脂天数统计、个性化建议。

</td>
</tr>
</table>

> 🌐 全页面支持 **中文 / English** 切换

---

## 🛠️ 技术栈

| 层级 | 技术 |
|:---:|:---|
| 🖥️ 前端 | **Next.js** App Router + **TypeScript** + **Tailwind CSS** |
| 🎨 图标 | **lucide-react** |
| 🔍 食物识别 | **Gemini 2.5 Flash** (多模态图片理解) |
| 💬 宠物对话 | **DeepSeek v4-flash** (OpenAI 兼容格式) |
| 🎨 宠物生成 | **豆包 Seedream** (火山引擎图片生成) |
| ✅ 数据校验 | **Zod** (结构化输出 + Schema) |
| 💾 存储 | **localStorage** (轻量级，零后端) |

---

## 📱 页面结构

```
/              → 🏠 Dashboard      宠物状态 + 今日汇总 + 饮食时间线
/capture       → 📸 Capture        拍照上传 + AI 识别 + Cream Card 生成
/dex           → 📖 Food Dex       食物图鉴（收藏型两列卡片网格）
/pet           → 🐾 Pet Room       Feeding Log (AI) + 自由对话
/pet-warehouse → 📦 Pet Warehouse  选 3 食物 → 生成原创 Food Pet
/analysis      → 📊 Analysis       7 日饮食分析 + 宠物状态分布
```

### API 路由

| 路由 | 功能 | AI 模型 |
|:---|:---|:---|
| `POST /api/recognize` | 食物识别 | Gemini 2.5 Flash |
| `POST /api/pet-chat` | 宠物自由对话 | DeepSeek v4-flash |
| `POST /api/feeding-review` | 单卡宠物反馈 | DeepSeek v4-flash |
| `POST /api/generate-pet` | 生成宠物图片 | 豆包 Seedream |

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/Nyarlathoteppppp/BiteDex.git
cd BiteDex

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 API Key

# 4. 启动开发服务器（局域网可访问）
npm run dev

# 或构建生产版本
npm run build && npm run start -- --hostname 0.0.0.0
```

---

## 🔧 环境变量

| 变量 | 用途 | 获取方式 |
|:---|:---|:---|
| `GEMINI_API_KEY` | 食物识别 | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `DEEPSEEK_API_KEY` | 宠物对话 + Feeding 反馈 | [DeepSeek Platform](https://platform.deepseek.com/) |
| `AI_API_KEY` | 宠物图片生成 | 火山引擎 API |

---

## 🐾 宠物状态规则

<table>
<tr><th>条件</th><th>状态</th><th>表现</th></tr>
<tr><td>kcalMin &gt; 2800</td><td>🤯 Overloaded</td><td>过载，宠物冒汗</td></tr>
<tr><td>高糖食物 ≥ 2</td><td>🤪 Sugar Rush</td><td>糖分亢奋，宠物兴奋</td></tr>
<tr><td>记录 ≥ 2 且 kcalMax &lt; 1000</td><td>😴 Tired</td><td>虚弱，宠物犯困</td></tr>
<tr><td>kcalMin &gt; 2200 或高脂 ≥ 2</td><td>🫃 Chubby</td><td>偏胖，宠物变圆</td></tr>
<tr><td>kcalMin 1200–2200 且 protein ≥ 60g</td><td>💪 Energized</td><td>精神满满</td></tr>
<tr><td>其他</td><td>😊 Normal</td><td>普通状态</td></tr>
</table>

## 🃏 食物卡稀有度

| 等级 | 条件 | 颜色 |
|:---:|:---|:---:|
| **N** | kcalMax < 300 | ⬜ 灰 |
| **R** | kcalMax ≥ 300 | 🟦 蓝 |
| **SR** | kcalMax ≥ 600 | 🟪 紫 |
| **SSR** | kcalMax ≥ 900 | 🟧 金 |

> 含糖/油脂标签自动升一级

---

## 🎨 宠物仓库 Food Pet 生成

从 Food Dex 中选择 **3 种食物** → AI 根据食物属性生成原创 Food Pet：

- 🎭 **12 种视觉风格** — 奶油手绘 / 软陶玩具 / 毛绒玩偶 / 水彩图鉴 / 复古博物 / 日系治愈贴纸 ...
- 🦔 **24 种生物骨架** — 水豚 / 刺猬 / 小龙 / 蘑菇精灵 / 饭团生物 / 布丁生物 ...
- 🍳 **食物特征转化** — 面包→柔软纹理 / 蛋黄→发光斑点 / 奶油→流动形状 / 辣味→脸颊红晕

---

## 📂 项目结构

```
app/
├── page.tsx                — Dashboard 首页
├── capture/page.tsx        — 拍照识别
├── dex/page.tsx            — 食物图鉴
├── pet/page.tsx            — 宠物房 (Feeding + Chat)
├── pet-warehouse/page.tsx  — 宠物仓库
├── analysis/page.tsx       — 7日分析
├── api/                    — API 路由
│   ├── recognize/          — Gemini 食物识别
│   ├── pet-chat/           — DeepSeek 对话
│   ├── feeding-review/     — DeepSeek 单卡反馈
│   └── generate-pet/       — 豆包图片生成
├── components/             — 共享 UI 组件
lib/
├── nutrition/              — 宠物状态 / 营养计算
├── storage/                — localStorage 存取
├── recognition/            — Gemini Schema + 调用
├── pet-warehouse/          — Food Pet Profile + Prompt
├── mock/                   — 模拟数据 / Fallback
├── utils/                  — 日期 / ID 工具
├── i18n.ts                 — 中英文国际化
types/
└── index.ts                — 全局类型定义
```

---

## 📱 手机访问

开发模式默认监听 `0.0.0.0:3000`，同局域网设备可直接访问。

<details>
<summary>WSL2 用户额外配置</summary>

```powershell
# 查看 WSL IP
wsl hostname -I

# 端口转发
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>

# 防火墙放行
netsh advfirewall firewall add rule name="BiteDex" dir=in action=allow protocol=TCP localport=3000
```

</details>

---

<div align="center">

**BiteDex** — 不是营养卡，不是外卖卡，而是一张安静、干净、可以收藏的食物图鉴卡。

Made with ❤️ for hackathon

</div>
