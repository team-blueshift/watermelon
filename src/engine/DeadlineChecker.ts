/**
 * Deadline Checker
 * Monitors fruits crossing the deadline and triggers game over
 */

import { GAME_CONFIG } from '@/config/game';
import { getFruitConfig } from '@/config/fruits';
import type { FruitBody } from '@/types';
import type { PhysicsEngine } from './PhysicsEngine';

/**
 * Game over callback type
 */
export type GameOverCallback = () => void;

/**
 * Deadline warning callback type
 */
export type DeadlineWarningCallback = (isWarning: boolean) => void;

/**
 * DeadlineChecker class
 * Checks if fruits cross the deadline and triggers game over after grace period
 */
export class DeadlineChecker {
  private physicsEngine: PhysicsEngine;
  private deadlineTimer: ReturnType<typeof setTimeout> | null = null;
  private isInGracePeriod: boolean = false;

  private onGameOver: GameOverCallback | null = null;
  private onWarning: DeadlineWarningCallback | null = null;

  constructor(physicsEngine: PhysicsEngine) {
    this.physicsEngine = physicsEngine;
  }

  /**
   * Set game over callback
   */
  setOnGameOver(callback: GameOverCallback): void {
    this.onGameOver = callback;
  }

  /**
   * Set warning callback (called when grace period starts/ends)
   */
  setOnWarning(callback: DeadlineWarningCallback): void {
    this.onWarning = callback;
  }

  /**
   * Check if any fruit is over the deadline
   * Should be called every frame
   */
  check(): void {
    const fruits = this.physicsEngine.getFruits();
    const isOverDeadline = this.isAnyFruitOverDeadline(fruits);

    if (isOverDeadline) {
      this.startGracePeriod();
    } else {
      this.cancelGracePeriod();
    }
  }

  /**
   * Check if any fruit's top edge is above the deadline
   */
  private isAnyFruitOverDeadline(fruits: FruitBody[]): boolean {
    return fruits.some((fruit) => {
      const level = fruit.plugin.fruitLevel;
      const radius = getFruitConfig(level).radius;
      const fruitTop = fruit.position.y - radius;
      return fruitTop < GAME_CONFIG.deadlineY;
    });
  }

  /**
   * Start the grace period timer
   */
  private startGracePeriod(): void {
    if (this.deadlineTimer !== null) {
      // Timer already running
      return;
    }

    this.isInGracePeriod = true;
    if (this.onWarning) {
      this.onWarning(true);
    }

    this.deadlineTimer = setTimeout(() => {
      this.triggerGameOver();
    }, GAME_CONFIG.deadlineGracePeriod);
  }

  /**
   * Cancel the grace period timer
   */
  private cancelGracePeriod(): void {
    if (this.deadlineTimer === null) {
      return;
    }

    clearTimeout(this.deadlineTimer);
    this.deadlineTimer = null;
    this.isInGracePeriod = false;

    if (this.onWarning) {
      this.onWarning(false);
    }
  }

  /**
   * Trigger game over
   */
  private triggerGameOver(): void {
    this.deadlineTimer = null;
    this.isInGracePeriod = false;

    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  /**
   * Check if currently in grace period
   */
  getIsInGracePeriod(): boolean {
    return this.isInGracePeriod;
  }

  /**
   * Reset the checker
   */
  reset(): void {
    this.cancelGracePeriod();
  }

  /**
   * Destroy the checker
   */
  destroy(): void {
    this.cancelGracePeriod();
    this.onGameOver = null;
    this.onWarning = null;
  }
}
