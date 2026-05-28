# Food Dex 卡片模式设计文档

## 1. 设计定位

Food Dex 的卡片不是传统饮食记录卡，也不是健身 App 的营养表格。

它的定位应该是：

```text
轻量食物图鉴卡
收藏型食物卡片
带基础营养反馈的小宠物养成入口
```

设计方向：

```text
CapWords 式极简网页审美
大留白
低信息密度
中心视觉
柔和立体卡片
轻收藏感
```

一句话定义：

```text
Food Dex = 把每一口食物，变成一张可以收藏的卡。
```

英文表达：

```text
Turn every bite into a card.
```

---

## 2. 设计目标

Food Dex 卡片需要同时完成 4 件事：

```text
1. 让用户觉得这张卡值得收藏
2. 让用户一眼看懂吃了什么
3. 只展示最核心的营养数据
4. 和小宠物状态系统产生连接
```

不做：

```text
复杂营养表
强健身 App 风格
密集数据堆叠
过多图标装饰
强烈渐变和高饱和色
```

---

## 3. 卡片基本结构

单张 Food Dex 主卡采用以下结构：

```text
┌──────────────────────────────┐
│ #024                    早餐  │  ← 图鉴编号 / 标签
│                              │
│ 牛油果鸡蛋吐司                 │  ← 食物名称
│ 2026.05.28                   │  ← 吃的日期
│                              │
│        [ 食物主图 ]            │  ← 中心视觉
│                              │
│ 今天这口很轻盈，但蛋白还不错。   │  ← 一句话描述
│                              │
│ 428 kcal      Protein 23g     │  ← 核心营养
│ Energy +8     Muscle +6       │  ← 宠物影响
└──────────────────────────────┘
```

固定信息层级：

```text
顶部：图鉴编号 + 标签
标题区：食物名称 + 吃的日期
中部：食物主图
中下：一句描述
底部：核心营养数据 + 宠物影响
```

---

## 4. 卡片正面信息

卡片正面只展示必要信息。

### 必须展示

```text
图鉴编号
食物名称
吃的日期
食物主图
一句描述
热量
蛋白质
宠物影响
```

### 不建议正面展示

```text
碳水
脂肪
糖分
钠
纤维
长段健康建议
复杂评分
过多标签
```

这些内容放到详情页或翻面卡中。

---

## 5. CapWords 风格转译

CapWords 类卡片的关键不是复杂装饰，而是：

```text
大留白
轻解释
柔和卡片
中心视觉突出
文字很少但很准确
按钮和标签很克制
```

Food Dex 应该继承这种感觉。

### 页面背景

推荐：

```css
background:
  radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9), transparent 42%),
  linear-gradient(180deg, #fbf6ee 0%, #f5ecdf 100%);
```

视觉效果：

```text
奶油白
浅米色
安静
干净
没有强视觉噪音
```

---

## 6. 核心视觉参数

建议直接使用以下设计参数。

```text
页面背景：#fbf6ee
卡片背景：#fffdf8
主文字：#1f1b16
副文字：#9b856d
标签背景：#f3eadc
卡片边框：rgba(70, 50, 30, 0.08)
圆角：32px
图片圆角：26px
卡片宽度：360px
卡片内边距：22px
图片比例：1:1
卡片阴影：0 24px 70px rgba(70, 50, 30, 0.10)
```

---

## 7. 卡片整体 CSS

```css
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9), transparent 42%),
    linear-gradient(180deg, #fbf6ee 0%, #f5ecdf 100%);
  display: flex;
  justify-content: center;
  padding: 40px 16px;
}

.food-card {
  width: min(360px, calc(100vw - 32px));
  padding: 22px;
  border-radius: 32px;
  background: rgba(255, 253, 248, 0.96);
  border: 1px solid rgba(70, 50, 30, 0.08);
  box-shadow:
    0 24px 70px rgba(70, 50, 30, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}
```

---

## 8. 顶部区域设计

顶部只放两个东西：

```text
左侧：图鉴编号
右侧：分类标签
```

示例：

```text
#024                         早餐
```

CSS：

```css
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dex-id {
  font-size: 13px;
  color: #a08a73;
  letter-spacing: 0.02em;
}

.card-tag {
  padding: 6px 11px;
  border-radius: 999px;
  background: #f3eadc;
  color: #7b624c;
  font-size: 12px;
  font-weight: 500;
}
```

设计原则：

```text
编号要轻
标签要小
不要抢标题和图片的视觉层级
```

---

## 9. 食物名称与日期

食物名称是卡片第二视觉中心，仅次于图片。

CSS：

```css
.food-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: #1f1b16;
  font-weight: 700;
}

.food-title.zh {
  letter-spacing: -0.02em;
}

.eaten-date {
  margin-top: 8px;
  font-size: 14px;
  color: #9b856d;
}
```

规则：

```text
标题要大
日期要轻
标题和日期之间不要加多余说明
```

示例：

```text
牛油果鸡蛋吐司
2026.05.28
```

---

## 10. 食物主图区域

食物图片必须是卡片核心。

推荐占卡片高度的 40% 到 50%。

CSS：

```css
.food-image-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  margin: 22px 0 18px;
  border-radius: 26px;
  background: #f1e7d8;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(70, 50, 30, 0.06);
}

.food-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.96) contrast(1.02);
}
```

设计原则：

```text
图片必须足够大
图片圆角必须和卡片圆角统一
图片不要被过多边框装饰
图片质量差时，用轻微滤镜统一质感
```

---

## 11. 一句话描述

描述是卡片的情绪层。

不写健康建议，写轻量、有画面感的短句。

CSS：

```css
.food-desc {
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.65;
  color: #4b4035;
}
```

规则：

```text
最多两行
不说教
不写医学建议
不写复杂解释
```

推荐文案：

```text
今天这口很轻盈，但蛋白还不错。
```

```text
能量很足，适合白天收藏。
```

```text
甜得很快，困得也很快。
```

```text
蛋白质很能打，是小宠物的成长燃料。
```

不推荐：

```text
该食物热量偏高，请合理安排饮食。
```

---

## 12. 底部营养与宠物影响

底部使用胶囊标签，不使用表格。

推荐：

```text
428 kcal     Protein 23g
Energy +8   Muscle +6
```

CSS：

```css
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: #f7efe4;
  color: #3b3027;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.pill.impact {
  background: #f1e4d2;
  color: #6f563f;
}
```

原则：

```text
只展示热量和蛋白质
宠物影响用 Energy / Muscle / Chubby 等短词
不要堆碳水、脂肪、糖分
```

---

## 13. React 组件示例

```tsx
type FoodDexCardData = {
  id: string;
  tag: string;
  foodName: string;
  eatenDate: string;
  imageUrl: string;
  description: string;
  calories: number;
  protein: number;
  petImpact: {
    energy: number;
    muscle: number;
    chubby?: number;
    sugar?: number;
  };
};

export function FoodDexCard({ card }: { card: FoodDexCardData }) {
  return (
    <article className="food-card">
      <div className="card-top">
        <span className="dex-id">#{card.id}</span>
        <span className="card-tag">{card.tag}</span>
      </div>

      <h2 className="food-title zh">{card.foodName}</h2>
      <div className="eaten-date">{card.eatenDate}</div>

      <div className="food-image-box">
        <img
          className="food-image"
          src={card.imageUrl}
          alt={card.foodName}
        />
      </div>

      <p className="food-desc">{card.description}</p>

      <div className="pill-row">
        <span className="pill">{card.calories} kcal</span>
        <span className="pill">Protein {card.protein}g</span>
        <span className="pill impact">Energy +{card.petImpact.energy}</span>
        <span className="pill impact">Muscle +{card.petImpact.muscle}</span>
      </div>
    </article>
  );
}
```

---

## 14. 示例数据

```ts
const sampleCard = {
  id: "024",
  tag: "早餐",
  foodName: "牛油果鸡蛋吐司",
  eatenDate: "2026.05.28",
  imageUrl: "/foods/avocado-egg-toast.jpg",
  description: "今天这口很轻盈，但蛋白还不错。",
  calories: 428,
  protein: 23,
  petImpact: {
    energy: 8,
    muscle: 6,
    chubby: 2,
  },
};
```

---

## 15. 页面布局建议

### 拍照生成页

```text
顶部：BiteDex / Food Dex 标题
中间：最新生成卡片
底部：Save to Dex / Retake
```

示意：

```text
Food Dex
Turn every bite into a card.

[ 主卡片 ]

Save to Dex
```

### 图鉴列表页

列表页不要做成密集信息流。

小卡只展示：

```text
图片
食物名
日期
热量
```

两列网格：

```css
.dex-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
```

小卡结构：

```text
┌──────────────┐
│    图片       │
│ 鸡胸肉沙拉    │
│ 05.28        │
│ 380 kcal     │
└──────────────┘
```

---

## 16. 详情页 / 翻面卡

正面保持收藏感，背面展示详细数据。

### 正面

```text
食物图鉴卡
热量
蛋白
宠物影响
```

### 背面

```text
Nutrition Detail
Calories 428 kcal
Protein 23g
Carbs 42g
Fat 18g
Sugar 5g

Pet Impact
Energy +8
Muscle +6
Chubby +2
```

背面可以使用更规整的信息块，但仍然不要做成密集表格。

---

## 17. 生成动画建议

拍照后生成卡片的流程：

```text
用户拍照
↓
AI 识别食物
↓
照片落入卡框
↓
食物名称出现
↓
日期与编号出现
↓
营养标签浮现
↓
宠物影响结算
↓
加入 Food Dex
```

动效方向：

```text
轻
慢
有收藏感
不要爆炸特效
不要游戏抽卡特效过重
```

可用文案：

```text
Finding the food...
Building your card...
Added to Food Dex.
```

中文：

```text
正在识别食物……
正在生成食物卡……
已加入 Food Dex。
```

---

## 18. 需要避免的错误

```text
1. 图片太小
2. 营养数据太多
3. 卡片边框太黑
4. 阴影太硬
5. 背景和卡片都是纯白
6. 使用太多 emoji
7. 使用高饱和渐变
8. 所有字体大小接近，没有层级
9. 说明文案过长
10. 像外卖卡片，而不是收藏卡片
```

---

## 19. 最终判断标准

判断卡片是否成功，看 5 点：

```text
1. 第一眼是否先看到食物图片
2. 是否有收藏感
3. 是否一眼知道吃了什么
4. 是否只展示最重要的数据
5. 是否和小宠物系统产生了连接
```

最终效果应该是：

```text
不是营养卡
不是外卖卡
不是健身记录卡

而是一张安静、干净、可以收藏的食物图鉴卡。
```

---

## 20. 最终设计定稿

推荐定稿名称：

```text
Cream Food Dex Card
```

核心描述：

```text
一张奶油白、低信息密度、中心图片突出的食物图鉴卡。
顶部显示图鉴编号和标签，中部展示食物名称、日期与主图，底部只保留热量、蛋白质和宠物影响。
整体风格接近 CapWords 的极简卡片感，但保留 BiteDex 自己的食物收藏和宠物反馈特征。
```
