/**
 * GameStatsManager
 * Tracks detailed gameplay statistics during a game session
 */

import type { FruitLevel, GameStats } from '@/types';

/**
 * GameStatsManager class
 * Collects and manages gameplay statistics
 */
export class GameStatsManager {
  private stats: GameStats;
  private gameStartTime: number = 0;

  constructor() {
    this.stats = this.createInitialStats();
  }

  /**
   * Create initial stats object
   */
  private createInitialStats(): GameStats {
    return {
      fruitsDropped: 0,
      mergesCompleted: 0,
      playTimeMs: 0,
      highestFruitLevel: 1,
    };
  }

  /**
   * Start tracking game time
   */
  startTracking(): void {
    this.gameStartTime = performance.now();
  }

  /**
   * Record a fruit drop
   */
  recordDrop(): void {
    this.stats.fruitsDropped++;
  }

  /**
   * Record a merge and update highest fruit level
   */
  recordMerge(resultLevel: FruitLevel): void {
    this.stats.mergesCompleted++;

    if (resultLevel > this.stats.highestFruitLevel) {
      this.stats.highestFruitLevel = resultLevel;
    }
  }

  /**
   * Finalize stats when game ends
   */
  finalizeStats(): GameStats {
    this.stats.playTimeMs = performance.now() - this.gameStartTime;
    return { ...this.stats };
  }

  /**
   * Get current stats
   */
  getStats(): GameStats {
    return { ...this.stats };
  }

  /**
   * Reset stats for a new game
   */
  reset(): void {
    this.stats = this.createInitialStats();
    this.gameStartTime = 0;
  }
}
