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
  width: 400, // Game area width in pixels
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
  // Level 5 (Persimmon) is the largest droppable fruit at 75px
  return 75;
}

/**
 * Calculate valid drop X range
 * @returns [minX, maxX] - Valid X coordinate range for dropping fruits
 */
export function getDropXRange(): [number, number] {
  const maxRadius = getMaxDroppableRadius();
  const minX = GAME_CONFIG.wallThickness + maxRadius;
  const maxX = GAME_CONFIG.width - GAME_CONFIG.wallThickness - maxRadius;
  return [minX, maxX];
}

/**
 * Clamp X coordinate to valid drop range
 * @param x - X coordinate to clamp
 * @returns Clamped X coordinate
 */
export function clampDropX(x: number): number {
  const [minX, maxX] = getDropXRange();
  return Math.max(minX, Math.min(maxX, x));
}
