import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchRecommend } from '@/services/recommend';
import MealCard from '@/components/MealCard';
import type {
  AgeRange,
  Occupation,
  FlavorPref,
  Mood,
  HealthFocus,
  MealTime,
  ScoredMeal,
  McpTimeContext,
} from '@/types';

interface LocationState {
  ageRange: AgeRange;
  occupation: Occupation;
  flavorPrefs: FlavorPref[];
  moods: Mood[];
  healthFocus: HealthFocus;
  mealTime: MealTime;
  moodText?: string;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [meals, setMeals] = useState<ScoredMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeContext, setTimeContext] = useState<McpTimeContext | null>(null);

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
      .then(({ results, timeContext: ctx }) => {
        if (cancelled) return;
        setMeals(results);
        setTimeContext(ctx ?? null);
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
          {state.mealTime === 'auto' && timeContext && (
            <p>
              🕐 时段：
              {timeContext.source === 'mcd-mcp'
                ? '由麦当劳 MCP 自动校准'
                : '按本机时间推断'}
              <span className="text-gray-400">
                （{timeContext.formatted} {timeContext.timezone}）
              </span>
            </p>
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
            请确认后端服务已启动：<code>python main.py</code>
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
        <section className="text-center text-sm text-gray-500 pt-4 space-y-2">
          <p>
            💡 以上推荐基于麦当劳官方营养信息 + 6 维加权算法，可在小程序内一键加购
          </p>
          {timeContext?.source === 'mcd-mcp' && (
            <p className="text-xs text-gray-400">
              🔌 已通过麦当劳 MCP · {timeContext.tool} 校准用餐时段
            </p>
          )}
        </section>
      )}
    </div>
  );
}
