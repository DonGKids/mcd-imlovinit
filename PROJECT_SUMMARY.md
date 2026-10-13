# 🍔 mcd-imlovinit · 麦当劳智能餐品推荐

> **懂你的胃，更懂你的心** —— 麦当劳创意开发大赛参赛作品

---

## 🎉 已完成！项目交付清单

### ✨ 核心成果

| 项 | 详情 |
| --- | --- |
| 🎯 推荐算法 | 6 维加权打分：年龄段/职业/口味/心情/健康/时段，含 30+ 关键词自然语言解析 |
| 📊 数据规模 | 160 道麦当劳餐品真实营养数据（卡路里/蛋白/脂肪/碳水/钠/钙） |
| 🏷️ 标签系统 | 8 维标签库：类别/餐期/口味/年龄段/职业/营养/心情/主料 |
| 🎨 前端 | Vite + React 18 + TypeScript + Tailwind，麦当劳红黄品牌色，响应式 + 动画 |
| 🔌 后端 | Node.js + Express + TypeScript，helmet/cors/限流，含缓存 |
| 📝 文档 | README + ALGORITHM + API + DEPLOY，参赛评审一看就懂 |
| 🚀 部署 | Render + Vercel 配置已就绪，CI/CD 已配置 |

### 📍 当前状态

- ✅ 本地服务跑着：前端 `http://localhost:5173`，后端 `http://localhost:4000`
- ✅ 已 push 到 GitHub：`https://github.com/DonGKids/mcd-imlovinit`
- ⏳ 待办：部署到 Render + Vercel 生成 Live Demo 链接（评审用）

---

## 🎬 验证场景（已全部跑通）

| 用户画像 | 推荐 Top 3 |
| --- | --- |
| 青年 + 程序员 + 咖啡 + 提神 + 低卡 + "加班深夜" | 冰美式中杯 / 冰美式大杯 / 浓缩咖啡 |
| 老年 + 退休 + 清淡 + 暖胃 + 补钙 | 皮蛋鸡肉粥 / 雪菜脆笋鸡肉粥 / 优品豆浆 |
| 健身 + 高蛋白低脂 + 午餐 | 鲜蔬蛋沙拉叠叠卷 / 冰牛奶中杯 / 冰牛奶大杯 |
| 心情低落 + 治愈 + "被甲方折磨" | 纯牛奶 / 热牛奶中杯 / 火腿扒麦满分 |
| 儿童 + 甜 + 补钙 + 加餐 | 朱古力新地 / 草莓新地 / 纯牛奶 |

每条推荐都带 2-6 条可解释的"为什么"理由。

---

## 🚀 下一步：让评审能访问

### 5 分钟部署到云端

**后端 → Render**
1. 登录 https://render.com
2. New → Web Service → 连接 `DonGKids/mcd-imlovinit` 仓库
3. Root Directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. 记下生成的 URL（如 `https://mcd-imlovinit-api.onrender.com`）

**前端 → Vercel**
1. 登录 https://vercel.com
2. New Project → 导入仓库
3. Root Directory: `frontend`
4. 环境变量：`VITE_API_BASE=https://mcd-imlovinit-api.onrender.com`
5. 记下生成的 URL

**回填 CORS**：把 Render 的 `FRONTEND_ORIGIN` 设为 Vercel URL。

详见 `docs/DEPLOY.md`。

---

## 📂 文件速览

```
mcd-imlovinit/
├── backend/        # 7 个 TS 文件 + 配置
├── frontend/       # 11 个 TSX/TS 文件 + Tailwind/Vite 配置
├── data/           # 2 个 JSON（营养 + 标签）
├── docs/           # 3 篇 Markdown（ALGORITHM/API/DEPLOY）
├── .github/        # CI 配置
├── render.yaml     # Render IaC
└── README.md       # 项目门面
```

总共 43 个源文件 + 配置，全部已 commit 到 `main` 分支。
