import { canvas, clearCanvas, ctx } from './canvas';
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

const showReplayButton = () => {
  const replayButton = document.getElementById('replay-button');
  replayButton?.classList.remove('hidden');
};

const hideReplayButton = () => {
  const replayButton = document.getElementById('replay-button');
  replayButton?.classList.add('hidden');
};

const resetGame = () => {
  points = 0;
  gameOver = false;
  lastTime = performance.now();
  resetEnemies();
  hideReplayButton();
};

export const startGame = () => {
  console.log('Starting game...');

  const replayButton = document.getElementById('replay-button');
  replayButton?.addEventListener('click', resetGame);

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
      drawGameOver();
      showReplayButton();
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};
