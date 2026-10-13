import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import recommendRouter from './routes/recommend';
import catalogRouter from './routes/catalog';
import { getTimeContext, mcpStatus } from './services/mcpTime';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(
  cors({
    origin: [FRONTEND_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

// 限流
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 健康检查（含麦当劳 MCP 接入状态）
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mcd-imlovinit-backend',
    time: new Date().toISOString(),
    mcp: mcpStatus(),
  });
});

app.use('/api/recommend', recommendRouter);
app.use('/api/catalog', catalogRouter);

// 全局错误处理
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[server-error]', err);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`[mcd-imlovinit] Backend listening on http://localhost:${PORT}`);
  console.log(`[mcd-imlovinit] Health check: http://localhost:${PORT}/api/health`);

  // 启动时预热麦当劳 MCP 时间上下文（不阻塞服务就绪，失败自动降级）
  const status = mcpStatus();
  console.log(`[mcd-mcp] endpoint=${status.endpoint} token=${status.tokenConfigured ? 'configured' : 'missing'}`);
  void getTimeContext().then((ctx) => {
    if (ctx.source === 'mcd-mcp') {
      console.log(`[mcd-mcp] ${ctx.tool} ok → ${ctx.formatted} (${ctx.timezone}), hour=${ctx.hour}`);
    } else {
      console.warn(`[mcd-mcp] ${ctx.tool} 降级为本机时间：${ctx.fallbackReason || 'unknown'}`);
    }
  });
});
