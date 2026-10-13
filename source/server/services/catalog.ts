import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import type { MealItem, MealTags } from '../types';

/**
 * 数据目录定位：兼容三种运行形态
 *   1. ts-node-dev 直跑源码  → source/server/services  ⇒ ../../data  = source/data
 *   2. 编译后跑 dist 产物     → source/server/dist/services ⇒ ../../../data = source/data
 *   3. 以 source/server 为 cwd ⇒ ./../data = source/data
 */
const DATA_DIR = (() => {
  const candidates = [
    join(__dirname, '..', '..', 'data'),
    join(__dirname, '..', '..', '..', 'data'),
    resolve(process.cwd(), '..', 'data'),
    resolve(process.cwd(), 'data'),
  ];
  return candidates.find((dir) => existsSync(join(dir, 'meals-nutrition.json'))) ?? candidates[0];
})();

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
 *
 * 说明：
 *   · 只有「同时具备营养数据 + 人工标签」的餐品才进入可推荐池
 *     （MCP 原始返回 152 条，其中 18 条仅饮品冰品无标签，另 2 条为重复行）
 *   · 按 productName 去重，避免同名餐品在 Top N 中重复占位
 */
export function loadMealCatalog(): Array<{ nutrition: MealItem; tags: MealTags }> {
  const meals = loadMeals();
  const tags = loadTags();
  const catalog: Array<{ nutrition: MealItem; tags: MealTags }> = [];
  const seen = new Set<string>();

  for (const meal of meals) {
    if (seen.has(meal.productName)) continue;
    const t = tags[meal.productName];
    if (!t) continue;
    seen.add(meal.productName);
    catalog.push({ nutrition: meal, tags: t });
  }

  return catalog;
}
