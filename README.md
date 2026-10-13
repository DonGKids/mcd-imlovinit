# 🍔 懂你餐盘 · 麦当劳智能餐品推荐

> **懂你的胃，更懂你的心** —— 基于麦当劳官方营养数据的 6 维加权推荐算法

参赛作品 | 麦当劳创意开发大赛

🔗 **GitHub**: https://github.com/DonGKids/mcd-imlovinit
🚀 **Live Demo**: 部署到 Vercel/Render 后回填链接（见 [`docs/DEPLOY.md`](docs/DEPLOY.md)）

---

## 🎬 一分钟 Demo 场景

打开首页 → 选择 **青年 + 程序员 + 咖啡 + 提神 + 低卡** → 输入 *"今天加班到深夜"* → 推荐 **冰美式中杯**（5维全命中，分数 107）。

换成 **老年 + 退休 + 清淡 + 暖胃 + 补钙** → 推荐 **皮蛋粥 + 雪菜粥 + 豆浆**。

换成 **儿童 + 甜 + 补钙** → 推荐 **朱古力新地 + 草莓新地 + 纯牛奶**。

---

## ✨ 项目亮点

| 维度 | 能力 |
| --- | --- |
| 📊 数据规模 | 160+ 道麦当劳餐品的真实营养数据 (卡路里/蛋白质/脂肪/碳水/钠/钙) |
| 🏷️ 标签系统 | 8 维标签库：类别 / 餐期 / 口味 / 年龄段 / 营养属性 / 职业场景 / 心情 / 主料 |
| 🧠 推荐算法 | 6 维加权打分：年龄段 + 职业 + 口味 + 心情 + 健康 + 时段，含自由文本心情解析 |
| 🎨 前端体验 | Vite + React 18 + TypeScript + Tailwind，麦当劳红黄品牌色，响应式 + 动画 |
| 🔌 后端架构 | Node.js + Express + TypeScript，含 helmet / CORS / 限流 |
| 🛡️ 健壮性 | 多样性去重、营养亮点提取、特殊群体 (老人/孕妇/儿童) 软约束 |

---

## 🎯 核心特性

### 1. 多维用户画像
回答 6 道小问题（年龄段、职业、口味、心情、健康关注、用餐时段），系统即可从 160+ 道餐品中为你挑出 Top 6 最匹配的。

### 2. 心情自由文本解析
不只是单选心情标签 —— 你可以输入**自然语言**：
- *"今天加班到深夜，想喝点提神的不太甜的"*
- *"被甲方折磨了，想吃点治愈的"*
- *"想家了，想念小时候的味道"*

内置 30+ 情绪关键词 → moodFit 映射，自动解析到对应的餐品风格。

### 3. 解释性推荐
每条推荐都会告诉你**为什么**：
- ✅ 年龄段适配
- ✅ 职业场景对位：程序员
- ✅ 口味对味：咖啡、浓郁
- ✅ 心情匹配：需要专注
- ✅ 健康需求达标：高蛋白、低钠
- ✅ 时段契合：下午茶

### 4. 多样性优化
同一类别不会连续出现超过 2 个，避免 6 个推荐全是汉堡。

---

## 🏗️ 项目结构

```
mcd-imlovinit/
├── backend/                    # Node + Express + TypeScript 后端
│   ├── src/
│   │   ├── server.ts           # 入口
│   │   ├── routes/             # 路由
│   │   │   ├── recommend.ts    # /api/recommend
│   │   │   └── catalog.ts      # /api/catalog
│   │   ├── services/
│   │   │   ├── recommend.ts    # 推荐算法核心 (6 维加权)
│   │   │   └── catalog.ts      # 餐品目录加载
│   │   ├── utils/tagMaps.ts    # 口味/心情/职业 关键词映射
│   │   └── types/index.ts      # 类型定义
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json             # Vercel serverless 配置
├── frontend/                   # Vite + React + TS + Tailwind 前端
│   ├── src/
│   │   ├── main.tsx            # 入口
│   │   ├── App.tsx             # 路由
│   │   ├── pages/
│   │   │   ├── Home.tsx        # 首页：6 维问卷
│   │   │   └── Result.tsx      # 推荐结果页
│   │   ├── components/
│   │   │   ├── Header.tsx      # 顶部导航
│   │   │   ├── OptionPills.tsx # 选项胶囊 + 自由文本
│   │   │   └── MealCard.tsx    # 餐品卡片 (营养+标签+理由)
│   │   ├── api/recommend.ts    # API 封装
│   │   ├── utils/options.ts    # 维度选项定义
│   │   ├── types/index.ts
│   │   └── styles/index.css    # 全局样式 + Tailwind
│   ├── tailwind.config.js
│   ├── vite.config.ts          # 含 /api 代理到后端
│   └── vercel.json
├── data/
│   ├── meals-nutrition.json    # 160 道餐品营养数据 (源: mcp__mcd-mcp__list-nutrition-foods)
│   └── meals-tags.json         # 160 道餐品 8 维标签
├── docs/
│   ├── ALGORITHM.md            # 推荐算法详解
│   ├── API.md                  # API 文档
│   └── DEPLOY.md               # 部署指南
├── .github/workflows/ci.yml    # CI 配置
├── render.yaml                 # Render 部署配置
├── .gitignore
└── README.md
```

---

## 🚀 快速开始

### 前置环境
- Node.js >= 18（推荐 22.x）
- npm >= 9

### 安装

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 本地开发

```bash
# 终端 1：启动后端 (http://localhost:4000)
cd backend
npm run dev

# 终端 2：启动前端 (http://localhost:5173)
cd frontend
npm run dev
```

打开浏览器访问 [http://localhost:5173](http://localhost:5173) 即可体验。

### 生产构建

```bash
# 后端
cd backend
npm run build
npm start

# 前端
cd frontend
npm run build
npm run preview
```

---

## 📡 API 文档

### `POST /api/recommend`

请求体：
```json
{
  "ageRange": "young",
  "occupation": "programmer",
  "flavorPrefs": ["coffee", "cold"],
  "moods": ["focus", "tired"],
  "healthFocus": "lowCal",
  "mealTime": "auto",
  "moodText": "今天加班到深夜",
  "topN": 5,
  "excludeCategory": ["snack"]
}
```

响应：
```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "productName": "冰美式中杯",
      "nutrition": { "energyKcal": 13, "protein": 1, "fat": 0, ... },
      "tags": { "category": "coffee", "moodFit": ["focus", "energize"], ... },
      "score": 107,
      "reasons": ["年龄段适配", "职业场景对位：程序员", "口味对味：冰、咖啡", ...],
      "matchedDimensions": ["ageFit", "occupationFit", "flavor", "mood", "health"]
    }
  ]
}
```

完整字段定义见 [`docs/API.md`](docs/API.md)。

### `GET /api/catalog`
获取全量餐品目录（含营养+标签）。

### `GET /api/health`
健康检查。

---

## 🧠 推荐算法详解

详见 [`docs/ALGORITHM.md`](docs/ALGORITHM.md)。

核心思想：**多维加权打分 + 多样性去重**

每个维度的权重：
- 年龄段适配：25
- 心情匹配：最高 24
- 健康需求达标：最高 25
- 口味对味：最高 20
- 职业场景对位：18
- 时段契合：12
- 特殊群体软约束（老人/孕妇/儿童低钠、健身高蛋白低脂）：8-12

多样性约束：同一 category 最多出现 2 次，避免 6 个推荐全是同一类。

---

## 🎨 视觉设计

- **品牌色**：麦当劳红 `#DA291C` + 麦黄 `#FFC72C`
- **字体**：苹方/微软雅黑 fallback
- **动画**：fade-in、slide-up、pulse-slow
- **响应式**：手机/平板/桌面三端适配

---

## 🛡️ 安全与稳定

- `helmet` 设置安全 HTTP 头
- `cors` 限定前端来源
- `express-rate-limit` 每分钟 60 次限流
- 请求体大小限制 1MB
- 启动时一次性加载 JSON 缓存，零外部依赖

---

## 🚢 部署

### 方案 A：Render + Vercel (推荐)
- 后端 → Render (免费 Node 服务)
- 前端 → Vercel (静态站)
- 配置文件已就绪：`render.yaml` + `vercel.json`

### 方案 B：Vercel Serverless 单体
把后端用 `@vercel/node` 打包成 serverless function，全部部署到 Vercel 一个项目。`backend/vercel.json` 已就绪。

详细步骤见 [`docs/DEPLOY.md`](docs/DEPLOY.md)。

---

## 📜 数据来源

- 麦当劳官方营养信息表（通过 `mcp__mcd-mcp__list-nutrition-foods` 获取）
- 餐品标签由开发者基于公开菜单资料整理

---

## 📄 License

MIT License - 仅作参赛作品展示

---

## 🙌 致谢

- 麦当劳 MCP 团队提供的开放接口
- 麦当劳创意开发大赛主办方
- React / Tailwind / Express 社区

**Made with ❤️ for McDonald's Creative Dev Contest**
