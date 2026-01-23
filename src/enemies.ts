import { assets } from './assets';
import { drawImage } from './drawing';

const image = assets.ennemiesImg;
const ennemiesSpriteWidth = 260;

export const drawEnemies = () => {
  // draw ennemy 1
  const ennemy1X = 200;
  const ennemy1Y = 200;

  // Draw the enemy sprite
  drawImage(image, ennemy1X, ennemy1Y, 0, ennemiesSpriteWidth);
};
