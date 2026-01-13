import { describe, it, expect } from 'vitest';
import {
  FRUIT_LEVELS,
  FRUIT_CONFIG,
  SCORE_TABLE,
  DROPPABLE_LEVELS,
  getRandomDroppableFruit,
  calculateMergeScore,
  getFruitConfig,
  isDroppable,
} from './fruits';

describe('FRUIT_LEVELS', () => {
  it('should have all 11 fruit levels', () => {
    expect(Object.keys(FRUIT_LEVELS)).toHaveLength(11);
  });

  it('should have correct level values', () => {
    expect(FRUIT_LEVELS.CHERRY).toBe(1);
    expect(FRUIT_LEVELS.STRAWBERRY).toBe(2);
    expect(FRUIT_LEVELS.GRAPE).toBe(3);
    expect(FRUIT_LEVELS.DEKOPON).toBe(4);
    expect(FRUIT_LEVELS.PERSIMMON).toBe(5);
    expect(FRUIT_LEVELS.APPLE).toBe(6);
    expect(FRUIT_LEVELS.PEAR).toBe(7);
    expect(FRUIT_LEVELS.PEACH).toBe(8);
    expect(FRUIT_LEVELS.PINEAPPLE).toBe(9);
    expect(FRUIT_LEVELS.MELON).toBe(10);
    expect(FRUIT_LEVELS.WATERMELON).toBe(11);
  });
});

describe('FRUIT_CONFIG', () => {
  it('should have config for all 11 levels', () => {
    for (let level = 1; level <= 11; level++) {
      expect(FRUIT_CONFIG[level as keyof typeof FRUIT_CONFIG]).toBeDefined();
    }
  });

  it('should have increasing radius for each level', () => {
    let prevRadius = 0;
    for (let level = 1; level <= 11; level++) {
      const config = FRUIT_CONFIG[level as keyof typeof FRUIT_CONFIG];
      expect(config.radius).toBeGreaterThan(prevRadius);
      prevRadius = config.radius;
    }
  });

  it('should have correct radius values per spec', () => {
    expect(FRUIT_CONFIG[1].radius).toBe(25); // Cherry
    expect(FRUIT_CONFIG[2].radius).toBe(35); // Strawberry
    expect(FRUIT_CONFIG[3].radius).toBe(48); // Grape
    expect(FRUIT_CONFIG[4].radius).toBe(60); // Dekopon
    expect(FRUIT_CONFIG[5].radius).toBe(75); // Persimmon
    expect(FRUIT_CONFIG[6].radius).toBe(88); // Apple
    expect(FRUIT_CONFIG[7].radius).toBe(102); // Pear
    expect(FRUIT_CONFIG[8].radius).toBe(118); // Peach
    expect(FRUIT_CONFIG[9].radius).toBe(135); // Pineapple
    expect(FRUIT_CONFIG[10].radius).toBe(155); // Melon
    expect(FRUIT_CONFIG[11].radius).toBe(180); // Watermelon
  });

  it('should have droppable true only for levels 1-5', () => {
    for (let level = 1; level <= 5; level++) {
      expect(FRUIT_CONFIG[level as keyof typeof FRUIT_CONFIG].droppable).toBe(true);
    }
    for (let level = 6; level <= 11; level++) {
      expect(FRUIT_CONFIG[level as keyof typeof FRUIT_CONFIG].droppable).toBe(false);
    }
  });

  it('should have valid color codes', () => {
    for (let level = 1; level <= 11; level++) {
      const config = FRUIT_CONFIG[level as keyof typeof FRUIT_CONFIG];
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('should have both English and Korean names', () => {
    for (let level = 1; level <= 11; level++) {
      const config = FRUIT_CONFIG[level as keyof typeof FRUIT_CONFIG];
      expect(config.name).toBeTruthy();
      expect(config.nameKo).toBeTruthy();
    }
  });
});

describe('SCORE_TABLE', () => {
  it('should have 12 entries (0-11)', () => {
    expect(SCORE_TABLE).toHaveLength(12);
  });

  it('should have 0 for level 0 and 1 (unused/cherry)', () => {
    expect(SCORE_TABLE[0]).toBe(0);
    expect(SCORE_TABLE[1]).toBe(0); // Cherry cannot be created by merge
  });

  it('should follow formula (n-1)*n/2 for result levels 2-11', () => {
    for (let n = 2; n <= 11; n++) {
      const expected = ((n - 1) * n) / 2;
      expect(SCORE_TABLE[n]).toBe(expected);
    }
  });

  it('should have correct score values per spec', () => {
    expect(SCORE_TABLE[2]).toBe(1); // Cherry + Cherry → Strawberry
    expect(SCORE_TABLE[3]).toBe(3); // Strawberry + Strawberry → Grape
    expect(SCORE_TABLE[4]).toBe(6); // Grape + Grape → Dekopon
    expect(SCORE_TABLE[5]).toBe(10); // Dekopon + Dekopon → Persimmon
    expect(SCORE_TABLE[6]).toBe(15); // Persimmon + Persimmon → Apple
    expect(SCORE_TABLE[7]).toBe(21); // Apple + Apple → Pear
    expect(SCORE_TABLE[8]).toBe(28); // Pear + Pear → Peach
    expect(SCORE_TABLE[9]).toBe(36); // Peach + Peach → Pineapple
    expect(SCORE_TABLE[10]).toBe(45); // Pineapple + Pineapple → Melon
    expect(SCORE_TABLE[11]).toBe(55); // Melon + Melon → Watermelon
  });
});

describe('DROPPABLE_LEVELS', () => {
  it('should contain levels 1-5', () => {
    expect(DROPPABLE_LEVELS).toEqual([1, 2, 3, 4, 5]);
  });

  it('should have 5 entries', () => {
    expect(DROPPABLE_LEVELS).toHaveLength(5);
  });
});

describe('getRandomDroppableFruit', () => {
  it('should return a level between 1 and 5', () => {
    for (let i = 0; i < 100; i++) {
      const level = getRandomDroppableFruit();
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(5);
    }
  });

  it('should return all possible levels over many iterations', () => {
    const results = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      results.add(getRandomDroppableFruit());
    }
    expect(results.size).toBe(5);
    expect(results.has(1)).toBe(true);
    expect(results.has(2)).toBe(true);
    expect(results.has(3)).toBe(true);
    expect(results.has(4)).toBe(true);
    expect(results.has(5)).toBe(true);
  });
});

describe('calculateMergeScore', () => {
  it('should return correct score for each result level', () => {
    expect(calculateMergeScore(1)).toBe(0); // Cherry cannot be merge result
    expect(calculateMergeScore(2)).toBe(1); // Strawberry
    expect(calculateMergeScore(3)).toBe(3); // Grape
    expect(calculateMergeScore(4)).toBe(6); // Dekopon
    expect(calculateMergeScore(5)).toBe(10); // Persimmon
    expect(calculateMergeScore(6)).toBe(15); // Apple
    expect(calculateMergeScore(7)).toBe(21); // Pear
    expect(calculateMergeScore(8)).toBe(28); // Peach
    expect(calculateMergeScore(9)).toBe(36); // Pineapple
    expect(calculateMergeScore(10)).toBe(45); // Melon
    expect(calculateMergeScore(11)).toBe(55); // Watermelon
  });

  it('should return 0 for invalid level', () => {
    expect(calculateMergeScore(0 as never)).toBe(0);
    expect(calculateMergeScore(12 as never)).toBe(0);
  });
});

describe('getFruitConfig', () => {
  it('should return correct config for each level', () => {
    const cherryConfig = getFruitConfig(1);
    expect(cherryConfig.name).toBe('cherry');
    expect(cherryConfig.nameKo).toBe('체리');
    expect(cherryConfig.radius).toBe(25);

    const watermelonConfig = getFruitConfig(11);
    expect(watermelonConfig.name).toBe('watermelon');
    expect(watermelonConfig.nameKo).toBe('수박');
    expect(watermelonConfig.radius).toBe(180);
  });
});

describe('isDroppable', () => {
  it('should return true for levels 1-5', () => {
    expect(isDroppable(1)).toBe(true);
    expect(isDroppable(2)).toBe(true);
    expect(isDroppable(3)).toBe(true);
    expect(isDroppable(4)).toBe(true);
    expect(isDroppable(5)).toBe(true);
  });

  it('should return false for levels 6-11', () => {
    expect(isDroppable(6)).toBe(false);
    expect(isDroppable(7)).toBe(false);
    expect(isDroppable(8)).toBe(false);
    expect(isDroppable(9)).toBe(false);
    expect(isDroppable(10)).toBe(false);
    expect(isDroppable(11)).toBe(false);
  });
});
