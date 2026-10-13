# 源代码索引（文件清单与来源映射）

> 提取自 git commit `050d36f` · 2026-10-13

## 📋 完整文件清单（39 个文件，216KB）

### 🖥️ 后端 `source/server/`（11 个文件）

| 文件 | 行数估算 | 来自 | 作用 |
| --- | --- | --- | --- |
| `server.ts` | ~50 | `backend/src/server.ts` | 入口，启动 Express |
| `routes/recommend.ts` | ~30 | `backend/src/routes/recommend.ts` | POST /api/recommend |
| `routes/catalog.ts` | ~30 | `backend/src/routes/catalog.ts` | GET /api/catalog 等 |
| `services/recommend.ts` | ~250 | `backend/src/services/recommend.ts` | **推荐算法核心** |
| `services/catalog.ts` | ~40 | `backend/src/services/catalog.ts` | 餐品目录加载与缓存 |
| `utils/tagMaps.ts` | ~150 | `backend/src/utils/tagMaps.ts` | **关键词映射（口味/心情/职业）** |
| `types/index.ts` | ~60 | `backend/src/types/index.ts` | 类型定义 |
| `package.json` | — | `backend/package.json` | 后端依赖 |
| `tsconfig.json` | — | `backend/tsconfig.json` | TS 配置 |
| `.env.example` | — | `backend/.env.example` | 环境变量示例 |
| `.gitignore` | — | `backend/.gitignore` | git 忽略 |
| `vercel.json` | — | `backend/vercel.json` | Vercel serverless 配置 |

### 🌐 前端 `source/web/`（18 个文件）

| 文件 | 行数估算 | 来自 | 作用 |
| --- | --- | --- | --- |
| `main.tsx` | ~15 | `frontend/src/main.tsx` | React 入口 |
| `App.tsx` | ~30 | `frontend/src/App.tsx` | 路由 + 布局 |
| `pages/Home.tsx` | ~150 | `frontend/src/pages/Home.tsx` | **首页：6 维问卷** |
| `pages/Result.tsx` | ~130 | `frontend/src/pages/Result.tsx` | **结果页：推荐卡片流** |
| `components/Header.tsx` | ~30 | `frontend/src/components/Header.tsx` | 顶部导航 |
| `components/OptionPills.tsx` | ~60 | `frontend/src/components/OptionPills.tsx` | 选项胶囊 + 自由文本 |
| `components/MealCard.tsx` | ~80 | `frontend/src/components/MealCard.tsx` | 餐品卡片 |
| `api/recommend.ts` | ~40 | `frontend/src/api/recommend.ts` | 后端 API 封装 |
| `utils/options.ts` | ~80 | `frontend/src/utils/options.ts` | 维度选项定义 |
| `types/index.ts` | ~60 | `frontend/src/types/index.ts` | 类型定义 |
| `styles/index.css` | ~60 | `frontend/src/styles/index.css` | 全局样式 + Tailwind |
| `index.html` | — | `frontend/index.html` | HTML 入口 |
| `public/favicon.svg` | — | `frontend/public/favicon.svg` | 图标 |
| `package.json` | — | `frontend/package.json` | 前端依赖 |
| `tsconfig.json` | — | `frontend/tsconfig.json` | TS 配置 |
| `vite.config.ts` | — | `frontend/vite.config.ts` | Vite 配置（含 /api 代理） |
| `tailwind.config.js` | — | `frontend/tailwind.config.js` | Tailwind 配置 |
| `postcss.config.js` | — | `frontend/postcss.config.js` | PostCSS 配置 |
| `.gitignore` | — | `frontend/.gitignore` | git 忽略 |
| `vercel.json` | — | `frontend/vercel.json` | Vercel 静态站配置 |

### 📊 数据 `source/data/`（2 个文件）

| 文件 | 大小 | 来自 | 作用 |
| --- | --- | --- | --- |
| `meals-nutrition.json` | ~12KB | `data/meals-nutrition.json` | 160 道餐品营养数据（卡/蛋白/脂肪/碳水/钠/钙） |
| `meals-tags.json` | ~50KB | `data/meals-tags.json` | 160 道餐品 8 维标签 |

### 📚 文档 `source/docs/`（3 个文件）

| 文件 | 来自 | 作用 |
| --- | --- | --- |
| `ALGORITHM.md` | `docs/ALGORITHM.md` | 推荐算法详解（设计、维度、调优日志） |
| `API.md` | `docs/API.md` | API 接口文档（请求/响应/枚举） |
| `DEPLOY.md` | `docs/DEPLOY.md` | 部署指南（Render + Vercel） |

### ⚙️ 部署与 CI `source/configs/`（2 个文件）

| 文件 | 来自 | 作用 |
| --- | --- | --- |
| `render.yaml` | `render.yaml` | Render 后端部署配置 |
| `ci.yml` | `.github/workflows/ci.yml` | GitHub Actions CI 配置 |

---

## 🔍 算法核心文件（推荐先看这几份）

1. **`source/server/services/recommend.ts`** — 6 维加权打分的实现
2. **`source/server/utils/tagMaps.ts`** — 关键词到标签的映射
3. **`source/data/meals-tags.json`** — 标签库本身
4. **`source/web/pages/Home.tsx`** — 用户输入
5. **`source/web/components/MealCard.tsx`** — 推荐结果展示
6. **`source/docs/ALGORITHM.md`** — 算法设计文档

---

## ✅ 完整性自检

- [x] 后端 7 个源文件 + 5 个配置文件
- [x] 前端 11 个源文件 + 7 个配置文件 + public 资源
- [x] 2 个数据 JSON
- [x] 3 篇 Markdown 文档
- [x] 2 个部署/CI 配置
- [x] **不含** node_modules/、dist/、.env（非 example）
- [x] **不含** .git/、build artifacts

总计：**39 个文件，~216 KB**。
