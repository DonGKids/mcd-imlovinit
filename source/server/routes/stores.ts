import { Router } from 'express';
import { findNearbyStores } from '../services/stores';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

// 启动时一次性加载城市列表（用于"不支持城市"的提示）
let SUPPORTED_CITIES: string[] = [];
try {
  const data = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'data', 'stores.json'), 'utf-8'),
  );
  SUPPORTED_CITIES = Object.keys(data.cities || {});
} catch (e) {
  console.error('[stores] 加载门店数据失败', e);
}

router.post('/nearby', (req, res) => {
  try {
    const { address, lat, lng, limit } = req.body || {};
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数：address（地址字符串）',
      });
    }

    const result = findNearbyStores(address, lat, lng, limit || 3);

    if (!result.city) {
      return res.json({
        success: true,
        city: null,
        stores: [],
        message: `暂未识别到该地址所在城市。已支持 ${SUPPORTED_CITIES.length} 个城市（4 直辖市 + 27 省会 + 10 主要城市），也支持城市别名（如"帝都"→北京、"魔都"→上海、"羊城"→广州）`,
        supportedCities: SUPPORTED_CITIES,
      });
    }

    res.json({
      success: true,
      city: result.city,
      stores: result.stores,
    });
  } catch (err) {
    console.error('[stores/nearby]', err);
    res.status(500).json({ success: false, error: '查询附近门店失败' });
  }
});

export default router;
