/**
 * 麦当劳 MCP 运行时接入 —— now-time-info
 * ===============================================================
 * 通过 MCP（Model Context Protocol）Streamable HTTP 直连官方 MCP Server
 * （默认 https://mcp.mcd.cn），调用 `now-time-info` 工具获取服务器时间，
 * 用于把用户未显式选择的用餐时段（mealTime === 'auto'）校准到真实时间。
 *
 * 设计要点
 *   · 零额外依赖：使用 Node 18+ 内置 fetch 完成 initialize → tools/call 握手
 *   · 全程可降级：未配置 token / 网络异常 / 超时 → 回退本机时间，绝不阻断推荐主流程
 *   · 结果缓存：默认 5 分钟内复用，避免每次推荐请求都打一次 MCP
 *
 * 环境变量
 *   MCP_MCP_URL     MCP Server 地址，默认 https://mcp.mcd.cn
 *   MCD_MCP_TOKEN   麦当劳 MCP 访问令牌（Bearer），未配置时自动降级
 */

const PROTOCOL_VERSION = '2025-03-26';
const TOOL_NAME = 'now-time-info';
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4000;

export interface TimeContext {
  /** 0-23 的小时数（北京时间） */
  hour: number;
  /** yyyy-MM-dd HH:mm:ss */
  formatted: string;
  /** 时区标识，例如 GMT+08:00 */
  timezone: string;
  /** 数据来源：真实 MCP 调用 或 本机降级 */
  source: 'mcd-mcp' | 'local';
  /** 调用的 MCP 工具名 */
  tool: string;
  /** 降级原因（source === 'local' 时存在） */
  fallbackReason?: string;
}

// 惰性读取环境变量：dotenv 在 import 之后才执行，模块顶层取值的时机并不安全
function mcpUrl(): string {
  return (process.env.MCP_MCP_URL || 'https://mcp.mcd.cn').replace(/\/+$/, '');
}

function mcpToken(): string {
  return process.env.MCD_MCP_TOKEN || '';
}

let cache: { at: number; value: TimeContext } | null = null;
let inflight: Promise<TimeContext> | null = null;

/** 本机时间兜底 */
function localContext(reason?: string): TimeContext {
  const now = new Date();
  return {
    hour: now.getHours(),
    formatted: formatLocal(now),
    timezone: `GMT${offsetString(now)}`,
    source: 'local',
    tool: TOOL_NAME,
    ...(reason ? { fallbackReason: reason } : {}),
  };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`;
}

function offsetString(d: Date): string {
  const mins = -d.getTimezoneOffset();
  const sign = mins >= 0 ? '+' : '-';
  const abs = Math.abs(mins);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** 从 MCP 返回的文本块中剥离出结构化的 JSON 载荷 */
function extractPayload(text: string): any | null {
  const anchor = text.indexOf('## Original Response');
  const body = anchor >= 0 ? text.slice(anchor) : text;

  const start = body.indexOf('{');
  if (start < 0) return null;

  // 花括号配对扫描，取出第一个完整 JSON 对象
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < body.length; i += 1) {
    const ch = body[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(body.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** 兼容 JSON 与 SSE 两种响应形态 */
async function readRpc(res: Response): Promise<any | null> {
  const ct = res.headers.get('content-type') || '';
  const text = await res.text();
  if (ct.includes('text/event-stream')) {
    let last: any = null;
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        last = JSON.parse(payload);
      } catch {
        /* 忽略非 JSON 行 */
      }
    }
    return last;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 完成一次完整的 MCP 调用：
 * initialize → notifications/initialized → tools/call
 */
async function callNowTimeInfo(): Promise<TimeContext> {
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const url = mcpUrl();
  const token = mcpToken();

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (token) baseHeaders['Authorization'] = `Bearer ${token}`;

  // 1) 初始化握手
  const initRes = await fetch(url, {
    method: 'POST',
    headers: baseHeaders,
    signal,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'mcd-imlovinit', version: '1.0.0' },
      },
    }),
  });
  if (!initRes.ok) throw new Error(`initialize HTTP ${initRes.status}`);
  const sessionId = initRes.headers.get('mcp-session-id');
  await readRpc(initRes);

  const headers = { ...baseHeaders };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  // 2) 完成初始化通知（服务端返回 202，无需读取响应体）
  await fetch(url, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  }).catch(() => undefined);

  // 3) 调用工具
  const callRes = await fetch(url, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: TOOL_NAME, arguments: {} },
    }),
  });
  if (!callRes.ok) throw new Error(`tools/call HTTP ${callRes.status}`);
  const rpc = await readRpc(callRes);
  if (rpc?.error) throw new Error(rpc.error.message || 'MCP 返回 error');
  if (!rpc?.result) throw new Error('MCP 返回结构异常');

  const result = rpc.result;
  let payload: any = result.structuredContent ?? null;
  if (!payload && Array.isArray(result.content)) {
    const textBlock = result.content.find((c: any) => typeof c?.text === 'string');
    if (textBlock) payload = extractPayload(textBlock.text);
  }
  if (!payload) throw new Error('未能解析 MCP 返回内容');

  const data = payload.data ?? payload;
  const datetime: string = data.datetime || data.formatted || '';
  const hourMatch = /T(\d{2}):/.exec(datetime) || /\s(\d{2}):/.exec(datetime);

  return {
    hour: hourMatch ? Number(hourMatch[1]) : new Date().getHours(),
    formatted: data.formatted || datetime,
    timezone: data.timezone || 'GMT+08:00',
    source: 'mcd-mcp',
    tool: TOOL_NAME,
  };
}

/**
 * 获取时间上下文：优先命中缓存，其次发起真实 MCP 调用，失败则降级本机时间。
 * 并发请求会共享同一次进行中的调用。
 */
export async function getTimeContext(): Promise<TimeContext> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.value;
  if (inflight) return inflight;

  if (!mcpToken()) {
    const value = localContext('未配置 MCD_MCP_TOKEN');
    cache = { at: now, value };
    return value;
  }

  inflight = (async () => {
    try {
      const value = await callNowTimeInfo();
      cache = { at: Date.now(), value };
      return value;
    } catch (e: any) {
      const value = localContext(e?.message || String(e));
      // 降级结果只短暂缓存，避免长期屏蔽 MCP
      cache = { at: Date.now() - CACHE_TTL_MS + 60_000, value };
      return value;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** 同步读取（仅用于日志展示，不触发网络） */
export function peekTimeContext(): TimeContext {
  return cache?.value ?? localContext();
}

/** MCP 接入状态，用于健康检查 */
export function mcpStatus(): { endpoint: string; tool: string; tokenConfigured: boolean; reachable: boolean } {
  return {
    endpoint: mcpUrl(),
    tool: TOOL_NAME,
    tokenConfigured: Boolean(mcpToken()),
    reachable: cache?.value.source === 'mcd-mcp',
  };
}
