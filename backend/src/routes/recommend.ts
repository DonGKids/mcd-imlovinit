import { Router } from 'express';
import { recommend } from '../services/recommend';

const router = Router();

router.post('/', (req, res) => {
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

    const results = recommend(
      { ageRange, occupation, flavorPrefs, moods, healthFocus, mealTime, moodText, topN, excludeCategory },
    );

    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error('[recommend]', err);
    res.status(500).json({ success: false, error: '推荐服务异常' });
  }
});

export default router;
