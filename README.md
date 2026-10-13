# 🍔 懂你餐盘 · 麦当劳智能餐品推荐

> **懂你的胃，更懂你的心** —— 基于麦当劳官方营养数据的 6 维加权推荐算法

参赛作品 | 麦当劳创意开发大赛

🔗 **GitHub**: https://github.com/DonGKids/mcd-imlovinit
🚀 **Live Demo**: 部署到 Vercel/Render 后回填链接（见"部署指南"章节）
📖 **MCP 使用说明**: 详见 [`MCP_USAGE.md`](MCP_USAGE.md)

---

## 📖 项目介绍

**懂你餐盘** 是为麦当劳创意开发大赛设计的智能餐品推荐 Web 应用。它从麦当劳官方营养数据出发，结合用户的多维画像（年龄段、职业、口味、心情、健康关注、用餐时段），用 **6 维加权打分算法** 为你从 160+ 道餐品中挑选最匹配的 Top 6。

核心特色：

- 🧠 **6 维加权推荐算法**：年龄段 + 职业 + 口味 + 心情 + 健康 + 时段
- 💬 **自由文本心情解析**：用自然语言说出你的心情（"被甲方折磨了"、"加班到深夜"），系统自动理解并匹配餐品
- 🏷️ **8 维标签系统**：每个餐品被打上 类别/餐期/口味/年龄适配/职业适配/营养属性/心情适配/主料 8 个维度
- ✅ **解释性推荐**：每条推荐都告诉你**为什么**——不只是冷冰冰的分数
- 🎨 **品牌化 UI**：麦当劳红黄配色，响应式设计，支持手机/平板/桌面

数据来源：麦当劳官方营养信息表（通过 `mcp__mcd-mcp__list-nutrition-foods` MCP 接口获取）。
标签系统由开发者基于公开菜单资料手工整理。

---

## 👥 目标用户

| 用户群体 | 使用场景 | 推荐价值 |
| --- | --- | --- |
| 🎓 **学生** | 一日三餐、加餐、宵夜 | 根据预算和能量需求推荐平价高性价比套餐 |
| 💻 **程序员 / 工程师** | 加班、提神、低卡 | 自动锁定咖啡因 + 低卡组合（冰美式、无糖可乐） |
| 👔 **白领 / 文职** | 下午茶、轻食 | 控卡补钙，解压小食 |
| 💪 **健身爱好者** | 增肌、控脂 | 自动过滤到高蛋白 + 低脂组合（鲜蔬蛋沙拉、冰牛奶） |
| 🛠️ **体力劳动者** | 高能量补充 | 大份、高蛋白、高热量主餐 |
| 🤰 **孕妈** | 营养补充、清淡 | 自动适配清淡 + 高钙 + 低钠（粥、豆浆、热牛奶） |
| 👴 **退休人士** | 养胃、清淡、低负担 | 自动过滤到低钠、高钙、易消化组合 |
| 👶 **儿童** | 零食、甜品 | 儿童专属筛选（鱼排堡、迷你薯条、新地） |

---

## 🚀 安装方法

### 前置环境
- **Node.js** >= 18（推荐 22.x）
- **npm** >= 9

### 1. 克隆仓库
```bash
git clone https://github.com/DonGKids/mcd-imlovinit.git
cd mcd-imlovinit
```

### 2. 安装后端依赖
```bash
cd source/server
npm install
```

### 3. 安装前端依赖
```bash
cd ../web
npm install
```

### 4. 启动开发模式

打开两个终端：

```bash
# 终端 1：后端 (http://localhost:4000)
cd source/server
npm run dev

# 终端 2：前端 (http://localhost:5173)
cd source/web
npm run dev
```

打开浏览器访问 **http://localhost:5173** 即可体验。

### 5. 生产构建

```bash
# 后端
cd source/server
npm run build
npm start

# 前端
cd source/web
npm run build
npm run preview
```

### 环境变量（可选）

后端 `source/server/.env`：
```bash
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

---

## 💡 使用示例

### 示例 1：青年程序员加班场景

**操作**：选择"青年 + 程序员 + 咖啡 + 冰爽 + 提神 + 低卡"，输入心情 *"今天加班到深夜"*

**推荐 Top 3**：
1. ☕ **冰美式中杯** — 5 维全命中（年龄段/职业/口味/心情/健康），分数 107
2. ☕ **冰美式大杯** — 4 维命中，分数 99
3. ☕ **浓缩咖啡** — 3 维命中，分数 95

**推荐理由**：
- ✅ 年龄段适配
- ✅ 职业场景对位：程序员
- ✅ 口味对味：冰、咖啡
- ✅ 心情匹配：需要专注
- ✅ 健康需求达标：含咖啡因、低卡

### 示例 2：老年 + 退休 + 清淡 + 暖胃 + 补钙

**推荐 Top 3**：
1. 🥣 **皮蛋鸡肉粥** — 133 kcal，分数 93
2. 🥣 **雪菜脆笋鸡肉粥** — 120 kcal，分数 93
3. 🥛 **优品豆浆小杯** — 151 kcal，分数 93

理由：低钠清淡、暖胃、补钙。

### 示例 3：心情治愈系

**操作**：选择"青年 + 白领 + 需要治愈"，输入心情 *"今天被甲方折磨，想吃点治愈的"*

**推荐 Top 3**：
1. 🥛 **纯牛奶（盒装）** — 129 kcal
2. ☕ **热牛奶中杯** — 176 kcal（暖胃型治愈）
3. 🥓 **火腿扒麦满分** — 261 kcal

### 示例 4：儿童 + 甜 + 补钙

**推荐 Top 3**：
1. 🍫 **朱古力新地** — 282 kcal
2. 🍓 **草莓新地** — 245 kcal
3. 🥛 **纯牛奶（盒装）** — 129 kcal

### 示例 5：直接调用 API

```bash
curl -X POST http://localhost:4000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "ageRange": "young",
    "occupation": "programmer",
    "flavorPrefs": ["coffee", "cold"],
    "moods": ["focus", "tired"],
    "healthFocus": "lowCal",
    "mealTime": "auto",
    "moodText": "今天加班到深夜",
    "topN": 5
  }'
```

返回结构详见 `MCP_USAGE.md` 中的"完整 API 契约"。

---

## 📂 项目结构

```
mcd-imlovinit/
├── README.md            ← 你正在看：项目介绍 + 安装 + 使用示例 + 目标用户
├── MCP_USAGE.md         ← 麦当劳 MCP Server/Tool/调用流程/业务价值
└── source/              ← 源代码（之后的测试和修改全都在这里）
    ├── server/          ← Node.js + Express + TypeScript 后端
    │   ├── server.ts           入口
    │   ├── routes/
    │   │   ├── recommend.ts    POST /api/recommend
    │   │   └── catalog.ts      GET /api/catalog
    │   ├── services/
    │   │   ├── recommend.ts    6 维加权推荐算法核心
    │   │   └── catalog.ts      餐品目录加载 (含 data 路径解析)
    │   ├── utils/
    │   │   └── tagMaps.ts      口味/心情/职业关键词映射表
    │   ├── types/
    │   │   └── index.ts        类型定义
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── vercel.json         Vercel serverless 部署配置
    ├── web/             ← Vite + React 18 + TS + Tailwind 前端
    │   ├── main.tsx            入口
    │   ├── App.tsx             路由 (Home → Result)
    │   ├── pages/
    │   │   ├── Home.tsx        6 维问卷
    │   │   └── Result.tsx      推荐结果展示
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── OptionPills.tsx 选项胶囊 + 自由文本输入
    │   │   └── MealCard.tsx    餐品卡片 (营养+标签+理由)
    │   ├── api/recommend.ts    后端 API 封装
    │   ├── utils/options.ts    所有维度的选项定义
    │   ├── types/index.ts
    │   ├── styles/index.css    Tailwind + 全局样式
    │   ├── index.html
    │   ├── package.json
    │   ├── tailwind.config.js
    │   ├── postcss.config.js
    │   ├── tsconfig.json
    │   ├── vite.config.ts      含 /api 代理到后端
    │   └── vercel.json
    └── data/            ← 营养数据 + 标签数据 (JSON)
        ├── meals-nutrition.json    160 道餐品的卡路里/蛋白/脂肪/碳水/钠/钙
        └── meals-tags.json         160 道餐品的 8 维标签
```

辅助文件（不在 `source/` 内）：
- `.gitignore`
- `.github/workflows/ci.yml` — CI：构建后端 + 集成测试 + 构建前端
- `render.yaml` — Render 部署 IaC 配置

---

## 🧠 算法说明（简版）

详见 `MCP_USAGE.md` 的"业务价值"章节和源码注释。

**核心思想**：每个维度独立计算得分，最终总分 = 各维度得分之和。餐品按总分降序排列，再加多样性约束后取 Top N。

| 维度 | 权重上限 | 说明 |
| --- | --- | --- |
| 年龄段适配 | 25 | 餐品是否明确标注该年龄段 |
| 心情匹配 | 24 | moodFit ∩ 用户心情 + 自由文本解析结果 |
| 健康需求 | 25 | 营养标签命中数 × 10 |
| 口味对味 | 20 | 口味标签命中数 × 8 |
| 职业场景 | 18 | occupationFit 命中 |
| 时段契合 | 12 | mealTime 等于用户时段 |
| 特殊群体软约束 | 8-12 | 老人/孕妇/儿童 低钠；健身 高蛋白低脂 |

**多样性约束**：同一 category 最多出现 2 次，避免 6 个推荐全是汉堡。

---

## 🛡️ 安全与稳定

- `helmet` 设置安全 HTTP 头
- `cors` 限定前端来源（白名单模式）
- `express-rate-limit` 每分钟 60 次限流
- 请求体大小限制 1MB
- 启动时一次性加载 JSON 缓存，零外部依赖

---

## 🚢 部署指南

### 方案 A：Render + Vercel（推荐）

**后端 → Render**
1. 登录 https://render.com
2. New → Web Service → 连接 `DonGKids/mcd-imlovinit` 仓库
3. 配置：
   - **Root Directory**: `source/server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. 环境变量：
   - `PORT=4000`
   - `FRONTEND_ORIGIN=https://your-frontend.vercel.app`
   - `NODE_ENV=production`

`render.yaml` 已包含这些配置，可直接用 Infrastructure as Code 部署。

**前端 → Vercel**
1. 登录 https://vercel.com
2. New Project → 导入仓库
3. 配置：
   - **Root Directory**: `source/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. 环境变量：
   - `VITE_API_BASE=https://mcd-imlovinit-api.onrender.com`

`source/web/vercel.json` 已就绪。

**回填 CORS**：把 Render 的 `FRONTEND_ORIGIN` 设为 Vercel URL，否则浏览器会拦截跨域请求。

### 方案 B：单体部署到 Vercel

把后端改造为 Vercel Serverless Functions，全部塞到 Vercel 一个项目：
- 用 `@vercel/node` 打包 `source/server/server.ts`
- `source/server/vercel.json` 已就绪
- 优点：单域部署、无 CORS 问题
- 缺点：serverless 冷启动约 1-2 秒（推荐算法是 CPU 密集型，问题不大）

---

## 📡 API 文档（简版）

### `POST /api/recommend`

**Request**:
```json
{
  "ageRange": "young",                              // 必填: kid|teen|young|middle|senior
  "occupation": "programmer",                       // 必填: student|programmer|officeWorker|fitness|laborer|pregnant|elderly
  "flavorPrefs": ["coffee", "cold"],                // 可选: 口味标签数组
  "moods": ["focus", "tired"],                      // 可选: 心情标签数组
  "healthFocus": "lowCal",                          // 可选: lowCal|highProtein|lowSodium|highCalcium|lowFat|lowCarb|caffeinated|none
  "mealTime": "auto",                               // 可选: auto|breakfast|lunch|dinner|snack
  "moodText": "今天加班到深夜",                    // 可选: 自然语言心情描述
  "topN": 5,                                        // 可选: 1-10, 默认 5
  "excludeCategory": ["snack"]                      // 可选: 排除的类别
}
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "productName": "冰美式中杯",
      "nutrition": {
        "energyKcal": 13, "protein": 1, "fat": 0,
        "carbohydrate": 2, "sodium": 0, "calcium": 7
      },
      "tags": {
        "category": "coffee",
        "mealTime": "allDay",
        "flavorTags": ["冰", "咖啡", "清淡"],
        "ageFit": ["young", "middle"],
        "occupationFit": ["programmer", "officeWorker"],
        "nutritionTags": ["caffeinated", "lowCal"],
        "moodFit": ["focus", "energize", "refresh"],
        "mainIngredient": "coffee",
        "note": "夏日提神首选"
      },
      "score": 107,
      "reasons": [
        "年龄段适配",
        "职业场景对位：程序员",
        "口味对味：冰、咖啡",
        "心情匹配：需要专注",
        "健康需求达标：含咖啡因、低卡",
        "低卡友好"
      ],
      "matchedDimensions": ["ageFit", "occupationFit", "flavor", "mood", "health"]
    }
  ]
}
```

### 其他端点

- `GET /api/catalog` — 全量餐品目录（营养 + 标签）
- `GET /api/meals` — 仅营养数据
- `GET /api/tags` — 仅标签字典
- `GET /api/health` — 健康检查

---

## 🛠️ 开发与调试

> 之后的测试和修改全都在 `source/` 文件夹中进行。

### 调试推荐算法

打开浏览器访问首页，依次选择不同维度的组合，观察推荐结果的变化。重点看：
1. `reasons` 字段：是否所有命中维度都有对应理由？
2. `matchedDimensions` 字段：是否准确反映该餐品被命中的维度？
3. 多样性：同一类别是否连续出现超过 2 个？

### 添加新的餐品标签

编辑 `source/data/meals-tags.json`，添加新餐品的标签结构（参考现有格式）。算法无需改动，自动读取最新数据。

### 添加新的心情关键词

编辑 `source/server/utils/tagMaps.ts` 的 `MOOD_KEYWORDS` 对象。算法无需改动。

### 修改权重

编辑 `source/server/services/recommend.ts` 中的 `scoreBreakdown` 各维度分数。

---

## 📜 License

MIT License

---

## 🙌 致谢

- 麦当劳 MCP 团队提供的开放接口
- 麦当劳创意开发大赛主办方
- React / Tailwind / Express / Vite 社区

**Made with ❤️ for McDonald's Creative Dev Contest**
