# 部署指南

## 推荐方案：Render (后端) + Vercel (前端)

### 后端：Render

1. Fork / push 本仓库到你的 GitHub
2. 登录 [render.com](https://render.com)，新建 Web Service
3. 连接仓库，配置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. 配置环境变量：
   - `PORT=4000`
   - `FRONTEND_ORIGIN=https://your-frontend.vercel.app`
   - `NODE_ENV=production`
5. 部署后会得到一个 URL，例如 `https://mcd-imlovinit-api.onrender.com`

`render.yaml` 已包含这些配置，可直接用 Infrastructure as Code 部署。

### 前端：Vercel

1. 登录 [vercel.com](https://vercel.com)，新建项目
2. 导入仓库，配置：
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. 配置环境变量：
   - `VITE_API_BASE=https://mcd-imlovinit-api.onrender.com`
4. 部署后会得到一个 URL，例如 `https://mcd-imlovinit.vercel.app`

`vercel.json` 已包含这些配置。

### 更新 CORS

后端的 `FRONTEND_ORIGIN` 必须包含前端的实际域名，否则浏览器会拦截跨域请求。

---

## 备选方案：单体部署到 Vercel

把后端改造为 Vercel Serverless Functions，全部塞到 Vercel 一个项目：

```bash
frontend/
├── api/
│   ├── recommend.ts        # 包装 services/recommend.ts
│   ├── catalog.ts
│   └── health.ts
├── src/
└── vercel.json             # 配置 api/ 走 serverless
```

优点：单域部署、无 CORS 问题、速度快。
缺点：Render 提供的长连接资源更稳定，serverless 冷启动有延迟（但推荐算法是 CPU 密集型，问题不大）。

---

## 环境变量清单

### 后端 (`backend/.env`)
```
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN=https://your-frontend.vercel.app
LOG_LEVEL=info
```

### 前端 (`frontend/.env.production`)
```
VITE_API_BASE=https://mcd-imlovinit-api.onrender.com
```

---

## 验证部署

部署后访问前端 URL，应当看到 6 维问卷页面。点 "为我推荐" 后应正常跳转到结果页并显示 5-6 张餐品卡片。

如看到 "推荐失败" 提示，检查：
1. 后端服务是否在线（`curl https://your-api/health`）
2. `FRONTEND_ORIGIN` 是否匹配前端域名
3. `VITE_API_BASE` 是否正确

---

## 性能优化建议

- 后端 JSON 数据已经在启动时一次性加载并缓存，零外部 IO
- 如果 QPS 上来，可加 Redis 缓存推荐结果（同一画像 5 分钟内复用）
- 前端已用 Vite 生产构建 + Tailwind purge，dist < 200KB
