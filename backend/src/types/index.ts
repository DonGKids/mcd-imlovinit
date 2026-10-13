/**
 * 用户画像类型定义
 */
export type AgeRange = 'kid' | 'teen' | 'young' | 'middle' | 'senior';
export type Occupation =
  | 'student'
  | 'programmer'
  | 'officeWorker'
  | 'fitness'
  | 'laborer'
  | 'pregnant'
  | 'elderly';
export type FlavorPref =
  | 'sweet'
  | 'salty'
  | 'spicy'
  | 'sour'
  | 'light'
  | 'rich'
  | 'cold'
  | 'hot'
  | 'crispy'
  | 'soft'
  | 'coffee'
  | 'chocolate'
  | 'fruit'
  | 'cheese'
  | 'smoky';
export type Mood =
  | 'happy'
  | 'tired'
  | 'stressed'
  | 'excited'
  | 'anxious'
  | 'calm'
  | 'sad'
  | 'romantic'
  | 'focus'
  | 'party'
  | 'nostalgic'
  | 'treat'
  | 'comfort'
  | 'refresh'
  | 'reward'
  | 'energize'
  | 'warmUp'
  | 'coolDown';
export type HealthFocus =
  | 'lowCal'
  | 'highProtein'
  | 'lowSodium'
  | 'highCalcium'
  | 'lowFat'
  | 'lowCarb'
  | 'caffeinated'
  | 'none';
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'auto';

export interface RecommendRequest {
  ageRange: AgeRange;
  occupation: Occupation;
  flavorPrefs: FlavorPref[];
  moods: Mood[];
  healthFocus?: HealthFocus;
  mealTime?: MealTime;
  moodText?: string;
  topN?: number;
  excludeCategory?: string[];
}

export interface MealItem {
  productName: string;
  energyKcal: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  sodium: number;
  calcium: number;
}

export interface MealTags {
  category: string;
  mealTime: string;
  flavorTags: string[];
  ageFit: string[];
  occupationFit: string[];
  nutritionTags: string[];
  moodFit: string[];
  mainIngredient: string;
  note?: string;
}

export interface ScoredMeal {
  productName: string;
  nutrition: MealItem;
  tags: MealTags;
  score: number;
  reasons: string[];
  matchedDimensions: string[];
}
