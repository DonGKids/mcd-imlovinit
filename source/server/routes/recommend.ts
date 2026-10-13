import { Router } from 'express';
import { recommend } from '../services/recommend';
import { getTimeContext } from '../services/mcpTime';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      ageRange,
      occupation,
      flavorPrefs = [],
      moods = [],
      healthFocus = 'none',
      mealTime = 'auto',
      moodText,
      topN = 5,
      excludeCategory = [],
    } = body;

    if (!ageRange || !occupation) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数：ageRange 与 occupation',
      });
    }

    // 用户未指定时段时，通过麦当劳 MCP(now-time-info) 取回服务器时间再推断时段
    const needTimeContext = !mealTime || mealTime === 'auto';
    const timeContext = needTimeContext ? await getTimeContext() : undefined;

    const results = recommend(
      { ageRange, occupation, flavorPrefs, moods, healthFocus, mealTime, moodText, topN, excludeCategory },
      timeContext?.hour,
    );

    res.json({
      success: true,
      count: results.length,
      results,
      ...(timeContext
        ? {
            timeContext: {
              source: timeContext.source,
              hour: timeContext.hour,
              formatted: timeContext.formatted,
              timezone: timeContext.timezone,
              tool: timeContext.tool,
              ...(timeContext.fallbackReason ? { fallbackReason: timeContext.fallbackReason } : {}),
            },
          }
        : {}),
    });
  } catch (err) {
    console.error('[recommend]', err);
    res.status(500).json({ success: false, error: '推荐服务异常' });
  }
});

export default router;
