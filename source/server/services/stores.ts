import { readFileSync } from 'fs';
import { join } from 'path';

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface NearbyStore extends Store {
  city: string;
  distance: number; // 公里
  walkMinutes: number; // 步行约 X 分钟（按 5 km/h 估算）
  driveMinutes: number; // 驾车约 X 分钟（按 30 km/h 估算）
}

interface StoresData {
  cities: Record<string, Store[]>;
  cityCenter: Record<string, { lat: number; lng: number }>;
  cityAliases: Record<string, string>;
}

let cachedData: StoresData | null = null;

function loadData(): StoresData {
  if (cachedData) return cachedData;
  // 路径：source/server/services/stores.ts → ../../data/stores.json
  const path = join(__dirname, '..', '..', 'data', 'stores.json');
  const raw = readFileSync(path, 'utf-8');
  cachedData = JSON.parse(raw) as StoresData;
  return cachedData;
}

/**
 * 从地址字符串解析城市
 * 支持：城市名 / 城市别名（如"帝都"→"北京"、"魔都"→"上海"、"羊城"→"广州"）
 * 匹配规则：先按出现位置，再按名字长度（更长的城市名优先，避免"北京"先于"朝阳区"匹配）
 */
function parseCity(address: string): string | null {
  if (!address) return null;
  const data = loadData();
  const cities = Object.keys(data.cities);
  const aliases = Object.entries(data.cityAliases || {}); // [alias, cityName][]

  type Candidate = { name: string; index: number; length: number };
  const candidates: Candidate[] = [];

  for (const city of cities) {
    const idx = address.indexOf(city);
    if (idx >= 0) candidates.push({ name: city, index: idx, length: city.length });
  }
  for (const [alias, city] of aliases) {
    const idx = address.indexOf(alias);
    if (idx >= 0) candidates.push({ name: city, index: idx, length: alias.length });
  }

  if (candidates.length === 0) return null;

  // 排序：先按出现位置（越靠前越好），再按名字长度（越长越好）
  candidates.sort((a, b) => a.index - b.index || b.length - a.length);
  return candidates[0].name;
}

/**
 * Haversine 公式：计算两点间球面距离（公里）
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // 地球半径（公里）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 估算出行时间
 */
function estimateMinutes(distanceKm: number): { walk: number; drive: number } {
  return {
    walk: Math.round((distanceKm / 5) * 60), // 5 km/h
    drive: Math.round((distanceKm / 30) * 60), // 30 km/h
  };
}

/**
 * 名称/地标关键词匹配得分
 * 用于在用户输入里直接出现门店名/地标名时把对应门店排前
 *   - 全名匹配（含"新街口"→"麦当劳新街口店"）：+1000 分
 *   - 2 字子串匹配：+100 分
 *   - 否则：0 分
 */
function nameMatchScore(storeName: string, userInput: string): number {
  if (!userInput) return 0;
  // 去掉"麦当劳"前缀和"店"后缀
  const cleaned = storeName.replace(/^麦当劳/, '').replace(/店$/, '').trim();
  if (!cleaned || cleaned.length < 2) return 0;
  if (userInput.includes(cleaned)) return 1000;
  // 2-3 字滑动窗口
  for (let len = Math.min(3, cleaned.length); len >= 2; len--) {
    for (let i = 0; i <= cleaned.length - len; i++) {
      const sub = cleaned.substring(i, i + len);
      if (userInput.includes(sub)) return 100;
    }
  }
  return 0;
}

/**
 * 根据用户地址（+ 可选经纬度）查找最近门店
 * 排序优先级：名称/地标匹配分（高→低）→ 距离（低→高）
 */
export function findNearbyStores(
  address: string,
  userLat?: number,
  userLng?: number,
  limit = 3,
): { city: string | null; stores: NearbyStore[] } {
  const data = loadData();
  const city = parseCity(address);

  if (!city) {
    return { city: null, stores: [] };
  }

  const cityStores = data.cities[city] || [];
  // 如果用户没传经纬度，使用城市中心
  const center = data.cityCenter[city];
  const baseLat = userLat ?? center?.lat;
  const baseLng = userLng ?? center?.lng;

  const nearby: NearbyStore[] = cityStores.map((store) => {
    const distance = haversineDistance(baseLat, baseLng, store.lat, store.lng);
    const { walk, drive } = estimateMinutes(distance);
    const boost = nameMatchScore(store.name, address);
    return {
      ...store,
      city,
      distance: Math.round(distance * 10) / 10, // 保留 1 位小数
      walkMinutes: walk,
      driveMinutes: drive,
      _boost: boost, // 排序用，前端不返回
    };
  });

  // 排序：先按名称/地标匹配分（降序），再按距离（升序）
  nearby.sort((a, b) => (b as any)._boost - (a as any)._boost || a.distance - b.distance);

  // 去掉内部字段
  return {
    city,
    stores: nearby.slice(0, limit).map((s) => {
      const { _boost, ...rest } = s as any;
      return rest;
    }),
  };
}
