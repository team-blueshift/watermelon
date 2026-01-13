import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from './ScoreManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('ScoreManager', () => {
  let scoreManager: ScoreManager;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    scoreManager = new ScoreManager();
  });

  describe('initialization', () => {
    it('should initialize with zero score', () => {
      expect(scoreManager.getScore()).toBe(0);
    });

    it('should initialize with zero merge count', () => {
      expect(scoreManager.getMergeCount()).toBe(0);
    });

    it('should load high score from localStorage', () => {
      localStorageMock.setItem('watermelon_high_score', '100');
      const manager = new ScoreManager();
      expect(manager.getHighScore()).toBe(100);
    });

    it('should handle invalid localStorage value', () => {
      localStorageMock.setItem('watermelon_high_score', 'invalid');
      const manager = new ScoreManager();
      expect(manager.getHighScore()).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return complete score state', () => {
      const state = scoreManager.getState();
      expect(state).toEqual({
        current: 0,
        highScore: 0,
        mergeCount: 0,
      });
    });
  });

  describe('addMergeScore', () => {
    it('should add correct score for cherry + cherry -> strawberry (level 2)', () => {
      const points = scoreManager.addMergeScore(2);
      expect(points).toBe(1); // (2-1)*2/2 = 1
      expect(scoreManager.getScore()).toBe(1);
    });

    it('should add correct score for strawberry + strawberry -> grape (level 3)', () => {
      const points = scoreManager.addMergeScore(3);
      expect(points).toBe(3); // (3-1)*3/2 = 3
      expect(scoreManager.getScore()).toBe(3);
    });

    it('should add correct score for grape + grape -> dekopon (level 4)', () => {
      const points = scoreManager.addMergeScore(4);
      expect(points).toBe(6); // (4-1)*4/2 = 6
      expect(scoreManager.getScore()).toBe(6);
    });

    it('should add correct score for melon + melon -> watermelon (level 11)', () => {
      const points = scoreManager.addMergeScore(11);
      expect(points).toBe(55); // (11-1)*11/2 = 55
      expect(scoreManager.getScore()).toBe(55);
    });

    it('should accumulate scores correctly', () => {
      scoreManager.addMergeScore(2); // +1 (strawberry)
      scoreManager.addMergeScore(3); // +3 (grape)
      scoreManager.addMergeScore(4); // +6 (dekopon)
      expect(scoreManager.getScore()).toBe(10); // 1+3+6 = 10
    });

    it('should increment merge count', () => {
      scoreManager.addMergeScore(2);
      scoreManager.addMergeScore(3);
      expect(scoreManager.getMergeCount()).toBe(2);
    });

    it('should update high score when current exceeds it', () => {
      scoreManager.addMergeScore(11); // +55 (watermelon)
      expect(scoreManager.getHighScore()).toBe(55);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'watermelon_high_score',
        '55'
      );
    });

    it('should not update high score when current is lower', () => {
      localStorageMock.setItem('watermelon_high_score', '100');
      const manager = new ScoreManager();
      manager.addMergeScore(2); // +1
      expect(manager.getHighScore()).toBe(100);
    });
  });

  describe('addWatermelonBonus', () => {
    it('should add 66 points for watermelon vanish', () => {
      const points = scoreManager.addWatermelonBonus();
      expect(points).toBe(66);
      expect(scoreManager.getScore()).toBe(66);
    });

    it('should increment merge count', () => {
      scoreManager.addWatermelonBonus();
      expect(scoreManager.getMergeCount()).toBe(1);
    });

    it('should update high score', () => {
      scoreManager.addWatermelonBonus();
      expect(scoreManager.getHighScore()).toBe(66);
    });
  });

  describe('reset', () => {
    it('should reset current score to zero', () => {
      scoreManager.addMergeScore(11); // +55 (watermelon)
      scoreManager.reset();
      expect(scoreManager.getScore()).toBe(0);
    });

    it('should reset merge count to zero', () => {
      scoreManager.addMergeScore(2);
      scoreManager.addMergeScore(3);
      scoreManager.reset();
      expect(scoreManager.getMergeCount()).toBe(0);
    });

    it('should preserve high score after reset', () => {
      scoreManager.addMergeScore(11); // +55 (watermelon)
      scoreManager.reset();
      expect(scoreManager.getHighScore()).toBe(55);
    });
  });

  describe('clearHighScore', () => {
    it('should reset high score to zero', () => {
      scoreManager.addMergeScore(11);
      scoreManager.clearHighScore();
      expect(scoreManager.getHighScore()).toBe(0);
    });

    it('should remove high score from localStorage', () => {
      scoreManager.addMergeScore(11);
      scoreManager.clearHighScore();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'watermelon_high_score'
      );
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on score change', () => {
      const callback = vi.fn();
      scoreManager.subscribe(callback);
      scoreManager.addMergeScore(2); // +1 point (strawberry)
      expect(callback).toHaveBeenCalledWith({
        current: 1,
        highScore: 1,
        mergeCount: 1,
      });
    });

    it('should notify listeners on reset', () => {
      const callback = vi.fn();
      scoreManager.addMergeScore(2); // +1 point
      scoreManager.subscribe(callback);
      scoreManager.reset();
      expect(callback).toHaveBeenCalledWith({
        current: 0,
        highScore: 1,
        mergeCount: 0,
      });
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = scoreManager.subscribe(callback);
      unsubscribe();
      scoreManager.addMergeScore(2);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      scoreManager.subscribe(callback1);
      scoreManager.subscribe(callback2);
      scoreManager.addMergeScore(2);
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('score table verification (triangular numbers)', () => {
    it('should follow (n-1)*n/2 formula for result levels 2-11', () => {
      const expectedScores = [
        { level: 2, score: 1 }, // (2-1)*2/2 = 1
        { level: 3, score: 3 }, // (3-1)*3/2 = 3
        { level: 4, score: 6 }, // (4-1)*4/2 = 6
        { level: 5, score: 10 }, // (5-1)*5/2 = 10
        { level: 6, score: 15 }, // (6-1)*6/2 = 15
        { level: 7, score: 21 }, // (7-1)*7/2 = 21
        { level: 8, score: 28 }, // (8-1)*8/2 = 28
        { level: 9, score: 36 }, // (9-1)*9/2 = 36
        { level: 10, score: 45 }, // (10-1)*10/2 = 45
        { level: 11, score: 55 }, // (11-1)*11/2 = 55
      ];

      expectedScores.forEach(({ level, score }) => {
        const manager = new ScoreManager();
        const points = manager.addMergeScore(level as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11);
        expect(points).toBe(score);
      });
    });
  });
});
