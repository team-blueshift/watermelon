import './style.css';
import { Game } from '@/game';

/**
 * Watermelon Game - Main Entry Point
 */

let game: Game | null = null;

function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Initialize the game
  game = new Game(canvas);

  console.log('Watermelon Game initialized');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
  }
});
