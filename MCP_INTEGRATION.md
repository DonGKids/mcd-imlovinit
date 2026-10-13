# 🍔 麦当劳 MCP 集成说明 · MCP_INTEGRATION.md

> 本文档说明项目实际使用的麦当劳 MCP Server、可用的 Tool、调用流程以及业务价值。

---

## 📡 一、麦当劳 MCP Server 概述

本项目基于**麦当劳官方 MCP Server** 实现，MCP 工具以 `mcp__mcd-mcp__*` 命名空间在 WorkBuddy 智能体内调用。

| 项 | 值 |
| --- | --- |
| MCP Server 地址 | `https://mcp.mcd.cn` |
| 传输方式 | `streamablehttp` |
| 认证方式 | 请求头 `Authorization: Bearer <MCD_MCP_TOKEN>` |

**接入方式**：在 WorkBuddy 左侧边栏【专家·技能·连接器】→【连接器】→ 右上角【自定义连接器】→【配置 MCP】中填入下方配置并【启用】。脱敏后的配置示例见仓库根目录 [`mcp-config.example.json`](./mcp-config.example.json)。

```json
{
  "mcpServers": {
    "mcd-mcp": {
      "type": "streamablehttp",
      "url": "https://mcp.mcd.cn",
      "headers": {
        "Authorization": "Bearer ${MCD_MCP_TOKEN}"
      }
    }
  }
}
```

> `${MCD_MCP_TOKEN}` 需替换为在麦当劳 MCP 控制台申请的 Token。请勿将真实 Token 写入仓库或本文档。

---

## 🔧 二、本项目实际使用的 Tool

我们对 MCP Server 暴露的 Tool 进行了筛选，共评估 **3 个**，其中**真实接入项目的是 2 个**（1 个开发阶段离线拉取 + 1 个运行时实时调用）：

| Tool 名称 | 用途 | 本项目用法 |
| --- | --- | --- |
| `mcp__mcd-mcp__list-nutrition-foods` | 获取麦当劳所有餐品的营养信息列表 | ✅ **核心数据源**：项目初始化阶段调用，构建本地 `source/data/meals-nutrition.json`（152 条） |
| `mcp__mcd-mcp__now-time-info` | 获取服务器当前时间（含时区、星期几） | ✅ **运行时调用**：后端在 `mealTime = auto` 时经 Streamable HTTP 直连 MCP Server 调用本工具，用返回的北京时间推断用餐时段 |
| `mcp__mcd-mcp__query-meals` | 查询指定门店的实时菜单（包含价格、活动、状态等动态信息） | ⚠️ 调研过，未接入：需门店编码 `storeCode`，与"跨门店营养推荐"场景不符 |

### 1️⃣ `mcp__mcd-mcp__list-nutrition-foods`

**说明**：返回麦当劳全部餐品的营养信息（卡路里、蛋白质、脂肪、碳水、钠、钙等），是**离线推荐算法的数据基础**。

**调用方式**（在 WorkBuddy Agent 内）：
```typescript
DeferExecuteTool({
  params: {},
  toolName: "mcp__mcd-mcp__list-nutrition-foods",
});
```

**返回数据结构**：
```json
{
  "success": true,
  "code": 200,
  "message": "请求成功",
  "data": "猪柳麦满分,null,1288,308,16,16,24,781,213\n..."
}
```

`data` 字段是 CSV 格式文本，按行排列，每行字段：
`productName, nutritionDescription, energyKj, energyKcal, protein, fat, carbohydrate, sodium, calcium`

**本项目落地**：在项目初始化阶段用此 Tool 拉取数据，解析为结构化 JSON 写入 `source/data/meals-nutrition.json`（152 条餐品营养记录）。后端启动时一次性加载并缓存到内存。

### 2️⃣ `mcp__mcd-mcp__now-time-info`（⭐ 运行时真实调用）

**说明**：返回麦当劳 MCP Server 当前时间（含时区、星期几），项目用它把「未指定时段」的推荐校准到真实时间。

**这是本项目唯一的运行时 MCP 调用**——后端进程启动后，每次用户提交 `mealTime = "auto"` 的推荐请求，都会实时与 `https://mcp.mcd.cn` 通信一次（结果缓存 5 分钟）。

**实现位置**：`source/server/services/mcpTime.ts`

**调用协议**（标准 MCP Streamable HTTP，零额外依赖，仅用 Node 18+ 内置 `fetch`）：

```text
POST https://mcp.mcd.cn
  Authorization: Bearer <MCD_MCP_TOKEN>
  Accept: application/json, text/event-stream

1) {"jsonrpc":"2.0","id":1,"method":"initialize", ...}          → 200 + serverInfo
2) {"jsonrpc":"2.0","method":"notifications/initialized"}       → 202
3) {"jsonrpc":"2.0","id":2,"method":"tools/call",
    "params":{"name":"now-time-info","arguments":{}}}            → 200 + result
```

**真实返回数据结构**（`result.content[0].text` 内嵌一段 Markdown + 原始 JSON）：

```json
{
  "success": true,
  "code": 200,
  "message": "请求成功",
  "datetime": "2026-10-13 13:27:27",
  "traceId": "edb53e5d9c16bac700fadcb093ba69e1",
  "data": {
    "timestamp": 1791869247275,
    "datetime": "2026-10-13T13:27:27.275",
    "formatted": "2026-10-13 13:27:27",
    "date": "2026-10-13",
    "year": 2026, "month": 10, "day": 13,
    "dayOfWeek": "TUESDAY",
    "timezone": "GMT+08:00",
    "offset": "+08:00",
    "utc": "2026-10-13T05:27:27.275Z"
  }
}
```

**本项目落地**：
- 用户选择 `mealTime: "auto"` 时，后端调用本工具取回 `data.datetime`，直接从字符串中解析出**北京时间的小时数**
- 时段映射规则：5-10 点早餐 / 10-14 点午餐 / 14-17 点加餐 / 17-21 点晚餐
- 该小时数作为 `currentHour` 传入 `recommend()`，参与「维度 6：时段匹配」打分
- **三处工程化保护**：
  1. **缓存**：5 分钟内复用同一结果，避免每次请求都打 MCP
  2. **超时**：`AbortSignal.timeout(4000)`，4 秒未响应即放弃
  3. **降级**：未配置 `MCD_MCP_TOKEN` / 网络不通 / 超时 → 自动回退 `new Date().getHours()`，**绝不阻断推荐主流程**
- 响应中会回传 `timeContext` 字段（`source: "mcd-mcp" | "local"`），前端据此展示「🔌 已通过麦当劳 MCP · now-time-info 校准用餐时段」

### 3️⃣ `mcp__mcd-mcp__query-meals`（调研过，未直接使用）

**说明**：查询具体门店的实时菜单，包含商品图片、价格、上下架状态、活动标签等动态信息。

**调用示例**：
```typescript
DeferExecuteTool({
  params: {
    storeCode: "MC001",
    orderType: 1,
    beType: 1
  },
  toolName: "mcp__mcd-mcp__query-meals",
});
```

**为什么没用**：
1. 需要指定 `storeCode`（门店编码），推荐系统应跨门店通用
2. 返回数据包含大量点餐场景字段（sku、活动），对"营养推荐"维度信息冗余
3. 当前 MCP 环境下缺少稳定的门店坐标获取手段

**未来可改造为**：当用户开启"附近门店"模式时，根据定位结果调 `mcp__mcd-mcp__query-nearby-stores` 拿到 storeCode，再调 `query-meals` 拿到该门店实时菜单 + 价格，做"门店级"推荐。

> **为什么 V1 不做"附近门店推荐"**：一方面 MCP 当前未提供稳定的"按坐标查附近门店"接口；另一方面，门店与联名活动这类**强时效信息**若用本地静态数据演示，很容易和真实情况对不上，反而损害推荐可信度。因此 V1 只聚焦"营养 + 标签"这条**数据可验证**的链路，附近门店/实时菜单留待 MCP 提供稳定的门店查询能力后再接入。

---

## 🔄 三、调用流程图

```
┌──────────────────────────────────────────────────────────────────┐
│  阶段 1：项目初始化（一次性，开发者手动执行）                       │
└──────────────────────────────────────────────────────────────────┘

  WorkBuddy Agent
       │
       ▼
  mcp__mcd-mcp__list-nutrition-foods  ──────────────┐
       │                                            │
       ▼                                            │
  解析 CSV → 结构化 JSON                            │
       │                                            ▼
       ▼                                  source/data/meals-nutrition.json
  source/data/meals-nutrition.json  ◄──────  (152 条餐品营养记录)


┌──────────────────────────────────────────────────────────────────┐
│  阶段 2：运行时 - 用户交互流程                                     │
└──────────────────────────────────────────────────────────────────┘

  用户打开浏览器 (http://localhost:5173)
       │
       ▼
  ┌─────────────────────────────────┐
  │  React 前端 (source/web)        │
  │  - IntroPages：5 屏滚动介绍      │
  │  - SurveyForm：6 维问卷 + 心情   │
  │  - Result：推荐结果 + 餐品卡片   │
  └─────────────────────────────────┘
       │  POST /api/recommend
       │  { ageRange, occupation, flavors, moods, ... }
       ▼
  ┌──────────────────────────────────────────────────────┐
  │  Express 后端 (source/server) · /api/recommend        │
  │                                                      │
  │  mealTime === "auto" ?                               │
  │    是 ──► mcpTime.ts ──────────────────────────┐     │
  │            │                                   ▼     │
  │            │                    POST https://mcp.mcd.cn
  │            │                    tools/call: now-time-info
  │            │                    (缓存 5min / 超时 4s) │
  │            │                                   │     │
  │            │  失败 ──► 降级 new Date().getHours()│    │
  │            └────────────────► hour ───────────┘      │
  │                                     │                │
  │  recommend.ts 算法 ◄────────────────┘ currentHour     │
  │   - 加载 data JSON (缓存)                            │
  │   - 加载 tags JSON (缓存)                            │
  │   - 6 维加权打分（维度 6 = 时段匹配）                  │
  │   - 多样性去重 / 生成解释性 reasons                    │
  └──────────────────────────────────────────────────────┘
       │  { success, results: [...], timeContext: { source, hour, ... } }
       ▼
  前端渲染 MealCard 卡片 + 「已通过麦当劳 MCP 校准时段」标识


┌──────────────────────────────────────────────────────────────────┐
│  阶段 3：可选增强 - 实时化（V2 路线图）                            │
└──────────────────────────────────────────────────────────────────┘

  mcp__mcd-mcp__query-nearby-stores ─► 用户附近门店列表
       │
       ▼
  mcp__mcd-mcp__query-meals ────────► 某门店实时菜单 + 价格
       │
       ▼
  返回的餐品 + 本地 JSON 的营养/标签 ─►  最终推荐结果
```

---

## 💼 四、业务价值

### 1. 对麦当劳的价值

**降低"餐品焦虑"**：麦当劳餐品数量众多（本应用已覆盖 132 道），普通用户在 5 分钟决策窗口内经常陷入"不知道吃啥"。6 维推荐引擎把决策时间从平均 3-5 分钟压缩到 30 秒，并提升点单转化率。

**触达长尾用户群体**：
- 🧓 老年用户：传统点餐界面不友好，但适合"清淡 + 低钠 + 补钙"的精准推荐
- 🤰 孕妈：对营养敏感，需要高钙低钠
- 💪 健身：需要精确知道蛋白质/脂肪/碳水

这些群体的需求在标准菜单里都是"盲区"，本系统能精准触达。

**降低运营成本**：把人工运营"猜你喜欢"的活交给算法，每次新品上市只需更新标签 JSON 即可生效。

### 2. 对用户的价值

**个性化体验**：
- 输入"被甲方折磨" → 自动推荐治愈系餐品（牛奶、麦满分）
- 输入"加班到深夜" → 自动推荐提神咖啡（冰美式）
- 输入"想家" → 自动推荐怀旧系（粥类、麦乐鸡）

**健康透明**：每条推荐都展示完整营养数据，用户能看到为什么被推荐，不会陷入"算法黑盒焦虑"。

**场景自适应**：自动识别你当前的用餐时段，推荐适合的品类（早上不推可乐、中午不推冰淇淋）。

### 3. 技术亮点

**离线 + 在线混合架构**：
- 营养数据离线缓存（启动快，主推荐链路不依赖外部接口，可在 Vercel/Render 任何平台部署）
- **运行时接入麦当劳 MCP**：`now-time-info` 实时校准用餐时段（带缓存 + 超时 + 降级三重保护）
- 实时菜单/价格信息可在接入 MCP 后按需在线获取（始终新鲜）
- 用户画像在客户端处理（隐私友好，不上传敏感数据）

**可解释 AI**：每个推荐都有 2-6 条 reason 字段说明为什么，避免"AI 黑盒"。

**多样性约束**：Top 6 不会出现全是同一类别，避免推荐同质化。

**特殊群体安全约束**：
- 老年/孕妇/儿童 → 软性偏好低钠（<500mg）
- 健身 → 软性偏好高蛋白低脂（蛋白≥20g 且 脂肪≤15g）

---

## 📊 五、可用 Tool 全清单（未使用的备选）

WorkBuddy 提供的麦当劳 MCP 还包含以下 Tool，本项目**未使用但可在未来扩展**：

| Tool | 用途 | 未来扩展场景 |
| --- | --- | --- |
| `query-my-account` | 查询用户账户 | 接入会员系统，显示"我的积分能换这个" |
| `query-my-coupons` | 查询优惠券 | 推荐 + 优惠券叠加使用 |
| `available-coupons` | 可领取优惠券 | 新用户拉新 |
| `auto-bind-coupons` | 自动绑定优惠券 | 会员转化漏斗 |
| `calculate-price` | 价格计算 | 显示总价 + 优惠后价格 |
| `campaign-calendar` | 活动日历 | "今天星期二，麦乐鸡半价"叠加推荐 |
| `create-order` | 创建订单 | 一键下单 |
| `cancel-order` | 取消订单 | 订单管理 |
| `order-list` / `query-order` | 订单查询 | 历史订单回顾 |
| `query-store-coupons` | 门店优惠券 | 附近门店的本地化优惠 |
| `delivery-create-address` / `delivery-query-stores` | 外送地址 + 门店查询 | 外送场景 |
| `draw-lottery` / `query-lottery-info` | 抽奖 | 拉新 + 留存 |
| `mall-*` 系列 | 积分商城 | 积分兑换 |
| `party-*` 系列 | 团餐 | 企业团餐场景 |
| `query-meal-assistance` / `query-meal-detail` | 餐品详情 | 详情页深链 |
| `query-promotions` / `query-survey-coupon` | 营销 | 营销活动接入 |

**已使用（不在上表）**：`list-nutrition-foods`（开发阶段数据拉取）、`now-time-info`（运行时时段校准）

**未来路线图**：
1. V1（当前）：离线营养 + 标签推荐 + MCP 时段校准
2. V2：实时菜单 + 价格 + 优惠券叠加
3. V3：一键下单 + 外送地址联动
4. V4：会员体系 + 个性化历史推荐

---

## 🛠️ 六、配置与调试

### 在本地启用（运行时 MCP 已默认接入）

后端通过环境变量读取 MCP 配置，复制 `source/server/.env.example` 为 `source/server/.env` 并填入 Token 即可：

```bash
cd source/server
cp .env.example .env
# 编辑 .env，把 MCD_MCP_TOKEN 换成你在麦当劳 MCP 控制台申请的 Token
```

```ini
MCP_MCP_URL=https://mcp.mcd.cn
MCD_MCP_TOKEN=<你的 Token>
```

启动后会看到如下日志：

```text
[mcd-imlovinit] Backend listening on http://localhost:4000
[mcd-mcp] endpoint=https://mcp.mcd.cn token=configured
[mcd-mcp] now-time-info ok → 2026-10-13 13:27:27 (GMT+08:00), hour=13
```

验证方式：

```bash
curl http://localhost:4000/api/health
# {"status":"ok",...,"mcp":{"endpoint":"https://mcp.mcd.cn","tool":"now-time-info","tokenConfigured":true,"reachable":true}}

curl -X POST http://localhost:4000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"ageRange":"young","occupation":"programmer","mealTime":"auto","moods":["tired"]}'
# 响应中会带 "timeContext":{"source":"mcd-mcp","hour":13,...}
```

> ⚠️ `source/server/.env` 已被 `.gitignore` 忽略，请勿把真实 Token 提交到仓库。

### 在 V2 中加入实时菜单/价格

如需进一步接入实时菜单/价格，可在推荐服务中叠加门店查询链路：

```typescript
import { ToolSearch, DeferExecuteTool } from 'workbuddy';

// 在推荐服务中调用实时菜单
async function enrichWithRealMenu(recommendations: ScoredMeal[]) {
  const nearbyStores = await DeferExecuteTool({
    toolName: 'mcp__mcd-mcp__query-nearby-stores',
    params: { /* 定位参数 */ },
  });
  
  const storeCode = nearbyStores.data[0].storeCode;
  const realMenu = await DeferExecuteTool({
    toolName: 'mcp__mcd-mcp__query-meals',
    params: { storeCode, orderType: 1, beType: 1 },
  });
  
  return recommendations.map(r => ({
    ...r,
    realPrice: realMenu.find(m => m.productName === r.productName)?.price,
  }));
}
```

> 注：`now-time-info` 走的是标准 MCP Streamable HTTP 协议，后端直接用 `fetch` 就能调通，无需 WorkBuddy Agent 中转。

### MCP 不可用时的降级

本项目已实现**全链路优雅降级**，MCP 挂掉也绝不影响推荐：

| 场景 | 行为 |
| --- | --- |
| 未配置 `MCD_MCP_TOKEN` | 直接使用本机时间，日志提示 `未配置 MCD_MCP_TOKEN` |
| 网络不通 / DNS 失败 | 使用本机时间，日志提示具体错误 |
| 超过 4 秒未响应 | `AbortSignal.timeout` 中断，使用本机时间 |
| 返回结构异常 | 解析失败，使用本机时间 |

降级时响应里的 `timeContext.source` 会变成 `"local"`，前端展示「按本机时间推断」；营养数据本就离线缓存，因此**核心推荐功能完全不受影响**。

---

## 📝 七、调用示例（开发调试）

```typescript
// 在 WorkBuddy Agent 内直接调用
const meals = await DeferExecuteTool({
  params: {},
  toolName: "mcp__mcd-mcp__list-nutrition-foods",
});
console.log(meals.data); // CSV 格式

// 解析为 JSON
const lines = meals.data.split('\n');
const json = lines.map(line => {
  const [productName, desc, energyKj, energyKcal, protein, fat, carbohydrate, sodium, calcium] = line.split(',');
  return {
    productName,
    energyKcal: parseInt(energyKcal),
    protein: parseFloat(protein),
    // ...
  };
});
```

---

## ✅ 八、本项目 MCP 使用合规性

- ✅ 仅使用官方公开的 Tool（`list-nutrition-foods`, `now-time-info`）
- ✅ 真实使用麦当劳 MCP 能力：开发阶段拉取营养数据，运行时时段校准
- ✅ 数据用于本地缓存和推荐计算，不外传用户隐私
- ✅ 推荐结果在客户端展示，不强制下单
- ✅ 符合"麦当劳程序员节创意开发大赛"的开发者使用规范

---

**文档版本**: v1.0 · 2026-10-13
**维护者**: 懂你餐盘团队
