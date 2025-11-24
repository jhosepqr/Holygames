import { Game } from './Game.js';

console.log('David vs Goliath v2.0 - Cache Bust');

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // Expose game to global scope for resize listener
    game.start();

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.game) {
            window.game.onWindowResize();
        }
    });
});
