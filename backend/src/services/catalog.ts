import { readFileSync } from 'fs';
import { join } from 'path';
import type { MealItem, MealTags } from '../types';

const DATA_DIR = join(__dirname, '..', '..', '..', 'data');

let cachedMeals: MealItem[] | null = null;
let cachedTags: Record<string, MealTags> | null = null;

export function loadMeals(): MealItem[] {
  if (cachedMeals) return cachedMeals;
  const raw = readFileSync(join(DATA_DIR, 'meals-nutrition.json'), 'utf-8');
  cachedMeals = JSON.parse(raw) as MealItem[];
  return cachedMeals;
}

export function loadTags(): Record<string, MealTags> {
  if (cachedTags) return cachedTags;
  const raw = readFileSync(join(DATA_DIR, 'meals-tags.json'), 'utf-8');
  cachedTags = JSON.parse(raw) as Record<string, MealTags>;
  return cachedTags;
}

/**
 * 把餐品营养数据和标签数据合并为一张表
 */
export function loadMealCatalog(): Array<{ nutrition: MealItem; tags: MealTags }> {
  const meals = loadMeals();
  const tags = loadTags();
  const catalog: Array<{ nutrition: MealItem; tags: MealTags }> = [];

  for (const meal of meals) {
    const t = tags[meal.productName];
    if (!t) continue;
    catalog.push({ nutrition: meal, tags: t });
  }

  return catalog;
}
