import { clearCanvas, ctx } from './canvas';
import { drawEnemies, resetEnemies } from './enemies';
import { drawTaxi } from './taxi';

let lastTime = performance.now();
let gameOver = false;
let points = 0;

const drawPoints = () => {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Points: ${points}`, 10, 10);
  ctx.restore();
};

const showGameOverContainer = () => {
  const gameOverContainer = document.getElementById('game-over-container');
  gameOverContainer?.classList.remove('hidden');
};

const hideGameOverContainer = () => {
  const gameOverContainer = document.getElementById('game-over-container');
  gameOverContainer?.classList.add('hidden');
};

const resetGame = () => {
  console.log('Resetting game...');
  points = 0;
  gameOver = false;
  lastTime = performance.now();
  resetEnemies();
  hideGameOverContainer();
};

export const startGame = () => {
  console.log('Starting game...');

  const replayButton = document.getElementById('replay-button');
  console.log('Replay button:', replayButton);
  replayButton?.addEventListener('pointerdown', resetGame);

  const gameLoop = (currentTime: number): void => {
    clearCanvas();
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds for convenience
    lastTime = currentTime;

    if (!gameOver) {
      drawTaxi(deltaTime);
      gameOver = drawEnemies(deltaTime, (pts: number) => (points += pts));
      drawPoints();
    } else {
      drawTaxi(0);
      drawEnemies(0, (_pts: number) => {});
      drawPoints();
      showGameOverContainer();
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};
