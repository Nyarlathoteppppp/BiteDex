**固定宠物图片 + Gemini 视觉识别 + 本地规则计算 + localStorage MVP**。

参考官方信息：Gemini API 支持多模态图片输入，官方推荐使用 Google GenAI SDK；结构化输出支持 JSON Schema，也可配合 TypeScript/Zod 做校验。  
来源：Google Gemini API 图片理解文档、SDK 文档、结构化输出文档：  
https://ai.google.dev/gemini-api/docs/image-understanding  
https://ai.google.dev/gemini-api/docs/libraries  
https://ai.google.dev/gemini-api/docs/structured-output

---

# BiteDex MVP 新版方案

## 1. 新项目定位

**BiteDex 一口图鉴** 是一个拍照识别食物、生成食物卡片，并用固定宠物图片反馈饮食状态的轻量饮食记录应用。

一句话：

> 拍一口食物，生成一张食物卡；今天吃得多不多，宠物会直接变胖、变瘦、变精神或糖分亢奋。

新版重点不再做复杂宠物动画，而是用**几张固定宠物状态图**完成视觉反馈。

---

# 2. 新技术栈

```text
前端框架：Next.js App Router
语言：TypeScript
样式：Tailwind CSS
组件：自写组件即可，必要时用 lucide-react 图标
后端接口：Next.js Route Handler
食物识别：Gemini 多模态模型
模型 SDK：@google/genai
结构化输出：Gemini JSON Schema / JSON mode
数据校验：Zod
状态存储：localStorage
部署：Vercel
图片方案：上传图本地预览，宠物图放 public/pets
```

## 环境变量

```text
GEMINI_API_KEY=xxx
```

## 推荐模型

黑客松 MVP 推荐：

```text
gemini-2.5-flash
```

理由：

```text
速度快
成本低
支持图片理解
适合食物识别、结构化营养估算
```

如果你明天只追求稳定演示，先用 mock，最后再切 Gemini。

---

# 3. 新 MVP 核心闭环

```text
上传食物照片
↓
Gemini 识别食物
↓
返回结构化营养估算
↓
生成 FoodCard
↓
保存到今日记录
↓
累计热量和营养
↓
根据规则计算宠物状态
↓
切换固定宠物图片
↓
生成宠物对话框
↓
进入食物图鉴
↓
生成 7 日分析
```

---

# 4. 固定宠物图片方案

## 图片放置

```text
/public/pets/normal.png
/public/pets/energized.png
/public/pets/chubby.png
/public/pets/tired.png
/public/pets/sugar-rush.png
/public/pets/overloaded.png
```

## 宠物状态

```text
Normal：普通状态
Energized：精神状态
Chubby：吃多变胖
Tired：吃太少变虚弱
Sugar Rush：糖分亢奋
Overloaded：热量过载
```

## 宠物图片映射

```ts
const petImages = {
  normal: "/pets/normal.png",
  energized: "/pets/energized.png",
  chubby: "/pets/chubby.png",
  tired: "/pets/tired.png",
  sugar_rush: "/pets/sugar-rush.png",
  overloaded: "/pets/overloaded.png",
}
```

## 判断规则

```text
今日 kcalMin > 2800 → Overloaded
高糖食物 ≥ 2 → Sugar Rush
记录数 ≥ 2 且 kcalMax < 1000 → Tired
kcalMin > 2200 或高脂食物 ≥ 2 → Chubby
kcalMin 1200–2200 且 protein ≥ 60g → Energized
其他 → Normal
```

这个方案比动态宠物更适合黑客松：图片可控、演示直观、开发成本低。

---

# 5. Gemini 识别职责

Gemini 只负责这件事：

```text
看图
识别食物
估算份量
估算热量区间
估算蛋白质/碳水/脂肪
输出标签
输出一句建议
```

Gemini 不负责：

```text
宠物状态
宠物图片选择
今日累计
图鉴
7 日分析
localStorage
```

这些全部本地规则计算。

---

# 6. Gemini 输出结构

```json
{
  "foodName": "Chocolate Cake",
  "portion": "1 slice",
  "estimatedMealType": "snack",
  "kcalMin": 320,
  "kcalMax": 460,
  "protein": 5,
  "carbs": 52,
  "fat": 18,
  "tags": ["dessert", "sweet", "high_sugar", "snack"],
  "confidence": 0.84,
  "biteScore": 38,
  "advice": "High in sugar and fat. Better treated as an occasional snack."
}
```

标签必须限制在固定池：

```text
high_sugar
high_fat
high_carb
high_protein
sweet
dessert
drink
snack
fried
creamy
fast_food
balanced
low_calorie
high_calorie
```

---

# 7. 页面规划

## `/` 首页 Dashboard

展示顺序：

```text
App name
宠物图片
宠物状态
宠物对话框
今日总热量
今日蛋白质 / 碳水 / 脂肪
今日代表卡
今日饮食时间线
上传按钮
```

首页第一视觉必须是宠物图。

---

## `/capture` 上传页

功能：

```text
上传图片
图片预览
选择 mealType
点击 Analyze
调用 /api/recognize
展示识别结果卡片
确认加入今日记录
```

为了赶时间，不单独做 `/result`。识别结果直接放在 `/capture` 页面。

---

## `/dex` 食物图鉴

功能：

```text
展示所有识别过的食物
显示次数
显示平均热量区间
显示最高稀有度
显示标签
显示代表图片
```

---

## `/analysis` 7 日分析

功能：

```text
近 7 日记录天数
总食物卡数量
平均每日热量区间
最高热量日
高糖天数
高脂天数
宠物状态分布
总结建议
```

---

# 8. 数据结构

## FoodCard

```ts
type FoodCard = {
  id: string
  date: string
  time: string
  mealType: MealType
  foodName: string
  portion: string
  imageUrl: string
  kcalMin: number
  kcalMax: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  rarity: "N" | "R" | "SR" | "SSR"
  biteScore: number
  confidence: number
  advice: string
  createdAt: string
}
```

## PetState

```ts
type PetState = {
  status: "normal" | "energized" | "chubby" | "tired" | "sugar_rush" | "overloaded"
  title: string
  imageUrl: string
}
```

## PetDialogue

```ts
type PetDialogue = {
  title: string
  message: string
  reason: string
  suggestion: string
}
```

---

# 9. 本地存储

```text
bitedex.dailyLogs.v1
bitedex.dex.v1
```

图片处理建议：

```text
上传预览：object URL
保存记录：压缩后的 base64
```

如果时间紧：

```text
先存 imageUrl
刷新后图片可能丢失也可以接受
```

但图鉴最好存一张压缩图，不然展示会空。

---

# 10. API 设计

## `POST /api/recognize`

输入：

```text
multipart/form-data
- image
- mealType
```

流程：

```text
读取图片
转 base64
传给 Gemini
要求返回 JSON
用 Zod 校验
失败则返回 fallback
```

返回：

```ts
type RecognizeResponse = {
  success: boolean
  data?: RecognizedFood
  error?: string
}
```

---

# 11. fallback 方案

如果 Gemini 失败，页面不能断。

准备模板：

```text
Rice Bowl
Sandwich
Burger
Noodles
Salad
Fried Chicken
Pizza
Dessert
Milk Tea
Coffee
Fruit
```

用户可以选择一个模板继续生成 FoodCard。

这是黑客松必须要有的保险。

---

# 12. 新开发优先级

## P0 必须完成

```text
Next.js 项目
首页 Dashboard
固定宠物图片展示
本地规则 computePetState
宠物对话框 generatePetDialogue
上传页
mock 识别
FoodCard 生成
localStorage 保存
今日时间线
今日营养累计
删除记录
```

## P1 尽量完成

```text
Gemini /api/recognize
图鉴页
今日代表卡
7 日分析页
Zod 校验
fallback 模板
```

## P2 有时间再做

```text
宠物轻微动效
分享卡
成就系统
图鉴筛选
手动编辑食物卡
```

---

# 13. 明天最稳开发顺序

```text
1. 搭 Next.js + Tailwind
2. 放入 6 张宠物图
3. 写 types.ts
4. 写 nutrition.ts 本地规则
5. 写 storage.ts localStorage
6. 做首页，用假数据
7. 做上传页，用 mock 识别
8. 打通添加 FoodCard → 首页更新
9. 做宠物状态图片切换
10. 做图鉴页
11. 做分析页
12. 最后接 Gemini
```

关键原则：

> 页面和本地闭环先活，模型最后接。

---

# 14. 新版演示流程

```text
打开首页，看到普通宠物
上传一张主食照片
Gemini 识别并生成食物卡
确认加入今日记录
首页热量累计变化
宠物状态仍然正常或 energized
再上传甜品 / 奶茶
触发 Sugar Rush
宠物图片切换成糖分亢奋状态
打开图鉴，看到已收集食物
打开分析页，看到近 7 日趋势
```

演示核心句可以改成：

> BiteDex 不是把饮食记录做成表格，而是把每一口变成可收集的食物卡，并用宠物图片直观反馈今天的饮食状态。