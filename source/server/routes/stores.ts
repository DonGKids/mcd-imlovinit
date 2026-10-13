import { Router } from 'express';
import { findNearbyStores } from '../services/stores';

const router = Router();

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
        message: '暂不支持该城市，目前覆盖：北京、上海、广州、深圳、杭州、成都',
        supportedCities: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
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
