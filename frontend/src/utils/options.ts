import type {
  AgeRange,
  Occupation,
  FlavorPref,
  Mood,
  HealthFocus,
  MealTime,
} from '@/types';

export interface OptionItem {
  value: string;
  label: string;
  emoji: string;
}

export const AGE_OPTIONS: OptionItem[] = [
  { value: 'kid', label: '儿童 (<12岁)', emoji: '🧒' },
  { value: 'teen', label: '青少年 (12-18)', emoji: '🧑‍🎓' },
  { value: 'young', label: '青年 (18-30)', emoji: '👨‍💻' },
  { value: 'middle', label: '中年 (30-50)', emoji: '👨‍💼' },
  { value: 'senior', label: '老年 (50+)', emoji: '👵' },
];

export const OCCUPATION_OPTIONS: OptionItem[] = [
  { value: 'student', label: '学生', emoji: '📚' },
  { value: 'programmer', label: '程序员 / 工程师', emoji: '💻' },
  { value: 'officeWorker', label: '白领 / 文职', emoji: '👔' },
  { value: 'fitness', label: '健身爱好者', emoji: '💪' },
  { value: 'laborer', label: '体力劳动者', emoji: '🛠️' },
  { value: 'pregnant', label: '孕妈', emoji: '🤰' },
  { value: 'elderly', label: '退休人士', emoji: '🌳' },
];

export const FLAVOR_OPTIONS: OptionItem[] = [
  { value: 'sweet', label: '甜', emoji: '🍯' },
  { value: 'salty', label: '咸', emoji: '🧂' },
  { value: 'spicy', label: '辣', emoji: '🌶️' },
  { value: 'sour', label: '酸', emoji: '🍋' },
  { value: 'light', label: '清淡', emoji: '🥗' },
  { value: 'rich', label: '浓郁', emoji: '🧈' },
  { value: 'cold', label: '冰爽', emoji: '🧊' },
  { value: 'hot', label: '暖热', emoji: '🔥' },
  { value: 'crispy', label: '酥脆', emoji: '🍘' },
  { value: 'soft', label: '软糯', emoji: '🍡' },
  { value: 'coffee', label: '咖啡味', emoji: '☕' },
  { value: 'chocolate', label: '巧克力', emoji: '🍫' },
  { value: 'fruit', label: '水果', emoji: '🍓' },
  { value: 'cheese', label: '芝士', emoji: '🧀' },
  { value: 'smoky', label: '烟熏', emoji: '🥓' },
];

export const MOOD_OPTIONS: OptionItem[] = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'stressed', label: '焦虑', emoji: '😣' },
  { value: 'sad', label: '沮丧', emoji: '😔' },
  { value: 'focus', label: '需要专注', emoji: '🎯' },
  { value: 'comfort', label: '需要治愈', emoji: '🫂' },
  { value: 'treat', label: '想要小确幸', emoji: '🎁' },
  { value: 'reward', label: '想犒赏自己', emoji: '🏆' },
  { value: 'refresh', label: '想要清爽', emoji: '🌿' },
  { value: 'energize', label: '需要提神', emoji: '⚡' },
  { value: 'warmUp', label: '想暖胃', emoji: '🔥' },
  { value: 'nostalgic', label: '怀旧', emoji: '📼' },
  { value: 'coolDown', label: '想降温', emoji: '❄️' },
];

export const HEALTH_OPTIONS: OptionItem[] = [
  { value: 'none', label: '无特殊', emoji: '✖️' },
  { value: 'lowCal', label: '控卡', emoji: '🥬' },
  { value: 'highProtein', label: '高蛋白', emoji: '🥩' },
  { value: 'lowSodium', label: '低钠', emoji: '🧂' },
  { value: 'highCalcium', label: '补钙', emoji: '🦴' },
  { value: 'lowFat', label: '低脂', emoji: '🥗' },
  { value: 'lowCarb', label: '低碳水', emoji: '🍞' },
  { value: 'caffeinated', label: '要含咖啡因', emoji: '☕' },
];

export const MEAL_TIME_OPTIONS: OptionItem[] = [
  { value: 'auto', label: '自动（按当前时间）', emoji: '🕐' },
  { value: 'breakfast', label: '早餐', emoji: '🌅' },
  { value: 'lunch', label: '午餐', emoji: '🌞' },
  { value: 'dinner', label: '晚餐', emoji: '🌙' },
  { value: 'snack', label: '加餐/夜宵', emoji: '🌃' },
];

export type { AgeRange, Occupation, FlavorPref, Mood, HealthFocus, MealTime };
