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
   * Render start screen overlay
   */
  renderStartScreen(): void {
    const { width, height } = GAME_CONFIG;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, width, height);

    // Title with shadow
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 3;

    this.ctx.fillStyle = '#4CAF50';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('수박게임', width / 2, height / 2 - 80);
    this.ctx.restore();

    // Subtitle
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Watermelon Game', width / 2, height / 2 - 30);

    // Instructions box
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.roundRect(width / 2 - 140, height / 2 + 10, 280, 100, 10);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('마우스/터치: 좌우 이동', width / 2, height / 2 + 40);
    this.ctx.fillText('클릭/Space: 과일 떨어뜨리기', width / 2, height / 2 + 65);
    this.ctx.fillText('같은 과일을 합쳐 수박을 만드세요!', width / 2, height / 2 + 90);

    // Start button
    this.ctx.fillStyle = '#4CAF50';
    this.roundRect(width / 2 - 80, height / 2 + 130, 160, 50, 8);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('게임 시작', width / 2, height / 2 + 155);
  }

  /**
   * Render game over overlay
   */
  renderGameOver(score: number, highScore: number): void {
    const { width, height } = GAME_CONFIG;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, width, height);

    // Game Over title with effect
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
    this.ctx.shadowBlur = 15;

    this.ctx.fillStyle = '#FF5252';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('GAME OVER', width / 2, height / 2 - 100);
    this.ctx.restore();

    // Score panel
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.roundRect(width / 2 - 100, height / 2 - 50, 200, 100, 10);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${score}점`, width / 2, height / 2 - 15);

    // High score indicator
    const isNewHighScore = score >= highScore && score > 0;
    if (isNewHighScore) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = '18px Arial';
      this.ctx.fillText('NEW RECORD!', width / 2, height / 2 + 25);
    } else {
      this.ctx.fillStyle = '#AAAAAA';
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`최고 기록: ${highScore}점`, width / 2, height / 2 + 25);
    }

    // Restart button
    this.ctx.fillStyle = '#4CAF50';
    this.roundRect(width / 2 - 90, height / 2 + 70, 180, 50, 8);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('다시 시작 (R)', width / 2, height / 2 + 95);
  }

  /**
   * Helper method for rounded rectangles
   */
  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
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
