# BiteDex Pet 宠物状态规则设计

## 1. 设计目标

BiteDex Pet 的状态变化不应该只根据“今天吃了什么”立即切换，而应该根据用户的基础信息、每日摄入数据和连续饮食趋势共同决定。

核心逻辑：

```text
用户性别 + 用户体重 + 用户目标
        ↓
计算每日热量目标与蛋白质目标
        ↓
根据实际摄入计算达成率
        ↓
判断宠物状态
        ↓
通过连续趋势影响长期外观变化
```

这样宠物不会显得机械，而是更像一个被用户长期饮食习惯“养出来”的小生命。

---

## 2. 用户基础信息

用户第一次进入产品时，需要填写以下信息：

```ts
type UserProfile = {
  gender: "male" | "female";
  weightKg: number;
  goal: "lose_fat" | "maintain" | "gain_muscle";
  activityLevel?: "low" | "medium" | "high";
  heightCm?: number;
  age?: number;
};
```

MVP 阶段最少只需要：

```ts
type MinimalUserProfile = {
  gender: "male" | "female";
  weightKg: number;
  goal: "lose_fat" | "maintain" | "gain_muscle";
};
```

---

## 3. 每日蛋白质目标

蛋白质目标按照体重计算。

| 用户目标 | 蛋白质系数 |
|---|---:|
| 减脂 lose_fat | 1.6g × 体重kg |
| 维持 maintain | 1.2g × 体重kg |
| 增肌 gain_muscle | 1.8g × 体重kg |

计算公式：

```ts
function getProteinTarget(weightKg: number, goal: string) {
  if (goal === "lose_fat") return weightKg * 1.6;
  if (goal === "gain_muscle") return weightKg * 1.8;
  return weightKg * 1.2;
}
```

例子：

```text
70kg 男生，目标增肌：
蛋白质目标 = 70 × 1.8 = 126g

55kg 女生，目标减脂：
蛋白质目标 = 55 × 1.6 = 88g
```

---

## 4. 每日热量目标

MVP 阶段不需要完整计算 BMR / TDEE，可以先使用按体重估算的方式。

### 男性热量目标

| 目标 | 热量系数 |
|---|---:|
| 减脂 lose_fat | 26 × 体重kg |
| 维持 maintain | 31 × 体重kg |
| 增肌 gain_muscle | 36 × 体重kg |

### 女性热量目标

| 目标 | 热量系数 |
|---|---:|
| 减脂 lose_fat | 24 × 体重kg |
| 维持 maintain | 29 × 体重kg |
| 增肌 gain_muscle | 33 × 体重kg |

计算公式：

```ts
function getCalorieTarget(gender: string, weightKg: number, goal: string) {
  const maleMap = {
    lose_fat: 26,
    maintain: 31,
    gain_muscle: 36,
  };

  const femaleMap = {
    lose_fat: 24,
    maintain: 29,
    gain_muscle: 33,
  };

  const map = gender === "male" ? maleMap : femaleMap;
  return weightKg * map[goal as keyof typeof maleMap];
}
```

例子：

```text
70kg 男生，目标增肌：
热量目标 = 70 × 36 = 2520 kcal

55kg 女生，目标减脂：
热量目标 = 55 × 24 = 1320 kcal
```

---

## 5. 每日达成率

每天识别食物后，系统得到：

```ts
type DailyNutrition = {
  calories: number;
  protein: number;
};
```

然后计算两个核心比例：

```ts
calorieRatio = todayCalories / targetCalories;
proteinRatio = todayProtein / targetProtein;
```

例子：

```text
目标热量：2000 kcal
实际热量：2400 kcal
calorieRatio = 1.2

目标蛋白：100g
实际蛋白：80g
proteinRatio = 0.8
```

---

## 6. 宠物状态规则

### 6.1 Normal 正常

触发条件：

```text
热量达成率：0.85 ~ 1.15
蛋白达成率：0.8 ~ 1.2
```

含义：

```text
饮食基本均衡，宠物状态稳定。
```

宠物表现：

```text
正常站立
轻微摇尾巴
表情放松
```

---

### 6.2 Energized 元气满满

触发条件：

```text
热量达成率：0.9 ~ 1.15
蛋白达成率：1.0 ~ 1.4
连续 2 天以上
```

含义：

```text
热量稳定，蛋白充足，宠物进入高活力状态。
```

宠物表现：

```text
跳跃
眼睛发亮
周围有星星特效
```

---

### 6.3 Protein Power 蛋白质充足

触发条件：

```text
蛋白达成率 ≥ 1.2
热量达成率：0.8 ~ 1.2
```

含义：

```text
蛋白质摄入优秀，适合健身、增肌或高蛋白饮食用户。
```

宠物表现：

```text
小肌肉
握拳
健身动作
身体更紧实
```

---

### 6.4 Diet Mode 轻盈模式

触发条件：

```text
用户目标 = lose_fat
热量达成率：0.75 ~ 0.95
蛋白达成率 ≥ 0.9
连续 3 天以上
```

含义：

```text
热量控制成功，并且没有牺牲蛋白质摄入。
```

宠物表现：

```text
身体更轻盈
动作更灵活
蓝色火焰或轻盈特效
```

---

### 6.5 Chubby 圆润状态

触发条件：

```text
热量达成率：1.2 ~ 1.5
连续 3 天以上
```

含义：

```text
热量持续偏高，宠物开始变圆。
```

宠物表现：

```text
肚子变大
坐姿变懒
吃东西动画
动作变慢
```

---

### 6.6 Overloaded 能量过载

触发条件：

```text
热量达成率 ≥ 1.6
```

或者：

```text
单日热量超过目标 + 1000 kcal
```

含义：

```text
单日摄入明显过量，宠物进入短期过载状态。
```

宠物表现：

```text
冒汗
脸红
走不动
警告图标
```

---

### 6.7 Tired 低能量

触发条件：

```text
热量达成率 < 0.7
```

或者：

```text
蛋白达成率 < 0.5
```

含义：

```text
摄入不足，宠物能量下降。
```

宠物表现：

```text
趴下
眼神困
动作慢
耳朵下垂
```

---

### 6.8 Weak 瘦弱状态

触发条件：

```text
热量达成率 < 0.75
蛋白达成率 < 0.7
连续 3 天以上
```

含义：

```text
长期吃得不够，营养不足。
```

宠物表现：

```text
身体变小
耳朵下垂
没精神
移动缓慢
```

---

## 7. 状态优先级

同一天可能同时命中多个状态，因此需要优先级。

推荐优先级：

```text
1. Overloaded 能量过载
2. Tired 低能量
3. Weak 瘦弱状态
4. Diet Mode 轻盈模式
5. Protein Power 蛋白质充足
6. Energized 元气满满
7. Chubby 圆润状态
8. Normal 正常
```

更合理的判断逻辑：

```text
先判断极端异常：Overloaded / Tired
再判断连续趋势：Chubby / Weak / Diet Mode
再判断正向奖励：Protein Power / Energized
都没有命中：Normal
```

---

## 8. 长期趋势值

为了让宠物不是“一天一变”，系统需要维护长期隐藏值。

```ts
type PetStats = {
  fatLevel: number;     // 0-100
  energyLevel: number;  // 0-100
  muscleLevel: number;  // 0-100
};
```

每日更新规则：

```ts
function updatePetStats(
  stats: PetStats,
  calorieRatio: number,
  proteinRatio: number
): PetStats {
  let { fatLevel, energyLevel, muscleLevel } = stats;

  if (calorieRatio > 1.2) {
    fatLevel += 8;
  } else if (calorieRatio < 0.8) {
    fatLevel -= 5;
  } else {
    fatLevel -= 2;
  }

  if (calorieRatio >= 0.85 && proteinRatio >= 0.8) {
    energyLevel += 6;
  } else {
    energyLevel -= 8;
  }

  if (proteinRatio >= 1.0 && calorieRatio >= 0.8) {
    muscleLevel += 7;
  } else {
    muscleLevel -= 4;
  }

  return {
    fatLevel: clamp(fatLevel, 0, 100),
    energyLevel: clamp(energyLevel, 0, 100),
    muscleLevel: clamp(muscleLevel, 0, 100),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
```

---

## 9. 最终状态判定函数

```ts
type PetState =
  | "normal"
  | "energized"
  | "protein_power"
  | "diet_mode"
  | "chubby"
  | "overloaded"
  | "tired"
  | "weak";

function getPetState({
  calorieRatio,
  proteinRatio,
  fatLevel,
  energyLevel,
  muscleLevel,
  goal,
}: {
  calorieRatio: number;
  proteinRatio: number;
  fatLevel: number;
  energyLevel: number;
  muscleLevel: number;
  goal: "lose_fat" | "maintain" | "gain_muscle";
}): PetState {
  if (calorieRatio >= 1.6) return "overloaded";

  if (calorieRatio < 0.7 || proteinRatio < 0.5) return "tired";

  if (calorieRatio < 0.75 && proteinRatio < 0.7 && energyLevel <= 30) {
    return "weak";
  }

  if (
    goal === "lose_fat" &&
    calorieRatio >= 0.75 &&
    calorieRatio <= 0.95 &&
    proteinRatio >= 0.9
  ) {
    return "diet_mode";
  }

  if (fatLevel >= 70) return "chubby";

  if (muscleLevel >= 70 && proteinRatio >= 1.1) {
    return "protein_power";
  }

  if (
    calorieRatio >= 0.9 &&
    calorieRatio <= 1.15 &&
    proteinRatio >= 1.0
  ) {
    return "energized";
  }

  return "normal";
}
```

---

## 10. 产品展示文案

不要直接用冷冰冰的数据吓用户。

不推荐：

```text
你今天热量超标 36%。
```

推荐：

```text
短尾矮袋鼠今天吃得有点多，肚子开始圆起来了。
```

详情页可以显示完整数据：

```text
今日热量：2360 / 1900 kcal
今日蛋白：82 / 95 g
状态原因：热量偏高，蛋白质接近目标
```

---

## 11. MVP 版本建议

第一版只做 5 个状态：

```text
Normal 正常
Energized 元气满满
Protein Power 蛋白质充足
Chubby 圆润
Tired 低能量
```

MVP 规则：

```text
热量正常 + 蛋白正常 → Normal
热量正常 + 蛋白高 → Energized / Protein Power
热量长期高 → Chubby
热量低或蛋白低 → Tired
热量极高 → Overloaded
```

暂时不要加入太多复杂状态。先跑通核心反馈闭环，再加入糖分、亲密度、皮肤、连续签到和进化系统。

---

## 12. 后续可扩展方向

后续版本可以加入：

```text
糖分 sugar
脂肪 fat
碳水 carbs
连续签到 streak
亲密度 affection
宠物进化 evolution
节日皮肤 seasonal skins
饮食卡片收藏 collection
```

其中最值得优先加入的是：

```text
affection 亲密度
```

因为它和健康数据无关，但能明显提升用户留存。

规则示例：

```text
每天记录饮食：亲密度 +1
连续 7 天记录：解锁新动作
断签 1 天：亲密度 -3
亲密度达到 30：解锁摸头动画
亲密度达到 60：解锁睡觉动画
亲密度达到 100：解锁特殊皮肤
```
