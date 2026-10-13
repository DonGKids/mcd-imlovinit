import type { ScoredMeal } from '@/types';

interface MealCardProps {
  meal: ScoredMeal;
  rank: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  burger: '🍔',
  breakfast: '🌅',
  drink: '🥤',
  side: '🍟',
  dessert: '🍨',
  salad: '🥗',
  coffee: '☕',
  combo: '🍱',
  snack: '🍗',
};

const CATEGORY_LABEL: Record<string, string> = {
  burger: '汉堡',
  breakfast: '早餐',
  drink: '饮料',
  side: '小食',
  dessert: '甜品',
  salad: '沙拉',
  coffee: '咖啡',
  combo: '套餐',
  snack: '小食',
};

export default function MealCard({ meal, rank }: MealCardProps) {
  const emoji = CATEGORY_EMOJI[meal.tags.category] || '🍽️';
  const catLabel = CATEGORY_LABEL[meal.tags.category] || '餐品';

  return (
    <article className="mcd-card p-5 flex flex-col gap-4 animate-slide-up">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="text-4xl sm:text-5xl">{emoji}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-mcd-red bg-mcd-cream px-2 py-0.5 rounded-full">
                #{rank}
              </span>
              <span className="text-xs text-gray-500">{catLabel}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 break-words">
              {meal.productName}
            </h3>
            {meal.tags.note && (
              <p className="text-sm text-gray-600 mt-1">{meal.tags.note}</p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-mcd-red">{meal.nutrition.energyKcal}</div>
          <div className="text-xs text-gray-500">kcal</div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-mcd-cream rounded-lg p-2">
          <div className="font-bold text-gray-900">{meal.nutrition.protein}g</div>
          <div className="text-gray-500">蛋白质</div>
        </div>
        <div className="bg-mcd-cream rounded-lg p-2">
          <div className="font-bold text-gray-900">{meal.nutrition.fat}g</div>
          <div className="text-gray-500">脂肪</div>
        </div>
        <div className="bg-mcd-cream rounded-lg p-2">
          <div className="font-bold text-gray-900">{meal.nutrition.carbohydrate}g</div>
          <div className="text-gray-500">碳水</div>
        </div>
        <div className="bg-mcd-cream rounded-lg p-2">
          <div className="font-bold text-gray-900">{meal.nutrition.sodium}</div>
          <div className="text-gray-500">钠mg</div>
        </div>
      </div>

      {meal.reasons.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            为何推荐
          </div>
          <ul className="space-y-1.5">
            {meal.reasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 bg-mcd-cream/60 rounded-lg px-3 py-2"
              >
                <span className="text-mcd-red">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meal.tags.flavorTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
          {meal.tags.flavorTags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-white border border-mcd-yellow text-mcd-brown rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
