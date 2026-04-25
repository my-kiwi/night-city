import { clearCanvas } from './canvas';
import { drawEnemies, resetEnemies } from './enemies';
import { drawTaxi, resetTaxiPosition } from './taxi';

let lastTime = performance.now();
let gameOver = false;
let points = 0;
let scoreElement: HTMLElement | null = null;

const updateScore = () => {
  if (scoreElement) {
    scoreElement.textContent = `Points: ${points}`;
  }
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
  points = 0;
  gameOver = false;
  lastTime = performance.now();
  resetEnemies();
  resetTaxiPosition();
  hideGameOverContainer();
  updateScore();
};

export const startGame = () => {
  scoreElement = document.getElementById('score');
  updateScore();

  const replayButton = document.getElementById('replay-button');
  replayButton?.addEventListener('pointerdown', resetGame);

  const gameLoop = (currentTime: number): void => {
    clearCanvas();
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds for convenience
    lastTime = currentTime;

    if (!gameOver) {
      drawTaxi(deltaTime);
      gameOver = drawEnemies(deltaTime, (pts: number) => (points += pts));
      updateScore();
    } else {
      drawTaxi(0);
      drawEnemies(0, (_pts: number) => {});
      updateScore();
      showGameOverContainer();
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};
