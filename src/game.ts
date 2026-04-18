import { canvas, clearCanvas, ctx } from './canvas';
import { drawEnemies } from './enemies';
import { drawTaxi } from './taxi';

let lastTime = performance.now();
let gameOver = false;

const drawGameOver = () => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ff5c5c';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

  ctx.restore();
};

export const startGame = () => {
  console.log('Starting game...');

  const gameLoop = (currentTime: number): void => {
    clearCanvas();
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds for convenience
    lastTime = currentTime;

    if (!gameOver) {
      drawTaxi(deltaTime);
      gameOver = drawEnemies(deltaTime);
    } else {
      drawTaxi(0);
      drawEnemies(0);
      drawGameOver();
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};
