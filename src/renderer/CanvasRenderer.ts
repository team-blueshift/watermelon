/**
 * Canvas Renderer
 * Renders game elements to HTML5 Canvas
 */

import { GAME_CONFIG } from '@/config/game';
import { getFruitConfig } from '@/config/fruits';
import type { FruitBody, FruitLevel } from '@/types';

/**
 * Render options
 */
export interface RenderOptions {
  showDeadline?: boolean;
  deadlineWarning?: boolean;
  backgroundColor?: string;
  wallColor?: string;
  deadlineColor?: string;
  warningColor?: string;
}

const DEFAULT_OPTIONS: Required<RenderOptions> = {
  showDeadline: true,
  deadlineWarning: false,
  backgroundColor: '#FFF8E1',
  wallColor: '#8D6E63',
  deadlineColor: 'rgba(255, 0, 0, 0.3)',
  warningColor: 'rgba(255, 0, 0, 0.6)',
};

/**
 * CanvasRenderer class
 * Handles all canvas rendering operations
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: Required<RenderOptions>;

  constructor(canvas: HTMLCanvasElement, options: RenderOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Set canvas size
    this.canvas.width = GAME_CONFIG.width;
    this.canvas.height = GAME_CONFIG.height;
  }

  /**
   * Update render options
   */
  setOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render all game elements
   */
  render(fruits: FruitBody[], dropPreview?: { x: number; level: FruitLevel }): void {
    this.clear();
    this.renderWalls();
    this.renderDeadline();
    this.renderFruits(fruits);
    if (dropPreview) {
      this.renderDropPreview(dropPreview.x, dropPreview.level);
    }
  }

  /**
   * Render walls
   */
  private renderWalls(): void {
    const { width, height, wallThickness } = GAME_CONFIG;
    this.ctx.fillStyle = this.options.wallColor;

    // Left wall
    this.ctx.fillRect(0, 0, wallThickness, height);

    // Right wall
    this.ctx.fillRect(width - wallThickness, 0, wallThickness, height);

    // Floor
    this.ctx.fillRect(0, height - wallThickness, width, wallThickness);
  }

  /**
   * Render deadline indicator
   */
  private renderDeadline(): void {
    if (!this.options.showDeadline) return;

    const { width, deadlineY, wallThickness } = GAME_CONFIG;

    // Deadline zone (above the line)
    this.ctx.fillStyle = this.options.deadlineWarning
      ? this.options.warningColor
      : this.options.deadlineColor;
    this.ctx.fillRect(wallThickness, 0, width - wallThickness * 2, deadlineY);

    // Deadline line
    this.ctx.strokeStyle = this.options.deadlineWarning ? '#FF0000' : '#FF6B6B';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(wallThickness, deadlineY);
    this.ctx.lineTo(width - wallThickness, deadlineY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Render all fruits
   */
  private renderFruits(fruits: FruitBody[]): void {
    for (const fruit of fruits) {
      this.renderFruit(fruit);
    }
  }

  /**
   * Render a single fruit
   */
  private renderFruit(fruit: FruitBody): void {
    const level = fruit.plugin.fruitLevel;
    const config = getFruitConfig(level);
    const { x, y } = fruit.position;
    const angle = fruit.angle;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Draw fruit circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, config.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = config.color;
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = this.darkenColor(config.color, 20);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw fruit level number (for debugging/clarity)
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `bold ${Math.max(12, config.radius / 2)}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(String(level), 0, 0);

    this.ctx.restore();
  }

  /**
   * Render drop preview (ghost fruit showing where it will drop)
   */
  private renderDropPreview(x: number, level: FruitLevel): void {
    const config = getFruitConfig(level);
    const y = GAME_CONFIG.dropY;

    this.ctx.save();
    this.ctx.globalAlpha = 0.5;

    // Draw preview circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, config.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = config.color;
    this.ctx.fill();

    // Draw drop line
    this.ctx.strokeStyle = config.color;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + config.radius);
    this.ctx.lineTo(x, GAME_CONFIG.height - GAME_CONFIG.wallThickness);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.restore();
  }

  /**
   * Render game over overlay
   */
  renderGameOver(score: number, highScore: number): void {
    const { width, height } = GAME_CONFIG;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, width, height);

    // Game Over text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('GAME OVER', width / 2, height / 2 - 60);

    // Score
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`점수: ${score}`, width / 2, height / 2);

    // High score
    this.ctx.fillText(`최고 점수: ${highScore}`, width / 2, height / 2 + 40);

    // Restart hint
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#AAAAAA';
    this.ctx.fillText('클릭하여 다시 시작', width / 2, height / 2 + 100);
  }

  /**
   * Render merge effect
   */
  renderMergeEffect(x: number, y: number, radius: number): void {
    this.ctx.save();

    // Expanding circle effect
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Darken a hex color
   */
  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get 2D context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
