import { Router } from 'express';
import { loadMealCatalog, loadMeals, loadTags } from '../services/catalog';

const router = Router();

router.get('/meals', (_req, res) => {
  try {
    const meals = loadMeals();
    res.json({ success: true, count: meals.length, meals });
  } catch (err) {
    res.status(500).json({ success: false, error: '加载餐品失败' });
  }
});

router.get('/tags', (_req, res) => {
  try {
    const tags = loadTags();
    res.json({ success: true, count: Object.keys(tags).length, tags });
  } catch (err) {
    res.status(500).json({ success: false, error: '加载标签失败' });
  }
});

router.get('/catalog', (_req, res) => {
  try {
    const catalog = loadMealCatalog();
    res.json({ success: true, count: catalog.length, catalog });
  } catch (err) {
    res.status(500).json({ success: false, error: '加载目录失败' });
  }
});

export default router;
