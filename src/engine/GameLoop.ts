/**
 * Game Loop
 * Manages the main game loop with fixed timestep physics
 */

import { FIXED_DELTA, TARGET_FPS } from '@/config/game';

/**
 * Game loop callback type
 */
export type GameLoopCallback = (delta: number) => void;

/**
 * GameLoop class
 * Handles requestAnimationFrame-based game loop
 */
export class GameLoop {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;

  private onUpdate: GameLoopCallback | null = null;
  private onRender: GameLoopCallback | null = null;

  /**
   * Set update callback (called with fixed timestep)
   */
  setOnUpdate(callback: GameLoopCallback): void {
    this.onUpdate = callback;
  }

  /**
   * Set render callback (called every frame)
   */
  setOnRender(callback: GameLoopCallback): void {
    this.onRender = callback;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pause the game loop
   */
  pause(): void {
    this.stop();
  }

  /**
   * Resume the game loop
   */
  resume(): void {
    if (!this.isRunning) {
      this.lastTime = performance.now();
      this.start();
    }
  }

  /**
   * Check if the loop is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Main loop function
   */
  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    const frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap frame time to prevent spiral of death
    const cappedFrameTime = Math.min(frameTime, 1000 / TARGET_FPS * 4);
    this.accumulator += cappedFrameTime;

    // Fixed timestep updates
    while (this.accumulator >= FIXED_DELTA) {
      if (this.onUpdate) {
        this.onUpdate(FIXED_DELTA);
      }
      this.accumulator -= FIXED_DELTA;
    }

    // Render
    if (this.onRender) {
      this.onRender(frameTime);
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Get current FPS (approximate)
   */
  getCurrentFPS(): number {
    return TARGET_FPS;
  }

  /**
   * Reset the game loop state
   */
  reset(): void {
    this.stop();
    this.lastTime = 0;
    this.accumulator = 0;
  }

  /**
   * Destroy the game loop
   */
  destroy(): void {
    this.stop();
    this.onUpdate = null;
    this.onRender = null;
  }
}
