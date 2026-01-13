/**
 * Game configuration and constants
 * Based on specs/game-rules.md and specs/implementation-guide.md
 */

import type { GameConfig } from '@/types';

/**
 * Main game configuration
 */
export const GAME_CONFIG: GameConfig = {
  /**
   * Game area dimensions
   */
  width: 450, // Game area width in pixels
  height: 600, // Game area height in pixels

  /**
   * Wall thickness for boundaries
   */
  wallThickness: 20,

  /**
   * Deadline Y coordinate (game over line)
   * Fruits that cross this line for too long will trigger game over
   */
  deadlineY: 100,

  /**
   * Drop Y coordinate (where fruits spawn)
   * Fruits are spawned at this Y position when dropped
   */
  dropY: 80,

  /**
   * Drop cooldown in milliseconds
   * Prevents rapid consecutive drops
   */
  dropCooldown: 500,

  /**
   * Deadline grace period in milliseconds
   * Time allowed for fruits above the deadline before game over
   */
  deadlineGracePeriod: 2000, // 2 seconds
};

/**
 * Target frames per second for the game loop
 */
export const TARGET_FPS = 60;

/**
 * Fixed time step for physics simulation
 * Ensures consistent physics regardless of frame rate
 */
export const FIXED_DELTA = 1000 / TARGET_FPS;

/**
 * Game state transitions
 */
export const GAME_STATES = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
} as const;

/**
 * Input keybindings
 */
export const KEYBINDINGS = {
  DROP: ['Space', 'Enter'],
  MOVE_LEFT: ['ArrowLeft', 'KeyA'],
  MOVE_RIGHT: ['ArrowRight', 'KeyD'],
  PAUSE: ['KeyP', 'Escape'],
  RESTART: ['KeyR'],
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  HIGH_SCORE: 'watermelon_high_score',
  SETTINGS: 'watermelon_settings',
} as const;

/**
 * Asset paths
 */
export const ASSET_PATHS = {
  FRUITS: '/assets/fruits',
  SOUNDS: '/assets/sounds',
} as const;

/**
 * Sound file names
 */
export const SOUNDS = {
  DROP: 'drop.mp3',
  MERGE: 'merge.mp3',
  GAME_OVER: 'gameover.mp3',
  BGM: 'bgm.mp3',
} as const;

/**
 * Get the highest droppable fruit radius
 * Used for clamping drop position
 */
export function getMaxDroppableRadius(): number {
  // Level 5 (Persimmon) is the largest droppable fruit at 49px (scaled)
  return 49;
}

/**
 * Calculate valid drop X range for a specific fruit radius
 * @param fruitRadius - Radius of the current fruit
 * @returns [minX, maxX] - Valid X coordinate range for dropping this fruit
 */
export function getDropXRangeForFruit(fruitRadius: number): [number, number] {
  const minX = GAME_CONFIG.wallThickness + fruitRadius;
  const maxX = GAME_CONFIG.width - GAME_CONFIG.wallThickness - fruitRadius;
  return [minX, maxX];
}

/**
 * Calculate valid drop X range (legacy, uses max droppable radius)
 * @returns [minX, maxX] - Valid X coordinate range for dropping fruits
 */
export function getDropXRange(): [number, number] {
  return getDropXRangeForFruit(getMaxDroppableRadius());
}

/**
 * Clamp X coordinate to valid drop range
 * @param x - X coordinate to clamp
 * @param fruitRadius - Optional radius of the current fruit (defaults to max droppable)
 * @returns Clamped X coordinate
 */
export function clampDropX(x: number, fruitRadius?: number): number {
  const radius = fruitRadius ?? getMaxDroppableRadius();
  const [minX, maxX] = getDropXRangeForFruit(radius);
  return Math.max(minX, Math.min(maxX, x));
}
