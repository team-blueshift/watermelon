/**
 * UI Renderer
 * Handles DOM-based UI updates (score, next fruit preview, etc.)
 */

import { getFruitConfig } from '@/config/fruits';
import type { FruitLevel } from '@/types';

/**
 * UIRenderer class
 * Updates HTML UI elements outside the canvas
 */
export class UIRenderer {
  private scoreElement: HTMLElement | null;
  private nextFruitPreview: HTMLElement | null;

  constructor() {
    this.scoreElement = document.getElementById('score');
    this.nextFruitPreview = document.getElementById('next-fruit-preview');
  }

  /**
   * Update score display
   */
  updateScore(score: number): void {
    if (this.scoreElement) {
      this.scoreElement.textContent = String(score);
    }
  }

  /**
   * Update next fruit preview
   */
  updateNextFruit(level: FruitLevel): void {
    if (!this.nextFruitPreview) return;

    const config = getFruitConfig(level);
    const size = Math.min(config.radius * 2, 40);

    this.nextFruitPreview.style.width = `${size}px`;
    this.nextFruitPreview.style.height = `${size}px`;
    this.nextFruitPreview.style.backgroundColor = config.color;
    this.nextFruitPreview.style.borderRadius = '50%';
    this.nextFruitPreview.style.border = `2px solid ${this.darkenColor(config.color, 20)}`;
    this.nextFruitPreview.style.display = 'flex';
    this.nextFruitPreview.style.alignItems = 'center';
    this.nextFruitPreview.style.justifyContent = 'center';
    this.nextFruitPreview.style.color = '#FFFFFF';
    this.nextFruitPreview.style.fontWeight = 'bold';
    this.nextFruitPreview.style.fontSize = `${Math.max(10, size / 3)}px`;
    this.nextFruitPreview.textContent = String(level);
  }

  /**
   * Show high score
   */
  showHighScore(highScore: number): void {
    let highScoreElement = document.getElementById('high-score');

    if (!highScoreElement) {
      // Create high score element if it doesn't exist
      const uiContainer = document.getElementById('ui-container');
      if (uiContainer) {
        const highScoreDiv = document.createElement('div');
        highScoreDiv.id = 'high-score-display';
        highScoreDiv.innerHTML = `<span>최고: </span><span id="high-score">${highScore}</span>`;
        uiContainer.appendChild(highScoreDiv);
        highScoreElement = document.getElementById('high-score');
      }
    }

    if (highScoreElement) {
      highScoreElement.textContent = String(highScore);
    }
  }

  /**
   * Clear next fruit preview
   */
  clearNextFruit(): void {
    if (this.nextFruitPreview) {
      this.nextFruitPreview.style.display = 'none';
      this.nextFruitPreview.textContent = '';
    }
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
}
