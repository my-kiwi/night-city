import { clearCanvas } from './canvas';
import { drawEnemies, resetEnemies } from './enemies';
import {
  drawTaxi,
  resetTaxiPosition,
  activateBackupGun,
  hasBackupGun,
  resetBackupGun,
} from './taxi';

let lastTime = performance.now();
let gameOver = false;
let hasHandledGameOver = false;
let points = 0;
let bestScore = 0;
let deaths = 0;
let invincibilityEndTime = 0;
let scoreElement: HTMLElement | null = null;
let bestScoreElement: HTMLElement | null = null;
let deathsElement: HTMLElement | null = null;

const isInvincible = () => performance.now() / 1000 < invincibilityEndTime;

const updateScore = () => {
  if (scoreElement) {
    scoreElement.textContent = `Points: ${points}`;
  }
};

const updateBestScore = () => {
  if (bestScoreElement) {
    bestScoreElement.textContent = `Best: ${bestScore}`;
  }
};

const updateDeaths = () => {
  if (deathsElement) {
    deathsElement.textContent = `Deaths: ${deaths}`;
  }
};

const loadFromLocalStorage = () => {
  const storedBestScore = localStorage.getItem('nightCityBestScore');
  const storedDeaths = localStorage.getItem('nightCityDeaths');
  if (storedBestScore) {
    bestScore = parseInt(storedBestScore, 10);
  }
  if (storedDeaths) {
    deaths = parseInt(storedDeaths, 10);
  }
};

const saveToLocalStorage = () => {
  localStorage.setItem('nightCityBestScore', bestScore.toString());
  localStorage.setItem('nightCityDeaths', deaths.toString());
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
  hasHandledGameOver = false;
  invincibilityEndTime = 0;
  lastTime = performance.now();
  resetEnemies();
  resetTaxiPosition();
  resetBackupGun();
  hideGameOverContainer();
  updateScore();
};

export const startGame = () => {
  scoreElement = document.getElementById('score');
  bestScoreElement = document.getElementById('best-score');
  deathsElement = document.getElementById('deaths');

  loadFromLocalStorage();
  updateScore();
  updateBestScore();
  updateDeaths();

  const replayButton = document.getElementById('replay-button');
  replayButton?.addEventListener('pointerdown', resetGame);

  const gameLoop = (currentTime: number): void => {
    clearCanvas();
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds for convenience
    lastTime = currentTime;

    if (!gameOver) {
      drawTaxi(deltaTime, isInvincible());
      gameOver = drawEnemies(
        deltaTime,
        (type) => {
          if (type === 'enemy') {
            points += 10;
          } else if (type === 'points') {
            points += 20;
          } else if (type === 'invincibility') {
            invincibilityEndTime = performance.now() / 1000 + 10;
          } else if (type === 'powered') {
            activateBackupGun();
          }
        },
        isInvincible(),
        hasBackupGun
      );
      updateScore();
      if (gameOver && !hasHandledGameOver) {
        hasHandledGameOver = true;
        // Update best score and deaths on game over
        if (points > bestScore) {
          bestScore = points;
          updateBestScore();
        }
        deaths++;
        updateDeaths();
        saveToLocalStorage();
      }
    } else {
      drawTaxi(0, isInvincible());
      drawEnemies(0, (_type) => {}, isInvincible(), hasBackupGun);
      updateScore();
      showGameOverContainer();
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};
