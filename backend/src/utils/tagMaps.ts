/**
 * 口味偏好 → 标签关键词映射
 */
export const FLAVOR_TO_TAGS: Record<string, string[]> = {
  sweet: ['甜'],
  salty: ['咸'],
  spicy: ['辣'],
  sour: ['酸'],
  light: ['清淡', '软糯'],
  rich: ['浓郁', '芝士', '烟熏'],
  cold: ['冰'],
  hot: ['热'],
  crispy: ['酥脆'],
  soft: ['软糯'],
  coffee: ['咖啡'],
  chocolate: ['巧克力'],
  fruit: ['水果'],
  cheese: ['芝士'],
  smoky: ['烟熏'],
};

/**
 * 心情关键词 → 标签映射（支持 moodText 模糊匹配）
 */
export const MOOD_KEYWORDS: Record<string, string[]> = {
  // 心情 → moodFit
  开心: ['comfort', 'treat', 'refresh'],
  累: ['warmUp', 'comfort', 'energize'],
  疲惫: ['warmUp', 'comfort', 'energize'],
  烦: ['comfort', 'indulge', 'treat'],
  焦虑: ['warmUp', 'comfort', 'focus'],
  沮丧: ['comfort', 'warmUp', 'indulge'],
  治愈: ['comfort', 'warmUp', 'nostalgic'],
  犒赏: ['indulge', 'reward'],
  犒劳: ['indulge', 'reward'],
  提神: ['focus', 'energize'],
  醒脑: ['focus', 'energize'],
  加满: ['energize', 'focus'],
  加班: ['focus', 'energize', 'comfort'],
  摸鱼: ['treat', 'comfort'],
  浪漫: ['treat', 'comfort'],
  聚会: ['indulge', 'comfort'],
  想家: ['nostalgic', 'warmUp', 'comfort'],
  童年: ['nostalgic', 'treat'],
  减肥: ['lowCal', 'refresh'],
  健身: ['highProtein', 'lowCal', 'refresh'],
  增肌: ['highProtein'],
  控卡: ['lowCal'],
  控糖: ['lowCal'],
  清淡: ['comfort', 'warmUp'],
  爽: ['refresh', 'coolDown'],
  解压: ['comfort', 'indulge'],
};

/**
 * 职业 → 标签偏好
 */
export const OCCUPATION_PREFERENCES: Record<string, { moodFit: string[]; flavor: string[]; nutrition: string[] }> = {
  student: { moodFit: ['energize', 'comfort', 'treat'], flavor: [], nutrition: [] },
  programmer: { moodFit: ['focus', 'energize'], flavor: ['咖啡'], nutrition: ['caffeinated'] },
  officeWorker: { moodFit: ['focus', 'comfort'], flavor: ['咖啡', '清淡'], nutrition: [] },
  fitness: { moodFit: ['refresh'], flavor: [], nutrition: ['highProtein', 'lowCal', 'lowFat'] },
  laborer: { moodFit: ['energize', 'comfort'], flavor: ['浓郁'], nutrition: ['highProtein'] },
  pregnant: { moodFit: ['comfort', 'warmUp'], flavor: ['清淡'], nutrition: ['highCalcium', 'lowSodium'] },
  elderly: { moodFit: ['warmUp', 'comfort'], flavor: ['清淡', '软糯'], nutrition: ['lowSodium', 'highCalcium', 'lowCal'] },
};

/**
 * 年龄段 → 标签偏好
 */
export const AGE_PREFERENCES: Record<string, { moodFit: string[]; flavor: string[]; nutrition: string[] }> = {
  kid: { moodFit: ['treat', 'comfort'], flavor: ['甜'], nutrition: ['highCalcium'] },
  teen: { moodFit: ['energize', 'comfort'], flavor: [], nutrition: [] },
  young: { moodFit: [], flavor: [], nutrition: [] },
  middle: { moodFit: [], flavor: [], nutrition: [] },
  senior: { moodFit: ['warmUp', 'comfort'], flavor: ['清淡', '软糯'], nutrition: ['lowSodium', 'highCalcium', 'lowCal'] },
};

/**
 * 健康关注 → 营养标签
 */
export const HEALTH_FOCUS_MAP: Record<string, string[]> = {
  lowCal: ['lowCal'],
  highProtein: ['highProtein'],
  lowSodium: ['lowSodium'],
  highCalcium: ['highCalcium'],
  lowFat: ['lowFat'],
  lowCarb: ['lowCarb'],
  caffeinated: ['caffeinated'],
  none: [],
};

/**
 * 时段 → 推荐 mealTime
 */
export function inferMealTimeFromHour(hour: number): string {
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 21) return 'dinner';
  return 'snack';
}

/**
 * 心情自由文本 → moodFit 解析（情绪词 + 健康需求）
 */
export function parseMoodText(text: string): { matchedMoodFit: string[]; matchedFlavor: string[]; matchedNutrition: string[] } {
  if (!text) return { matchedMoodFit: [], matchedFlavor: [], matchedNutrition: [] };

  const matchedMoodFit = new Set<string>();
  const matchedFlavor = new Set<string>();
  const matchedNutrition = new Set<string>();

  for (const [keyword, tags] of Object.entries(MOOD_KEYWORDS)) {
    if (text.includes(keyword)) {
      tags.forEach((t) => {
        if (['comfort', 'treat', 'refresh', 'indulge', 'focus', 'energize', 'warmUp', 'nostalgic', 'reward', 'coolDown'].includes(t)) {
          matchedMoodFit.add(t);
        }
        if (FLAVOR_TO_TAGS[t]) {
          matchedFlavor.add(...FLAVOR_TO_TAGS[t]);
        }
      });
    }
  }

  return {
    matchedMoodFit: Array.from(matchedMoodFit),
    matchedFlavor: Array.from(matchedFlavor),
    matchedNutrition: Array.from(matchedNutrition),
  };
}
