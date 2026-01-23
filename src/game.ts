import { clearCanvas } from './canvas';
import { drawTaxi } from './taxi';

let lastTime = performance.now();

export const startGame = () => {
  console.log('Starting game...');

  const gameLoop = (currentTime: number): void => {
    clearCanvas();
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds for convenience
    lastTime = currentTime;

    drawTaxi(deltaTime);

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};
