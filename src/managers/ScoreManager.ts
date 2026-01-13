/**
 * Score Manager
 * Manages game score state, high score persistence, and score calculations
 */

import type { FruitLevel } from '@/types';
import { calculateMergeScore } from '@/config/fruits';
import { STORAGE_KEYS } from '@/config/game';

/**
 * Score state interface
 */
export interface ScoreState {
  current: number;
  highScore: number;
  mergeCount: number;
}

/**
 * Score event callback type
 */
export type ScoreEventCallback = (state: ScoreState) => void;

/**
 * ScoreManager class
 * Handles all score-related operations including persistence
 */
export class ScoreManager {
  private current: number = 0;
  private highScore: number = 0;
  private mergeCount: number = 0;
  private listeners: ScoreEventCallback[] = [];

  constructor() {
    this.loadHighScore();
  }

  /**
   * Get current score state
   */
  getState(): ScoreState {
    return {
      current: this.current,
      highScore: this.highScore,
      mergeCount: this.mergeCount,
    };
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.current;
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return this.highScore;
  }

  /**
   * Get total merge count
   */
  getMergeCount(): number {
    return this.mergeCount;
  }

  /**
   * Add score from a fruit merge
   * @param resultLevel - The level of the fruit created by the merge
   * @returns The points added
   */
  addMergeScore(resultLevel: FruitLevel): number {
    const points = calculateMergeScore(resultLevel);
    this.current += points;
    this.mergeCount++;

    // Update high score if current exceeds it
    if (this.current > this.highScore) {
      this.highScore = this.current;
      this.saveHighScore();
    }

    this.notifyListeners();
    return points;
  }

  /**
   * Add bonus score for watermelon vanish (수박 + 수박)
   * @returns The bonus points added (66 points)
   */
  addWatermelonBonus(): number {
    const bonusPoints = 66;
    this.current += bonusPoints;
    this.mergeCount++;

    if (this.current > this.highScore) {
      this.highScore = this.current;
      this.saveHighScore();
    }

    this.notifyListeners();
    return bonusPoints;
  }

  /**
   * Reset current score (for new game)
   */
  reset(): void {
    this.current = 0;
    this.mergeCount = 0;
    this.notifyListeners();
  }

  /**
   * Subscribe to score changes
   * @param callback - Function to call when score changes
   * @returns Unsubscribe function
   */
  subscribe(callback: ScoreEventCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Load high score from localStorage
   */
  private loadHighScore(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          this.highScore = parsed;
        }
      }
    } catch {
      // localStorage not available (SSR or private mode)
      this.highScore = 0;
    }
  }

  /**
   * Save high score to localStorage
   */
  private saveHighScore(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(this.highScore));
    } catch {
      // localStorage not available
    }
  }

  /**
   * Clear high score from localStorage
   */
  clearHighScore(): void {
    this.highScore = 0;
    try {
      localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
    } catch {
      // localStorage not available
    }
    this.notifyListeners();
  }

  /**
   * Notify all listeners of score change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((callback) => callback(state));
  }
}

/**
 * Singleton instance for global access
 */
let scoreManagerInstance: ScoreManager | null = null;

/**
 * Get or create ScoreManager singleton
 */
export function getScoreManager(): ScoreManager {
  if (!scoreManagerInstance) {
    scoreManagerInstance = new ScoreManager();
  }
  return scoreManagerInstance;
}
