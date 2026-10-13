# 🍔 懂你餐盘 · 源代码汇总

> **麦当劳创意开发大赛参赛作品 · 一站式代码包**

本目录汇总了项目所有源代码（不含 `node_modules/` / `dist/` 等构建产物），方便代码评审、参赛提交、整体打包。

---

## 📂 目录速览

```
source/
├── server/    # 后端：Node + Express + TypeScript（7 个 .ts + 4 个配置）
├── web/       # 前端：Vite + React + TypeScript + Tailwind（11 个 .tsx/.ts + 6 个配置）
├── data/      # 数据：160 道麦当劳餐品营养 + 8 维标签
├── docs/      # 文档：算法详解、API 文档、部署指南
├── configs/   # 部署与 CI 配置：Render + GitHub Actions
└── INDEX.md   # 完整文件清单与来源映射
```

---

## 🚀 30 秒跑起来

```bash
# 后端
cd server
npm install
npm run dev          # → http://localhost:4000

# 前端（另开终端）
cd web
npm install
npm run dev          # → http://localhost:5173
```

---

## 🔄 与原项目的关系

`source/` 下的文件与根目录的 `backend/`、`frontend/`、`data/`、`docs/`、`render.yaml`、`.github/workflows/ci.yml` **内容完全一致**（提取自 2026-10-13 的 git commit `050d36f`）。

如果两份不一致，以 git 仓库内的源文件为准（这是真理之源）。

---

## 📜 完整索引

见 [`INDEX.md`](./INDEX.md)

---

## 🏆 项目亮点回顾

- **6 维加权推荐算法**：年龄段 + 职业 + 口味 + 心情 + 健康 + 时段
- **自然语言心情解析**：30+ 中文情绪关键词（"加班"、"治愈"、"提神" 等）→ 自动匹配
- **160 道餐品真实营养数据**：含卡路里/蛋白/脂肪/碳水/钠/钙
- **解释性推荐**：每条都告诉用户"为什么"，绝不黑盒
- **多样性去重**：同一类别不连续出现超过 2 次
- **特殊群体软约束**：老人/孕妇/儿童低钠、健身高蛋白低脂

详见 `docs/ALGORITHM.md`。
