/**
 * Collision Handler
 * Manages fruit collision detection and merge logic
 */

import type Matter from 'matter-js';
import type { FruitBody, FruitLevel, MergeEvent } from '@/types';
import { isFruitBody } from '@/types';
import { FRUIT_LEVELS } from '@/config/fruits';
import type { PhysicsEngine } from './PhysicsEngine';

/**
 * Merge event callback type
 */
export type MergeCallback = (event: MergeEvent) => void;

/**
 * Watermelon vanish callback type
 */
export type WatermelonVanishCallback = (x: number, y: number) => void;

/**
 * CollisionHandler class
 * Handles fruit collisions and merge logic
 */
export class CollisionHandler {
  private physicsEngine: PhysicsEngine;
  private mergeQueue: Set<number> = new Set();
  private onMerge: MergeCallback | null = null;
  private onWatermelonVanish: WatermelonVanishCallback | null = null;

  constructor(physicsEngine: PhysicsEngine) {
    this.physicsEngine = physicsEngine;
  }

  /**
   * Set merge callback
   */
  setOnMerge(callback: MergeCallback): void {
    this.onMerge = callback;
  }

  /**
   * Set watermelon vanish callback
   */
  setOnWatermelonVanish(callback: WatermelonVanishCallback): void {
    this.onWatermelonVanish = callback;
  }

  /**
   * Handle collision event from physics engine
   */
  handleCollision(bodyA: Matter.Body, bodyB: Matter.Body): void {
    // Check if both bodies are fruits
    if (!isFruitBody(bodyA) || !isFruitBody(bodyB)) {
      return;
    }

    const fruitA = bodyA as FruitBody;
    const fruitB = bodyB as FruitBody;

    // Get fruit levels
    const levelA = fruitA.plugin.fruitLevel;
    const levelB = fruitB.plugin.fruitLevel;

    // Only merge if same level
    if (levelA !== levelB) {
      return;
    }

    // Check if already in merge queue (prevent double processing)
    if (this.mergeQueue.has(fruitA.id) || this.mergeQueue.has(fruitB.id)) {
      return;
    }

    // Add to merge queue
    this.mergeQueue.add(fruitA.id);
    this.mergeQueue.add(fruitB.id);

    // Process merge
    this.processMerge(fruitA, fruitB, levelA);
  }

  /**
   * Process fruit merge
   */
  private processMerge(fruitA: FruitBody, fruitB: FruitBody, level: FruitLevel): void {
    // Calculate merge position (midpoint)
    const mergeX = (fruitA.position.x + fruitB.position.x) / 2;
    const mergeY = (fruitA.position.y + fruitB.position.y) / 2;

    // Remove old fruits
    this.physicsEngine.removeBodies([fruitA, fruitB]);

    // Clear from merge queue
    this.mergeQueue.delete(fruitA.id);
    this.mergeQueue.delete(fruitB.id);

    // Handle watermelon + watermelon = vanish
    if (level === FRUIT_LEVELS.WATERMELON) {
      if (this.onWatermelonVanish) {
        this.onWatermelonVanish(mergeX, mergeY);
      }
      return;
    }

    // Create new fruit at higher level
    const newLevel = (level + 1) as FruitLevel;
    const newFruit = this.physicsEngine.createFruit(mergeX, mergeY, newLevel);
    this.physicsEngine.addBody(newFruit);

    // Emit merge event
    if (this.onMerge) {
      this.onMerge({
        level: newLevel,
        x: mergeX,
        y: mergeY,
        score: 0, // Score will be calculated by ScoreManager
      });
    }
  }

  /**
   * Check if a body is currently being processed for merge
   */
  isInMergeQueue(bodyId: number): boolean {
    return this.mergeQueue.has(bodyId);
  }

  /**
   * Clear the merge queue
   */
  clearMergeQueue(): void {
    this.mergeQueue.clear();
  }

  /**
   * Reset the handler
   */
  reset(): void {
    this.clearMergeQueue();
  }
}
