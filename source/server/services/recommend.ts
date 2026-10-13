import type { RecommendRequest, ScoredMeal, MealTags, MealItem } from '../types';
import {
  FLAVOR_TO_TAGS,
  OCCUPATION_PREFERENCES,
  AGE_PREFERENCES,
  HEALTH_FOCUS_MAP,
  inferMealTimeFromHour,
  parseMoodText,
} from '../utils/tagMaps';
import { loadMealCatalog } from './catalog';

const REASON_LIBRARY: Record<string, (meal: { nutrition: MealItem; tags: MealTags }) => string> = {
  ageFit: (_) => '年龄段适配',
  occupationFit: (_) => '职业场景对位',
  flavor: (_) => '口味对味',
  mood: (_) => '心情匹配',
  health: (_) => '健康需求达标',
  mealTime: (_) => '时段契合',
  mealTimeHint: (_) => '该时段经典',
  nutritionSpecial: (m) => {
    const nt = m.tags.nutritionTags;
    if (nt.includes('highCalcium')) return '补钙小能手';
    if (nt.includes('highProtein')) return '蛋白质爆棚';
    if (nt.includes('lowCal')) return '低卡友好';
    if (nt.includes('lowSodium')) return '低钠清淡';
    return '';
  },
};

/**
 * 推荐算法核心
 * 思路：对每道餐品做多维度加权打分（年龄段/职业/口味/心情/健康/时段），取 Top N
 */
export function recommend(request: RecommendRequest, currentHour?: number): ScoredMeal[] {
  const catalog = loadMealCatalog();
  const topN = request.topN ?? 5;

  // 解析 moodText
  const moodTextParsed = parseMoodText(request.moodText || '');

  // 偏好聚合
  const desiredFlavorTags = new Set<string>();
  request.flavorPrefs.forEach((f) => FLAVOR_TO_TAGS[f]?.forEach((t) => desiredFlavorTags.add(t)));
  moodTextParsed.matchedFlavor.forEach((t) => desiredFlavorTags.add(t));

  const desiredMoodFit = new Set<string>([
    ...request.moods,
    ...moodTextParsed.matchedMoodFit,
  ]);

  // 职业与年龄段的隐式偏好（用于分数加成）
  const occPref = OCCUPATION_PREFERENCES[request.occupation] || { moodFit: [], flavor: [], nutrition: [] };
  const agePref = AGE_PREFERENCES[request.ageRange] || { moodFit: [], flavor: [], nutrition: [] };
  occPref.flavor.forEach((f) => FLAVOR_TO_TAGS[f]?.forEach((t) => desiredFlavorTags.add(t)));
  agePref.flavor.forEach((f) => FLAVOR_TO_TAGS[f]?.forEach((t) => desiredFlavorTags.add(t)));

  const desiredHealth = new Set<string>([
    ...(request.healthFocus && HEALTH_FOCUS_MAP[request.healthFocus]
      ? HEALTH_FOCUS_MAP[request.healthFocus]
      : []),
    ...moodTextParsed.matchedNutrition,
    ...occPref.nutrition,
    ...agePref.nutrition,
  ]);

  const inferredMealTime =
    request.mealTime && request.mealTime !== 'auto'
      ? request.mealTime
      : inferMealTimeFromHour(currentHour ?? new Date().getHours());

  const excludeCategories = new Set(request.excludeCategory || []);

  const scored: ScoredMeal[] = [];

  for (const meal of catalog) {
    if (excludeCategories.has(meal.tags.category)) continue;

    const scoreBreakdown: Record<string, number> = {};
    const reasons: string[] = [];
    const matchedDimensions: string[] = [];

    // === 维度 1：年龄段适配（强匹配/弱匹配/无适配）===
    if (meal.tags.ageFit.includes(request.ageRange)) {
      scoreBreakdown.ageFit = 25;
      matchedDimensions.push('ageFit');
      reasons.push('年龄段适配');
    } else if (request.ageRange === 'senior' && meal.tags.ageFit.includes('middle')) {
      // 老年用户对中年适配的餐品保留温和加分
      scoreBreakdown.ageFit = 5;
    }

    // === 维度 2：职业场景 ===
    if (meal.tags.occupationFit.includes(request.occupation)) {
      scoreBreakdown.occupationFit = 18;
      matchedDimensions.push('occupationFit');
      reasons.push(`职业场景对位：${getOccupationLabel(request.occupation)}`);
    }

    // === 维度 3：口味匹配 ===
    const flavorHits = meal.tags.flavorTags.filter((t) => desiredFlavorTags.has(t));
    if (flavorHits.length > 0) {
      scoreBreakdown.flavor = Math.min(flavorHits.length * 8, 20);
      matchedDimensions.push('flavor');
      reasons.push(`口味对味：${flavorHits.join('、')}`);
    }

    // === 维度 4：心情匹配 ===
    const moodHits = meal.tags.moodFit.filter((t) => desiredMoodFit.has(t as any));
    if (moodHits.length > 0) {
      scoreBreakdown.mood = Math.min(moodHits.length * 12, 24);
      matchedDimensions.push('mood');
      const moodLabel = getMoodLabel(moodHits[0]);
      reasons.push(`心情匹配：${moodLabel}`);
    }

    // === 维度 5：健康/营养属性 ===
    const healthHits = meal.tags.nutritionTags.filter((t) => desiredHealth.has(t));
    if (healthHits.length > 0) {
      scoreBreakdown.health = Math.min(healthHits.length * 10, 25);
      matchedDimensions.push('health');
      reasons.push(`健康需求达标：${healthHits.map(getNutritionLabel).join('、')}`);
    }

    // === 维度 6：时段匹配 ===
    if (meal.tags.mealTime === inferredMealTime) {
      scoreBreakdown.mealTime = 12;
      matchedDimensions.push('mealTime');
      reasons.push(`时段契合：${getMealTimeLabel(inferredMealTime)}`);
    } else if (meal.tags.mealTime === 'allDay') {
      scoreBreakdown.mealTime = 4;
    }

    // === 营养亮点（基于 data 的特殊属性）===
    const specialReason = REASON_LIBRARY.nutritionSpecial(meal);
    if (specialReason) reasons.push(specialReason);

    // 老年/孕妇/儿童 低钠弱约束
    if (
      (request.ageRange === 'senior' || request.occupation === 'pregnant' || request.ageRange === 'kid') &&
      meal.nutrition.sodium < 500
    ) {
      scoreBreakdown.lowSodiumBonus = 8;
      reasons.push('钠含量友好');
    }

    // 健身人群 高蛋白/低脂加分
    if (request.occupation === 'fitness') {
      if (meal.nutrition.protein >= 20 && meal.nutrition.fat <= 15) {
        scoreBreakdown.fitnessBonus = 12;
        reasons.push('高蛋白低脂，健身友好');
      }
    }

    const totalScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);

    if (totalScore <= 0) continue;
    // 至少需要 1 个真实匹配维度（防止冷启动误推）
    if (matchedDimensions.length === 0 && totalScore < 15) continue;

    scored.push({
      productName: meal.nutrition.productName,
      nutrition: meal.nutrition,
      tags: meal.tags,
      score: totalScore,
      reasons: Array.from(new Set(reasons)),
      matchedDimensions,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  // 多样性：同一类别不连续超过 2 个
  const diversified: ScoredMeal[] = [];
  const categoryCount: Record<string, number> = {};
  for (const meal of scored) {
    const cat = meal.tags.category;
    if ((categoryCount[cat] || 0) >= 2) continue;
    diversified.push(meal);
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    if (diversified.length >= topN) break;
  }

  return diversified;
}

function getOccupationLabel(o: string): string {
  const map: Record<string, string> = {
    student: '学生',
    programmer: '程序员',
    officeWorker: '白领',
    fitness: '健身人群',
    laborer: '体力劳动者',
    pregnant: '孕妈',
    elderly: '退休人士',
  };
  return map[o] || o;
}

function getMoodLabel(m: string): string {
  const map: Record<string, string> = {
    happy: '开心',
    tired: '疲惫',
    stressed: '焦虑',
    excited: '兴奋',
    anxious: '焦虑',
    calm: '平静',
    sad: '沮丧',
    romantic: '浪漫',
    focus: '需要专注',
    party: '聚会',
    nostalgic: '怀旧',
    treat: '想要小确幸',
    comfort: '需要被治愈',
    refresh: '想要清爽',
    reward: '想要犒赏自己',
    energize: '需要提神',
    warmUp: '想要暖胃',
    coolDown: '想要降温',
  };
  return map[m] || m;
}

function getNutritionLabel(n: string): string {
  const map: Record<string, string> = {
    lowCal: '低卡',
    highProtein: '高蛋白',
    lowSodium: '低钠',
    highCalcium: '高钙',
    caffeinated: '含咖啡因',
    lowFat: '低脂',
    lowCarb: '低碳水',
    highCarb: '高碳水',
    hydrating: '补水',
  };
  return map[n] || n;
}

function getMealTimeLabel(m: string): string {
  const map: Record<string, string> = {
    breakfast: '早餐时段',
    lunch: '午餐时段',
    dinner: '晚餐时段',
    snack: '加餐时段',
    allDay: '全天供应',
  };
  return map[m] || m;
}
