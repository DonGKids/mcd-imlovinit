import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchRecommend, fetchNearbyStores, type NearbyStore } from '@/api/recommend';
import MealCard from '@/components/MealCard';
import type {
  AgeRange,
  Occupation,
  FlavorPref,
  Mood,
  HealthFocus,
  MealTime,
  ScoredMeal,
} from '@/types';

interface LocationState {
  ageRange: AgeRange;
  occupation: Occupation;
  flavorPrefs: FlavorPref[];
  moods: Mood[];
  healthFocus: HealthFocus;
  mealTime: MealTime;
  moodText?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [meals, setMeals] = useState<ScoredMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 附近门店
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [storeCity, setStoreCity] = useState<string | null>(null);
  const [storeMessage, setStoreMessage] = useState<string | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRecommend({
      ageRange: state.ageRange,
      occupation: state.occupation,
      flavorPrefs: state.flavorPrefs,
      moods: state.moods,
      healthFocus: state.healthFocus,
      mealTime: state.mealTime,
      moodText: state.moodText,
      topN: 6,
    })
      .then((results) => {
        if (cancelled) return;
        setMeals(results);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state, navigate]);

  // 单独请求附近门店
  useEffect(() => {
    if (!state || !state.address) {
      setStores([]);
      setStoreCity(null);
      setStoreMessage(null);
      return;
    }
    let cancelled = false;
    setStoresLoading(true);
    setStoreMessage(null);
    fetchNearbyStores({
      address: state.address,
      lat: state.lat,
      lng: state.lng,
      limit: 3,
    })
      .then((resp) => {
        if (cancelled) return;
        if (resp.success && resp.stores.length > 0) {
          setStores(resp.stores);
          setStoreCity(resp.city);
          setStoreMessage(null);
        } else {
          setStores([]);
          setStoreCity(resp.city ?? null);
          setStoreMessage(
            resp.message ||
              (resp.city
                ? `${resp.city} 暂未收录门店数据`
                : `暂未识别到该地址所在城市。已支持：${(resp.supportedCities || []).join('、')}`),
          );
        }
        setStoresLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStoreMessage(`门店查询失败：${err.message}`);
        setStoresLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state]);

  if (!state) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <section className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/survey" className="text-mcd-red hover:underline text-sm flex items-center gap-1">
          ← 返回修改
        </Link>
        <button
          onClick={() => navigate('/', { state })}
          className="text-sm text-gray-600 hover:text-mcd-red"
        >
          🔄 重新推荐
        </button>
      </section>

      <section className="text-center space-y-2 animate-fade-in">
        <div className="text-5xl sm:text-6xl">🍔</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          给你挑了这几款
        </h1>
        <p className="text-gray-600">
          基于你的画像综合打分，前 6 名最匹配
        </p>
      </section>

      <section className="mcd-card p-4 sm:p-5 bg-gradient-to-br from-mcd-cream to-white">
        <h2 className="text-sm font-bold text-gray-700 mb-2">📋 你的画像</h2>
        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
          <p>👤 {state.ageRange} · {state.occupation}</p>
          {state.flavorPrefs.length > 0 && (
            <p>👅 口味偏好：{state.flavorPrefs.join('、')}</p>
          )}
          {state.moods.length > 0 && (
            <p>💭 心情：{state.moods.join('、')}</p>
          )}
          {state.healthFocus !== 'none' && <p>💪 健康关注：{state.healthFocus}</p>}
          {state.mealTime !== 'auto' && <p>🕐 时段：{state.mealTime}</p>}
          {state.address && (
            <p>📍 位置：{state.address}</p>
          )}
          {state.moodText && (
            <p className="italic bg-white rounded-lg p-2 mt-2 border-l-4 border-mcd-red">
              "{state.moodText}"
            </p>
          )}
        </div>
      </section>

      {loading && (
        <div className="text-center py-12">
          <div className="text-5xl animate-pulse-slow">🍟</div>
          <p className="mt-4 text-gray-600">正在为你挑最适合的麦当劳餐品...</p>
        </div>
      )}

      {error && (
        <div className="mcd-card p-6 text-center text-red-600 border-2 border-red-200">
          <p className="font-semibold">⚠️ 推荐失败</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs mt-2 text-gray-500">
            请确认后端服务已启动：<code>cd backend && npm run dev</code>
          </p>
        </div>
      )}

      {!loading && !error && meals.length === 0 && (
        <div className="mcd-card p-6 text-center text-gray-500">
          😢 没有匹配的餐品，试试放宽一些筛选条件
        </div>
      )}

      {!loading && !error && meals.length > 0 && (
        <section className="space-y-4">
          {meals.map((meal, i) => (
            <MealCard key={meal.productName} meal={meal} rank={i + 1} />
          ))}
        </section>
      )}

      {!loading && !error && meals.length > 0 && (
        <section className="text-center text-sm text-gray-500 pt-4">
          <p>
            💡 以上推荐基于麦当劳官方营养信息 + 6 维加权算法，可在小程序内一键加购
          </p>
        </section>
      )}

      {/* 附近门店 */}
      {(state.address || storesLoading) && (
        <section className="space-y-3 pt-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              📍 附近门店
            </h2>
            {storeCity && (
              <span className="text-xs text-gray-500">
                {storeCity} · 距你最近的 3 家
              </span>
            )}
          </div>

          {storesLoading && (
            <div className="mcd-card p-6 text-center text-gray-500">
              <div className="text-3xl animate-pulse-slow">🏃</div>
              <p className="text-sm mt-2">正在查找附近麦当劳…</p>
            </div>
          )}

          {!storesLoading && storeMessage && (
            <div className="mcd-card p-4 text-sm text-amber-700 bg-amber-50">
              {storeMessage}
            </div>
          )}

          {!storesLoading && stores.length > 0 && (
            <div className="space-y-3">
              {stores.map((s, idx) => (
                <div
                  key={s.id}
                  className="mcd-card p-4 sm:p-5 flex items-start gap-3"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      idx === 0
                        ? 'bg-mcd-red'
                        : idx === 1
                        ? 'bg-orange-500'
                        : 'bg-amber-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {s.name}
                      </h3>
                      <span className="text-xs text-mcd-red font-semibold whitespace-nowrap">
                        {s.distance} km
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {s.address}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>🚶 步行约 {s.walkMinutes} 分钟</span>
                      <span>🚗 驾车约 {s.driveMinutes} 分钟</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!storesLoading && stores.length > 0 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              距离为直线估算，实际路线请以导航为准
            </p>
          )}
        </section>
      )}
    </div>
  );
}
