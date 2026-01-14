/**
 * NewRecordAnimator
 * Handles celebration animation for new high scores
 */

import type { RecordParticle } from '@/types';
import { GAME_CONFIG } from '@/config/game';

/**
 * NewRecordAnimator class
 * Renders celebratory particle effects for new records
 */
export class NewRecordAnimator {
  private ctx: CanvasRenderingContext2D;
  private isAnimating: boolean = false;
  private startTime: number = 0;
  private particles: RecordParticle[] = [];
  private hasTriggered: boolean = false;

  private static readonly DURATION = 3000; // 3 seconds
  private static readonly PARTICLE_COUNT = 50;
  private static readonly COLORS = ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00CED1', '#7CFC00'];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Start the celebration animation
   */
  start(): void {
    if (this.hasTriggered) return;

    this.isAnimating = true;
    this.hasTriggered = true;
    this.startTime = performance.now();
    this.particles = this.createParticles();
  }

  /**
   * Create celebration particles
   */
  private createParticles(): RecordParticle[] {
    const particles: RecordParticle[] = [];
    const { width } = GAME_CONFIG;

    for (let i = 0; i < NewRecordAnimator.PARTICLE_COUNT; i++) {
      particles.push({
        x: width / 2,
        y: 155, // Near "NEW RECORD!" text
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 8 - 3,
        color: NewRecordAnimator.COLORS[Math.floor(Math.random() * NewRecordAnimator.COLORS.length)],
        size: Math.random() * 6 + 3,
        life: 1,
      });
    }

    return particles;
  }

  /**
   * Update and render particles
   */
  render(): void {
    if (!this.isAnimating) return;

    const now = performance.now();
    const elapsed = now - this.startTime;

    if (elapsed > NewRecordAnimator.DURATION) {
      this.isAnimating = false;
      return;
    }

    this.ctx.save();

    for (const particle of this.particles) {
      // Update particle physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.15; // Gravity
      particle.life = Math.max(0, 1 - elapsed / NewRecordAnimator.DURATION);

      // Render particle
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * Check if animation is active
   */
  isActive(): boolean {
    return this.isAnimating;
  }

  /**
   * Reset the animator for a new game
   */
  reset(): void {
    this.isAnimating = false;
    this.hasTriggered = false;
    this.particles = [];
  }
}
