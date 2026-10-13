# WorkBuddy 开发上下文 · workbuddy.md

> 本文件用于说明「懂你餐盘」项目在 **WorkBuddy** 中的开发过程与使用的能力，作为参与麦当劳程序员节创意开发大赛 · WorkBuddy 专项奖励的核验材料。

---

## 一、项目信息

| 项 | 内容 |
| --- | --- |
| 项目名称 | 懂你餐盘（mcd-imlovinit） |
| 一句话介绍 | 基于麦当劳官方营养数据与 MCP 服务的 6 维加权智能餐品推荐 Web 应用 |
| 开发工具 | WorkBuddy（Agent 模式） |
| 技术栈 | React 18 + TypeScript + Vite + Tailwind CSS / Node.js + Express + TypeScript |

---

## 二、WorkBuddy 在本项目中的使用方式

开发全程在 WorkBuddy 的 **Agent 模式** 中完成，未使用本地手写脚手架。主要用到的 WorkBuddy 能力：

| WorkBuddy 能力 | 本项目中的具体用途 |
| --- | --- |
| **麦当劳 MCP 连接器**（`mcp__mcd-mcp__*`） | ① 调用 `mcp__mcd-mcp__list-nutrition-foods` 拉取麦当劳全量餐品营养信息（CSV），解析并落地为 `source/data/meals-nutrition.json`；② 调用 `mcp__mcd-mcp__now-time-info` 探明返回结构，据此在**后端实现运行时 MCP 调用**（`source/server/services/mcpTime.ts`），用于「自动判断用餐时段」 |
| **文件读写 / 代码编辑** | 生成与重构前端页面（介绍页 / 问卷页 / 结果页）、后端路由与算法服务、配置文件 |
| **终端命令执行** | 启动前后端开发服务、运行 `tsc` 类型检查与 `vite build` 生产构建、依赖安装 |
| **浏览器自动化 / 无头浏览器验证** | 用无头 Chrome 渲染页面并 dump DOM / 截图，定位"白屏"故障、逐屏核对 UI 改动是否生效（含验证「已通过麦当劳 MCP 校准用餐时段」标识真实渲染） |
| **文档撰写** | 生成 `README.md`、`MCP_INTEGRATION.md`、部署与 API 文档 |
| **数据分析脚本** | 用 Python 统计营养表 / 标签表条目数，核对文档中的数字与实际数据是否一致 |

---

## 三、关键开发过程（时间线）

1. **技术选型与骨架搭建**：确定 React + Vite + TS 前端、Express + TS 后端的结构，建立 6 维推荐算法的评分模型。
2. **MCP 数据接入**：通过 WorkBuddy 的麦当劳 MCP 连接器获取营养数据，解析为结构化 JSON，作为离线推荐的数据基础。
3. **推荐算法实现**：6 维加权打分（年龄段 / 职业 / 口味 / 心情 / 健康 / 时段）+ 多样性约束 + 特殊群体软约束 + 解释性 reasons。
4. **前端交互开发**：5 屏滚动介绍页 → 6 维问卷（含自然语言心情输入）→ 推荐结果页。
5. **故障排查**：定位并修复"本地运行白屏"问题——前端源码目录 `api/` 与 Vite `/api` 代理前缀冲突，导致 `/api/*.ts` 被误代理到后端返回 404 HTML，模块 MIME 校验失败而整站崩溃；通过目录改名 + 代理 `bypass` 防护修复。
6. **构建修复**：修复后端 `tagMaps.ts` 的类型错误（后端 `npm run build` 直接失败），恢复可构建状态。
7. **功能裁剪**：按产品判断移除"地址 / 附近门店"与"近期联名活动"模块（前者为本地静态数据、后者为硬编码活动信息，均无法保证与真实情况一致），使 V1 聚焦"营养 + 标签"这条数据可验证的链路。
8. **数据口径校准**：核对源码与数据，将文档中与实际不符的数字（餐品数量、心情关键词数量、MCP 工具使用情况）全部更正。
9. **运行时 MCP 接入**：在 WorkBuddy 中先用 `mcp__mcd-mcp__now-time-info` 探明真实返回结构，再在后端按 MCP Streamable HTTP 协议（`initialize` → `notifications/initialized` → `tools/call`）直连实现运行时调用，并补充 5 分钟缓存、4 秒超时、失败降级三重保护；顺带修复了 `dist` 产物下数据目录解析错误与营养表 2 条重复行。
10. **参赛材料整理**：按大赛要求整理仓库结构（`README.md` / `CONTEST_DECLARATION.md` / `MCP_INTEGRATION.md` / `mcp-config.example.json` / 源代码），并统一赛事名称为「麦当劳程序员节创意开发大赛」。

---

## 四、说明

- 本文件为项目在 WorkBuddy 中的**开发上下文摘要**，用于核验项目确由 WorkBuddy 开发完成。
- 如需完整对话记录，可使用 WorkBuddy 的对话导出功能生成本文件内容后覆盖。
- 本文件与 `MCP_INTEGRATION.md` 互补：后者说明 MCP Server / Tool / 调用流程与业务价值，本文件说明 WorkBuddy 的开发过程。
