/**
 * Type definitions for the Watermelon Game
 */

import type Matter from 'matter-js';

/**
 * Game state types
 */
export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

/**
 * Fruit levels (1-11)
 */
export type FruitLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Droppable fruit levels (1-5)
 */
export type DroppableFruitLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Fruit configuration
 */
export interface FruitConfig {
  name: string;
  nameKo: string;
  radius: number;
  color: string;
  droppable: boolean;
}

/**
 * Game context - tracks current game state
 */
export interface GameContext {
  state: GameState;
  score: number;
  currentFruit: FruitLevel;
  nextFruit: FruitLevel;
  canDrop: boolean;
}

/**
 * Physics configuration
 */
export interface PhysicsConfig {
  gravity: number;
  gravityScale: number;
  fruit: {
    friction: number;
    frictionAir: number;
    restitution: number;
    density: number;
    slop: number;
  };
  wall: {
    isStatic: boolean;
    friction: number;
    restitution: number;
  };
}

/**
 * Game configuration
 */
export interface GameConfig {
  width: number;
  height: number;
  wallThickness: number;
  deadlineY: number;
  dropY: number;
  dropCooldown: number;
  deadlineGracePeriod: number;
}

/**
 * Extended Matter.Body with custom fruit data
 */
export interface FruitBody extends Matter.Body {
  plugin: {
    fruitLevel: FruitLevel;
  };
}

/**
 * Type guard to check if a body is a fruit
 */
export function isFruitBody(body: Matter.Body): body is FruitBody {
  return body.label?.startsWith('fruit_') ?? false;
}

/**
 * Collision pair data
 */
export interface CollisionPair {
  bodyA: Matter.Body;
  bodyB: Matter.Body;
}

/**
 * Merge event data
 */
export interface MergeEvent {
  level: FruitLevel;
  x: number;
  y: number;
  score: number;
}
