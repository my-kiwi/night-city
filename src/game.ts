import { drawTaxi } from './drawing';

export const startGame = () => {
  console.log('Starting game...');

  const gameLoop = () => {
    drawTaxi();

    requestAnimationFrame(gameLoop);
  };

  gameLoop();
};
