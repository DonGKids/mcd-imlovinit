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
 * 支持：'北京市朝阳区三里屯'、'上海徐家汇'、'杭州' 等
 */
function parseCity(address: string): string | null {
  if (!address) return null;
  const cities = Object.keys(loadData().cities);
  // 按城市名长度倒序匹配，避免"北京市"先匹配但实际是"北京"
  const sortedCities = [...cities].sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    if (address.includes(city)) return city;
  }
  return null;
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
 * 根据用户地址（+ 可选经纬度）查找最近门店
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
    return {
      ...store,
      city,
      distance: Math.round(distance * 10) / 10, // 保留 1 位小数
      walkMinutes: walk,
      driveMinutes: drive,
    };
  });

  nearby.sort((a, b) => a.distance - b.distance);

  return { city, stores: nearby.slice(0, limit) };
}
