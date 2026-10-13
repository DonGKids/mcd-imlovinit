import type {
  AgeRange,
  Occupation,
  FlavorPref,
  Mood,
  HealthFocus,
  MealTime,
  ScoredMeal,
  RecommendResponse,
} from '@/types';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE || '');

export async function fetchRecommend(params: {
  ageRange: AgeRange;
  occupation: Occupation;
  flavorPrefs: FlavorPref[];
  moods: Mood[];
  healthFocus: HealthFocus;
  mealTime: MealTime;
  moodText?: string;
  topN?: number;
}): Promise<ScoredMeal[]> {
  const response = await fetch(`${API_BASE}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`推荐接口异常：HTTP ${response.status}`);
  }

  const data = (await response.json()) as RecommendResponse;
  if (!data.success) {
    throw new Error('推荐服务返回失败');
  }
  return data.results;
}

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}

// 附近门店
export interface NearbyStore {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  distance: number;
  walkMinutes: number;
  driveMinutes: number;
}

export interface NearbyStoresResponse {
  success: boolean;
  city: string | null;
  stores: NearbyStore[];
  message?: string;
  supportedCities?: string[];
}

export async function fetchNearbyStores(params: {
  address: string;
  lat?: number;
  lng?: number;
  limit?: number;
}): Promise<NearbyStoresResponse> {
  const response = await fetch(`${API_BASE}/api/stores/nearby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`附近门店接口异常：HTTP ${response.status}`);
  }

  return (await response.json()) as NearbyStoresResponse;
}
