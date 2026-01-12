/**
 * Fruit configuration and scoring system
 * Based on specs/fruits-and-scoring.md
 */

import type { FruitConfig, FruitLevel, DroppableFruitLevel } from '@/types';

/**
 * Fruit level constants
 */
export const FRUIT_LEVELS = {
  CHERRY: 1,
  STRAWBERRY: 2,
  GRAPE: 3,
  DEKOPON: 4,
  PERSIMMON: 5,
  APPLE: 6,
  PEAR: 7,
  PEACH: 8,
  PINEAPPLE: 9,
  MELON: 10,
  WATERMELON: 11,
} as const;

/**
 * Fruit configuration map
 * Maps fruit level to its properties (name, radius, color, droppability)
 */
export const FRUIT_CONFIG: Record<FruitLevel, FruitConfig> = {
  1: {
    name: 'cherry',
    nameKo: '체리',
    radius: 25,
    color: '#E53935',
    droppable: true,
  },
  2: {
    name: 'strawberry',
    nameKo: '딸기',
    radius: 35,
    color: '#D81B60',
    droppable: true,
  },
  3: {
    name: 'grape',
    nameKo: '포도',
    radius: 48,
    color: '#8E24AA',
    droppable: true,
  },
  4: {
    name: 'dekopon',
    nameKo: '한라봉',
    radius: 60,
    color: '#FF9800',
    droppable: true,
  },
  5: {
    name: 'persimmon',
    nameKo: '감',
    radius: 75,
    color: '#EF6C00',
    droppable: true,
  },
  6: {
    name: 'apple',
    nameKo: '사과',
    radius: 88,
    color: '#C62828',
    droppable: false,
  },
  7: {
    name: 'pear',
    nameKo: '배',
    radius: 102,
    color: '#C0CA33',
    droppable: false,
  },
  8: {
    name: 'peach',
    nameKo: '복숭아',
    radius: 118,
    color: '#FFAB91',
    droppable: false,
  },
  9: {
    name: 'pineapple',
    nameKo: '파인애플',
    radius: 135,
    color: '#FFD54F',
    droppable: false,
  },
  10: {
    name: 'melon',
    nameKo: '멜론',
    radius: 155,
    color: '#66BB6A',
    droppable: false,
  },
  11: {
    name: 'watermelon',
    nameKo: '수박',
    radius: 180,
    color: '#43A047',
    droppable: false,
  },
};

/**
 * Score table for each fruit level
 * Index corresponds to the resulting fruit level after merge
 * Formula: n × (n + 1) / 2 (triangular number)
 */
export const SCORE_TABLE: number[] = [
  0, // Level 0 (not used)
  1, // Cherry + Cherry → Strawberry (level 2) = 1 point
  3, // Strawberry + Strawberry → Grape (level 3) = 3 points
  6, // Grape + Grape → Dekopon (level 4) = 6 points
  10, // Dekopon + Dekopon → Persimmon (level 5) = 10 points
  15, // Persimmon + Persimmon → Apple (level 6) = 15 points
  21, // Apple + Apple → Pear (level 7) = 21 points
  28, // Pear + Pear → Peach (level 8) = 28 points
  36, // Peach + Peach → Pineapple (level 9) = 36 points
  45, // Pineapple + Pineapple → Melon (level 10) = 45 points
  55, // Melon + Melon → Watermelon (level 11) = 55 points
  66, // Watermelon + Watermelon → Vanish = 66 points
];

/**
 * Droppable fruit levels (1-5)
 * Only these fruits can be randomly dropped by the player
 */
export const DROPPABLE_LEVELS: readonly DroppableFruitLevel[] = [1, 2, 3, 4, 5];

/**
 * Get a random droppable fruit level
 * Each fruit has equal probability (20%)
 */
export function getRandomDroppableFruit(): DroppableFruitLevel {
  const index = Math.floor(Math.random() * DROPPABLE_LEVELS.length);
  return DROPPABLE_LEVELS[index];
}

/**
 * Calculate score for merging fruits
 * @param resultLevel - The level of the fruit created by the merge
 * @returns Score points for this merge
 */
export function calculateMergeScore(resultLevel: FruitLevel): number {
  return SCORE_TABLE[resultLevel] ?? 0;
}

/**
 * Get fruit configuration by level
 * @param level - Fruit level (1-11)
 * @returns Fruit configuration
 */
export function getFruitConfig(level: FruitLevel): FruitConfig {
  return FRUIT_CONFIG[level];
}

/**
 * Check if a fruit level is droppable
 * @param level - Fruit level
 * @returns True if the fruit can be dropped
 */
export function isDroppable(level: FruitLevel): boolean {
  return FRUIT_CONFIG[level].droppable;
}
