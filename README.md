# BiteDex 一口图鉴

> Turn every bite into a card. 把每一口食物，变成一张可以收藏的卡。

BiteDex 是一个拍照识别食物、生成收藏型食物卡片、用 AI 宠物反馈饮食状态的轻量饮食记录应用。

## 核心功能

- **拍照识别** — 上传食物照片，Gemini AI 识别营养并生成 Food Dex 卡片
- **食物图鉴** — Cream Card 风格的收藏型卡片，低信息密度、大图优先
- **宠物状态** — 根据今日饮食自动切换宠物形态（Normal / Energized / Chubby / Tired / Sugar Rush / Overloaded）
- **AI 对话** — DeepSeek 驱动的宠物聊天，宠物会根据你的饮食数据回复
- **Feeding Log** — 每张食物卡都有 AI 生成的个性化宠物反馈
- **宠物仓库** — 从图鉴选 3 个食物，AI 生成原创 Food Pet 收藏生物
- **7 日分析** — 近一周的饮食趋势、宠物状态分布、营养建议
- **中英双语** — 全页面支持中文/英文切换

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js App Router |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 图标 | lucide-react |
| 食物识别 | Gemini 2.5 Flash (多模态) |
| 宠物对话 / Feeding | DeepSeek v4-flash |
| 宠物图片生成 | 豆包 Seedream (火山引擎) |
| 数据校验 | Zod |
| 存储 | localStorage |
| 部署 | Vercel / 本地 |

## 页面结构

```
/              — Dashboard 首页（宠物状态 + 今日汇总 + 时间线）
/capture       — 拍照上传 + AI 识别 + 生成 Food Dex 卡片
/dex           — 食物图鉴（Cream Card 两列网格）
/pet           — 宠物房（Feeding Log + AI Chat）
/pet-warehouse — 宠物仓库（选 3 食物生成原创 Food Pet）
/analysis      — 7 日饮食分析
```

## API 路由

```
POST /api/recognize       — Gemini 食物识别
POST /api/pet-chat        — DeepSeek 宠物自由对话
POST /api/feeding-review  — DeepSeek 单卡宠物反馈
POST /api/generate-pet    — 豆包 AI 生成宠物图片
```

## 快速开始

```bash
# 克隆
git clone https://github.com/Nyarlathoteppppp/BiteDex.git
cd BiteDex

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入 API Key

# 开发模式（局域网可访问）
npm run dev

# 生产构建
npm run build
npm run start -- --hostname 0.0.0.0
```

## 环境变量

| 变量 | 用途 | 获取方式 |
|------|------|----------|
| `GEMINI_API_KEY` | 食物识别 | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `DEEPSEEK_API_KEY` | 宠物对话 + Feeding | [DeepSeek Platform](https://platform.deepseek.com/) |
| `AI_API_KEY` | 宠物图片生成 | 火山引擎 API |

## 宠物状态规则

| 条件 | 状态 |
|------|------|
| 今日 kcalMin > 2800 | Overloaded（过载） |
| 高糖食物 ≥ 2 | Sugar Rush（糖分亢奋） |
| 记录 ≥ 2 且 kcalMax < 1000 | Tired（虚弱） |
| kcalMin > 2200 或高脂 ≥ 2 | Chubby（偏胖） |
| kcalMin 1200–2200 且 protein ≥ 60g | Energized（精神） |
| 其他 | Normal（普通） |

## 食物卡稀有度

| 等级 | 条件 |
|------|------|
| N | kcalMax < 300 |
| R | kcalMax ≥ 300 |
| SR | kcalMax ≥ 600 |
| SSR | kcalMax ≥ 900 |

含糖/油脂标签自动升一级。

## 宠物仓库

从 Food Dex 图鉴中选择 3 种食物 → AI 根据食物属性生成原创 Food Pet：

- 随机视觉风格（奶油手绘 / 软陶 / 毛绒 / 水彩图鉴等 12 种）
- 随机生物骨架（水豚 / 刺猬 / 小龙 / 蘑菇精灵等 24 种）
- 食物元素转化为宠物身体特征（面包→柔软纹理，蛋黄→发光斑点）

## 手机访问

开发模式默认监听 `0.0.0.0:3000`，同局域网设备可直接访问电脑 IP。

WSL2 用户需要额外配置端口转发：
```powershell
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL IP>
```

## 项目结构

```
app/
├── page.tsx              — Dashboard
├── capture/page.tsx      — 拍照识别
├── dex/page.tsx          — 食物图鉴
├── pet/page.tsx          — 宠物房
├── pet-warehouse/page.tsx — 宠物仓库
├── analysis/page.tsx     — 7日分析
├── api/                  — API 路由
├── components/           — 共享组件
lib/
├── nutrition/            — 宠物状态 / 营养计算 / 图鉴合并
├── storage/              — localStorage 读写
├── recognition/          — Gemini 识别 + Schema
├── pet-warehouse/        — 宠物生成 Profile + Prompt
├── mock/                 — 模拟数据 / Fallback
├── utils/                — 日期 / ID 工具
├── i18n.ts               — 中英文国际化
types/
└── index.ts              — 全局类型定义
```

## License

MIT
