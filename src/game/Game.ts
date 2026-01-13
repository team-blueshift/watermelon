/**
 * Game - Main game orchestrator
 * Integrates physics engine, renderer, score manager, and input handling
 */

import { PhysicsEngine, CollisionHandler, GameLoop, DeadlineChecker } from '@/engine';
import { CanvasRenderer, UIRenderer } from '@/renderer';
import { ScoreManager } from '@/managers';
import { GAME_CONFIG, clampDropX } from '@/config/game';
import { getRandomDroppableFruit, getFruitConfig } from '@/config/fruits';
import type { GameState, DroppableFruitLevel } from '@/types';

/**
 * Game class
 * Main orchestrator that ties all game systems together
 */
export class Game {
  // Core systems
  private physicsEngine: PhysicsEngine;
  private collisionHandler: CollisionHandler;
  private deadlineChecker: DeadlineChecker;
  private gameLoop: GameLoop;
  private canvasRenderer: CanvasRenderer;
  private uiRenderer: UIRenderer;
  private scoreManager: ScoreManager;

  // Game state
  private state: GameState = 'READY';
  private currentFruit: DroppableFruitLevel;
  private nextFruit: DroppableFruitLevel;
  private canDrop: boolean = true;
  private dropX: number;
  private lastDropTime: number = 0;
  private dropCooldownTimer: ReturnType<typeof setTimeout> | null = null;

  // Canvas element
  private canvas: HTMLCanvasElement;

  // Event handler references for cleanup
  private handleMouseMove!: (e: MouseEvent) => void;
  private handleTouchMove!: (e: TouchEvent) => void;
  private handleCanvasClick!: () => void;
  private handleTouchEnd!: (e: TouchEvent) => void;
  private handleKeyDownEvent!: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Initialize systems
    this.physicsEngine = new PhysicsEngine();
    this.collisionHandler = new CollisionHandler(this.physicsEngine);
    this.deadlineChecker = new DeadlineChecker(this.physicsEngine);
    this.gameLoop = new GameLoop();
    this.canvasRenderer = new CanvasRenderer(canvas);
    this.uiRenderer = new UIRenderer();
    this.scoreManager = new ScoreManager();

    // Initialize fruit queue
    this.currentFruit = getRandomDroppableFruit();
    this.nextFruit = getRandomDroppableFruit();
    this.dropX = GAME_CONFIG.width / 2;

    // Setup callbacks
    this.setupCallbacks();

    // Setup input handlers
    this.setupInputHandlers();

    // Initial UI update
    this.updateUI();
  }

  /**
   * Setup all system callbacks
   */
  private setupCallbacks(): void {
    // Physics collision callback
    this.physicsEngine.setCallbacks({
      onCollision: (event) => {
        this.collisionHandler.handleCollision(event.bodyA, event.bodyB);
      },
    });

    // Merge callback - add score
    this.collisionHandler.setOnMerge((event) => {
      this.scoreManager.addMergeScore(event.level);
      this.canvasRenderer.renderMergeEffect(event.x, event.y, 30);
    });

    // Watermelon vanish callback
    this.collisionHandler.setOnWatermelonVanish((x, y) => {
      this.scoreManager.addWatermelonBonus();
      this.canvasRenderer.renderMergeEffect(x, y, 50);
    });

    // Deadline warning callback
    this.deadlineChecker.setOnWarning((isWarning) => {
      this.canvasRenderer.setOptions({ deadlineWarning: isWarning });
    });

    // Game over callback
    this.deadlineChecker.setOnGameOver(() => {
      this.gameOver();
    });

    // Game loop callbacks
    this.gameLoop.setOnUpdate((delta) => {
      this.update(delta);
    });

    this.gameLoop.setOnRender(() => {
      this.render();
    });

    // Score change callback
    this.scoreManager.subscribe((state) => {
      this.uiRenderer.updateScore(state.current);
    });
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers(): void {
    // Store handler references for cleanup
    this.handleMouseMove = (e: MouseEvent) => {
      if (this.state !== 'PLAYING') return;
      const rect = this.canvas.getBoundingClientRect();
      const currentRadius = getFruitConfig(this.currentFruit).radius;
      this.dropX = clampDropX(e.clientX - rect.left, currentRadius);
    };

    this.handleTouchMove = (e: TouchEvent) => {
      if (this.state !== 'PLAYING') return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const currentRadius = getFruitConfig(this.currentFruit).radius;
      this.dropX = clampDropX(touch.clientX - rect.left, currentRadius);
    };

    this.handleCanvasClick = () => {
      this.handleClick();
    };

    this.handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      this.handleClick();
    };

    this.handleKeyDownEvent = (e: KeyboardEvent) => {
      this.handleKeyDown(e);
    };

    // Add event listeners
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('click', this.handleCanvasClick);
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    document.addEventListener('keydown', this.handleKeyDownEvent);
  }

  /**
   * Handle click/tap
   */
  private handleClick(): void {
    if (this.state === 'READY') {
      this.start();
      return;
    }

    if (this.state === 'GAME_OVER') {
      this.restart();
      return;
    }

    if (this.state === 'PLAYING' && this.canDrop) {
      this.dropFruit();
    }
  }

  /**
   * Handle keyboard input
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (this.state === 'READY' && (e.code === 'Space' || e.code === 'Enter')) {
      this.start();
      return;
    }

    if (this.state === 'GAME_OVER' && e.code === 'KeyR') {
      this.restart();
      return;
    }

    if (this.state !== 'PLAYING') return;

    switch (e.code) {
      case 'Space':
      case 'Enter':
        if (this.canDrop) {
          this.dropFruit();
        }
        break;
      case 'ArrowLeft':
      case 'KeyA': {
        const leftRadius = getFruitConfig(this.currentFruit).radius;
        this.dropX = clampDropX(this.dropX - 10, leftRadius);
        break;
      }
      case 'ArrowRight':
      case 'KeyD': {
        const rightRadius = getFruitConfig(this.currentFruit).radius;
        this.dropX = clampDropX(this.dropX + 10, rightRadius);
        break;
      }
    }
  }

  /**
   * Start the game
   */
  start(): void {
    this.state = 'PLAYING';
    this.gameLoop.start();
  }

  /**
   * Drop the current fruit
   */
  private dropFruit(): void {
    const now = performance.now();
    if (now - this.lastDropTime < GAME_CONFIG.dropCooldown) {
      return;
    }

    // Create and drop fruit
    const fruit = this.physicsEngine.createFruit(
      this.dropX,
      GAME_CONFIG.dropY,
      this.currentFruit
    );
    this.physicsEngine.addBody(fruit);

    // Update fruit queue
    this.currentFruit = this.nextFruit;
    this.nextFruit = getRandomDroppableFruit();
    this.updateUI();

    // Set cooldown
    this.lastDropTime = now;
    this.canDrop = false;
    this.dropCooldownTimer = setTimeout(() => {
      this.canDrop = true;
      this.dropCooldownTimer = null;
    }, GAME_CONFIG.dropCooldown);
  }

  /**
   * Clear drop cooldown timer
   */
  private clearDropCooldownTimer(): void {
    if (this.dropCooldownTimer !== null) {
      clearTimeout(this.dropCooldownTimer);
      this.dropCooldownTimer = null;
    }
  }

  /**
   * Update game state
   */
  private update(delta: number): void {
    if (this.state !== 'PLAYING') return;

    this.physicsEngine.update(delta);
    this.deadlineChecker.check();
  }

  /**
   * Render the game
   */
  private render(): void {
    const fruits = this.physicsEngine.getFruits();

    if (this.state === 'PLAYING') {
      this.canvasRenderer.render(fruits, {
        x: this.dropX,
        level: this.currentFruit,
      });
    } else if (this.state === 'GAME_OVER') {
      this.canvasRenderer.render(fruits);
      this.canvasRenderer.renderGameOver(
        this.scoreManager.getScore(),
        this.scoreManager.getHighScore()
      );
    } else if (this.state === 'READY') {
      // Render empty state with preview
      this.canvasRenderer.render([], {
        x: this.dropX,
        level: this.currentFruit,
      });
      this.canvasRenderer.renderStartScreen();
    }
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    this.uiRenderer.updateScore(this.scoreManager.getScore());
    this.uiRenderer.updateNextFruit(this.nextFruit);
    this.uiRenderer.showHighScore(this.scoreManager.getHighScore());
  }

  /**
   * Handle game over
   */
  private gameOver(): void {
    this.state = 'GAME_OVER';
    this.gameLoop.stop();
  }

  /**
   * Restart the game
   */
  restart(): void {
    // Clear pending timers
    this.clearDropCooldownTimer();

    // Reset all systems
    this.physicsEngine.reset();
    this.collisionHandler.reset();
    this.deadlineChecker.reset();
    this.scoreManager.reset();

    // Reset game state
    this.currentFruit = getRandomDroppableFruit();
    this.nextFruit = getRandomDroppableFruit();
    this.dropX = GAME_CONFIG.width / 2;
    this.canDrop = true;
    this.lastDropTime = 0;

    // Update UI
    this.updateUI();

    // Restart game
    this.state = 'PLAYING';
    this.gameLoop.start();
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Destroy the game and cleanup resources
   */
  destroy(): void {
    // Clear pending timers
    this.clearDropCooldownTimer();

    // Remove event listeners
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('click', this.handleCanvasClick);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('keydown', this.handleKeyDownEvent);

    // Destroy subsystems
    this.gameLoop.destroy();
    this.physicsEngine.destroy();
    this.deadlineChecker.destroy();
  }
}
