import './style.css';

/**
 * Watermelon Game - Main Entry Point
 *
 * This is the entry point for the watermelon game.
 * The game will be initialized here and the game loop will start.
 */

console.log('Watermelon Game - Starting...');

// Initialize the game
function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Set canvas dimensions
  canvas.width = 400;
  canvas.height = 600;

  console.log('Game initialized successfully');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
